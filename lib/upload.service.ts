import storage from "../utils/storage-util";
import { BlobCorrected } from "../utils/types-util";
import { StoragePaths } from "../utils/storage-path";

export default function FileUploadService() {



    async function upload(folder: StoragePaths, blob: BlobCorrected, fileName: string): Promise<string> {

        //Removendo espaços em branco do nome
        fileName= fileName.trim().replace(" ","");
        while(fileName.includes(" ")){
            fileName= fileName.replace(" ","");
        }

        try {
            //Envia e aguarda a referência do arquivo enviado
            let uploadRef = await storage.ref().child(`${folder}${fileName}`).put(blob.buffer, {contentType: blob['mimetype']});
            //Recupera e devolve a URL de acesso
            const downloadURL = await uploadRef.ref.getDownloadURL();
            return downloadURL;
        } catch (err) {
            console.log(err)
            return "";
        }

    }

    async function remove(downloadURL: string) {
        await storage.refFromURL(downloadURL).delete();
    }



    return {
        upload,
        remove
    }

}
