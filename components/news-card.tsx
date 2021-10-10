import { News } from "../models/news";
import Image from 'next/image'
import newsStyle from '../styles/news.module.css'
import Link from 'next/link'

export default function NewsCard(news: News) {

    const cardText = news.text.replace(/<[^>]*>/g, ' ').substring(0, 100);


    return (
        <Link href={'/noticia/' + news.slug}>
            <div className={newsStyle.newsCard + ' card btn-round border-0 '}>
                <div className="card-body d-flex flex-column flex-md-row btn-round">
                    <div className="btn-round text-center my-auto">
                    <Image src={news.coverURL} alt="..." className="btn-round m-auto" layout="fixed" width={170} height={170} loading="lazy"></Image>
                    </div>
                    <div className=" ms-3 mt-3 my-md-auto">
                        <h5 className={newsStyle.cardTitle + ' card-title'}>{news.title}</h5>
                        <p className="card-text">{cardText}.</p>
                        <p className="card-text"><small className="text-muted">{news.dateString}</small></p>
                    </div>
                </div>
            </div>
        </Link>

    )


}
