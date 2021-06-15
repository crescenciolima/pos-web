import { News } from "../models/news";
import Image from 'next/image'
import newsStyle from '../styles/news.module.css'
import Link from 'next/link'

export default function NewsCard(news: News) {


    return (
        <Link href={'/noticia/'+news.slug}>
        <div className={newsStyle.newsCard+' card btn-round border-0 '}>
            <div className="card-body d-flex btn-round">
                <Image src={news.coverURL} alt="..." className="btn-round " width={170} height={170} loading="lazy"></Image>
                <div className=" my-auto ms-3">
                    <h5 className={newsStyle.cardTitle+' card-title'}>{news.title}</h5>
                    <p className="card-text">This is a wider card with supporting text below as a natural lead-in to additional content. This content is a little bit longer.</p>
                    <p className="card-text"><small className="text-muted">{news.dateString}</small></p>
                </div>
            </div>
        </div>
        </Link>

    )

     
}
