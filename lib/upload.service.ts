import storage from "../utils/storage-util";
import { StoragePaths } from "./storage-path";
import fire from "../utils/firebase-util";
import { BlobCorrected } from "../utils/types-util";

export default function FileUploadService() {



    async function upload(folder: StoragePaths, blob: BlobCorrected, fileName: string): Promise<string> {

        //Removing spaces from the file name
        fileName= fileName.trim().replace(" ","");
        while(fileName.includes(" ")){
            fileName= fileName.replace(" ","");
        }

        try {
            let uploadRef = await storage.ref().child(`${folder}${fileName}`).put(blob.buffer, {contentType: blob['mimetype']});
            const downloadURL = await uploadRef.ref.getDownloadURL();
            return downloadURL
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
