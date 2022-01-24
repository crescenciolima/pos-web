import { BlobCorrected } from "../../utils/types-util";

export class Arquivo{
    id:number;
    nmArquivo:string;
    dtInsercao:Date;
    dtAtualizacao:Date;
    blbArquivo:BlobCorrected;
    txtObservacao:string;
    idArquivo:string;
    stArquivo:string;
}