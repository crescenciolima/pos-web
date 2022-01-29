import 'firebase/storage'
import { FirebaseAdmin } from '../../firebase/firebase-admin';
import { StoragePaths } from "../../utils/storage-path";
import { BlobCorrected } from "../../utils/types-util";
import { StorageRepository } from "../storage-repository";

export class FirebaseStorageRepository implements StorageRepository{
    
    async storage(folder: StoragePaths, blob: BlobCorrected, fileName: string): Promise<any> {
        return await FirebaseAdmin.getInstance().fire.storage().ref().child(`${folder}${fileName}`).put(blob.buffer, {contentType: blob['mimetype']});
    }

    async remove(downloadURL: string) {
        await FirebaseAdmin.getInstance().fire.storage().refFromURL(downloadURL).delete();
    }
    
}