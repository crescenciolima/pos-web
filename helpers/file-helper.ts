import { Constants } from "../utils/constants";

export const FileHelper = {
    checkFileSize: (file)  =>{
        if(file && file[0].size > Constants.MAX_FILE_SIZE) {
            return false
        }
        return true
    }
  }
  