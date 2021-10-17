import { Router } from "next/router";
import { useEffect, useState } from "react";

interface Props {
    imgUrl: string
}

const imgStyle={
    border: "1px solid #ddd",
    borderRadius: "4px",
    padding: "5px",
    width: "100px"
};

export default function ImgThumbnail (props: Props) {
    const [imgType, setImgType] = useState(null);

    useEffect(()=>{
        const imgUrl = props.imgUrl
    
        //receive image URL and check which type it is (application/{pdf,jpg,png})
        async function fetchImg(imgUrl) {
            const response = await fetch(imgUrl);

            const blobFile = await response.blob()

            const blobType = blobFile.type
    
            setImgType(blobType)
        };

        fetchImg(imgUrl);

    },[props.imgUrl])

    const {imgUrl} = props;

    let imgThumb = '/images/pdf-thumbnail.png';

    //if pdf use a predefined image as thumbnail, if not(png,jpg) use the same image from firebase
    if (imgType !== "application/pdf")
        imgThumb = imgUrl
    
    return (
        <a href={imgUrl} target="_blank">
            <img style={imgStyle} src={imgThumb} />
        </a>
    );
}