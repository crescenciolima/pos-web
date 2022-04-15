import { Arquivo } from "../filemanager/entities/arquivo";
import { BlobCorrected } from "../utils/types-util";

export class ArquivoBuilder{
    private arquivo:Arquivo;

    constructor(blob:BlobCorrected, fileName:string){
        this.arquivo = new Arquivo();
        this.arquivo.blbArquivo = blob;
        this.arquivo.dtInsercao = new Date();
        this.arquivo.nmArquivo = fileName;
        this.arquivo.idArquivo = fileName; 
    }	

    build():Arquivo{
        return this.arquivo;
    }
}