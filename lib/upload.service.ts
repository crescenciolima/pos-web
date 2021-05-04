import storage from "../utils/storage-util";
import { StoragePaths } from "./storage-path";
import fire from "../utils/firebase-util";

export default function FileUploadService() {



    function upload(folder: StoragePaths, file:File) {

        const fileName = file['name'];
        console.log(file);
        console.log(fileName);
        console.log(folder);
        // const arrayBuffer: ArrayBuffer = await 
        // file.arrayBuffer().then(
        //     array =>{
        //         const uploadTask = storage.ref(`${folder}${fileName}`).put(array);

        //     }
        // )
        // .then(
        //     async (snapshot) => {
        //         return await storage
        //                     .ref(`${folder}`)
        //                     .child(fileName)
        //                     .getDownloadURL();
        //     }
        // );

    //    const url =  await storage
    //         .ref(`${folder}`)
    //         .child(fileName)
    //         .getDownloadURL();

    //         console.log(url);

        // uploadTask.on(
        //     fire.storage.TaskEvent.STATE_CHANGED,
        //     console.log,
        //     console.error,
        //      () => {
        //           storage
        //             .ref(`${folder}`)
        //             .child(fileName)
        //             .getDownloadURL().then(
        //                 url =>console.log(url)
        //             );
        //     });

    }



    return {
        upload,
    }

}
