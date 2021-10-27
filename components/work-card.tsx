import { News } from "../models/news";
import Image from 'next/image'
import newsStyle from '../styles/news.module.css'
import Link from 'next/link'
import { Works } from "../models/works";

export default function WorkCard({ work }) {
    const cardText = work.text?.replace(/<[^>]*>/g, ' ').substring(0, 100);

    return (
        <Link href={'/trabalhos/' + work.id}>
            <div className={newsStyle.newsCard + ' card btn-round border-0 '}>
                <div className="card-body d-flex flex-column flex-md-row btn-round">
                    <div className=" ms-3 mt-3 my-md-auto">
                        <h5 className={newsStyle.cardTitle + ' card-title'}>{work.title}</h5>
                        <p className="card-text">{work.authors.length > 1 ? 'Autores' : 'Autor(a)'}: {work.authors.join(', ')}</p>
                        <p className="card-text"><small className="text-muted">{(new Date(work.date)).toLocaleString()}</small></p>
                        <p className="card-text">{cardText}</p> 
                    </div>
                </div>
            </div>
        </Link>

    )


}
