import { BlobCorrected } from "../utils/types-util";
import { StoragePaths } from "../utils/storage-path";
import { StorageRepository } from "../repositories/storage-repository";
import { GenerateFactory } from "../repositories/generate.factory";

export class FileUploadService {

    private storageRepository:StorageRepository;

    constructor(){
        this.storageRepository = GenerateFactory.getInstance().storageRepository();
    }
 

    async upload(folder: StoragePaths, blob: BlobCorrected, fileName: string): Promise<string> {

        //Removendo espaços em branco do nome
        fileName= fileName.trim().replace(" ","");
        while(fileName.includes(" ")){
            fileName= fileName.replace(" ","");
        }

        try {
            //Envia e aguarda a referência do arquivo enviado
            let uploadRef = await this.storageRepository.storage(folder, blob, fileName);
            //Recupera e devolve a URL de acesso
            const downloadURL = await uploadRef.ref.getDownloadURL();
            return downloadURL;
        } catch (err) {
            //console.log(err)
            return "";
        }

    }

    async remove(downloadURL: string) {
        await this.storageRepository.remove(downloadURL);
    }

}
