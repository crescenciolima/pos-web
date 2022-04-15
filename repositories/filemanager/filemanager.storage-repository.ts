import { StoragePaths } from "../../utils/storage-path";
import { BlobCorrected } from "../../utils/types-util";
import { StorageRepository } from "../storage-repository";
import { Arquivo } from '../../filemanager/entities/arquivo';
import { Filemanager } from "../../filemanager/filemanager";
import { UploadReferency } from "../../models/upload/upload-referency";
import { ArquivoBuilder } from "../../builders/arquivo.builder";

export class FilemanagerStorageRepository implements StorageRepository{

    private filemanager:Filemanager;
    FILE_MANAGER_KEY = process.env.FILE_MANAGER_KEY;
    FILE_MANAGER_URL = process.env.FILE_MANAGER_URL;
    

    constructor(){
        this.filemanager = new Filemanager();
    }

    async storage(folder: StoragePaths, blob: BlobCorrected, fileName: string): Promise<any> {
        let arquivo:Arquivo = new ArquivoBuilder(blob, fileName).build();
        arquivo = await this.filemanager.insertArquivo(arquivo);
        let uploadRef:UploadReferency = new UploadReferency();
        uploadRef.ref.setDownloadURL(`${this.FILE_MANAGER_URL}/arquivos/${arquivo.idArquivo}?key=${this.FILE_MANAGER_KEY}`);
        return uploadRef;
    }

    async remove(downloadURL: string) {
        return await this.filemanager.deleteArquivo(downloadURL);
    }
    
}