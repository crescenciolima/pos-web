import 'firebase/storage'
import fire from "../../firebase/firebase-util";
import { StoragePaths } from "../../utils/storage-path";
import { BlobCorrected } from "../../utils/types-util";
import { StorageRepository } from "../storage-repository";

export class FirebaseStorageRepository implements StorageRepository{
    
    async storage(folder: StoragePaths, blob: BlobCorrected, fileName: string): Promise<any> {
        return await fire.storage().ref().child(`${folder}${fileName}`).put(blob.buffer, {contentType: blob['mimetype']});
    }

    async remove(downloadURL: string) {
        await fire.storage().refFromURL(downloadURL).delete();
    }
    
}