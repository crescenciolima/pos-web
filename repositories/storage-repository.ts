import { StoragePaths } from "../utils/storage-path";
import { BlobCorrected } from "../utils/types-util";

export interface StorageRepository{
    storage(folder: StoragePaths, blob: BlobCorrected, fileName: string):Promise<any>;
    remove(downloadURL: string);
}