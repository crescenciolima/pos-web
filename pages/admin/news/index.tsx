import React, { useEffect, useState } from 'react'

import AdminBase from '../../../components/admin/admin-base'
import { APIRoutes } from '../../../utils/api.routes'
import Link from 'next/link';
import API from '../../../lib/api.service';
import { APIResponse } from '../../../models/api-response';
import Loading from '../../../components/loading';
import ConfirmDialog from '../../../components/confirm-dialog';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { News } from '../../../models/news';
import { format } from 'date-fns';
import { GetServerSidePropsContext } from 'next';
import { UserType } from '../../../enum/type-user.enum';
import Permission from '../../../lib/permission.service';


export default function NewsLayout() {

  const [newsList, setNewsList] = useState<News[]>([]);
  const [selectedNews, setSelectedNews] = useState<News>({ title: "", text: "", coverURL: "", date: Date.now(), slug: "" });
  const [isLoading, setLoading] = useState<boolean>(true);
  const [openModal, setOpenModal] = useState<boolean>(false);

  const api = API(setLoading);

  useEffect(() => {

    api.get(APIRoutes.NEWS).then(
      (result: APIResponse) => {
        let newsList: News[] = result.result;
        for (let news of newsList) {
          try {
            news.dateString = format(new Date(news.date), 'dd/MM/yyyy')
          } catch (error) {
            news.dateString = "-"
          }
        }
        setNewsList(newsList);
      }
    )

  }, []);

  function removeNews(event, news: News) {
    event.stopPropagation();
    setSelectedNews(news);
    setOpenModal(true);
  }

  async function confirmNewsRemoval() {
    await api.exclude(APIRoutes.NEWS, { id: selectedNews.id });
    let newNewsist = newsList.filter(news => news.id != selectedNews.id);
    setNewsList(newNewsist);
    closeModal();
  }

  function closeModal() {
    setOpenModal(false);
  }


  return (
    <AdminBase>
      <div className="row">
        <div className="col-6">
          <h3 className="text-primary-dark">Notícias</h3>
        </div>
        <div className="col-6 text-right">
          <Link href="/admin/news/new">
            <a className="btn btn-primary">Cadastrar</a>
          </Link>
        </div>
      </div>
      <div className="row mt-5">
        <div className="col-12 table-responsive">
          <table className="table table-striped table-hover">
            <thead>
              <tr>
                <th>Título</th>
                <th>Data</th>
                <th>Excluir</th>
              </tr>
            </thead>
            <tbody>
              {newsList.map((newsItem, i) => {
                return (
                  <Link href={`/admin/news/${encodeURIComponent(newsItem.id)}`} key={newsItem.id}>
                    <tr>
                      <td>{newsItem.title}</td>
                      <td>{newsItem.dateString}</td>
                      <td><button className="btn btn-sm btn-danger" onClick={(e) => removeNews(e, newsItem)} >
                        <FontAwesomeIcon icon={faTrash} className="sm-icon" />
                      </button></td>
                    </tr>
                  </Link>
                )
              })}

            </tbody>
          </table>
          {(newsList.length == 0 && !isLoading) &&
            <div className="alert alert-info mt-3 text-center">
              Nenhum resultado encontrado.
            </div>
          }

        </div>
      </div>
      {isLoading &&
        <Loading />
      }
      <ConfirmDialog open={openModal} actionButtonText="Excluir" title="Excluir" text={"Tem certeza que deseja excluir " + selectedNews.title + "?"} onClose={closeModal} onConfirm={confirmNewsRemoval} />
    </AdminBase>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const permission = Permission();
  return await permission.checkPermission(ctx, [UserType.MASTER, UserType.ADMIN]);
};

