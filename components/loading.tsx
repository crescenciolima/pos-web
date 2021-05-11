
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

export default function Loading() {

    return (
        <div className="w-100 h-100 d-flex justify-content-center align-items-center">
            <div className="text-center">
                <h5 ><FontAwesomeIcon icon={faSpinner}  className="sm-icon spinner" /></h5>
                <h5 >Carregando ...</h5>
            </div>
        </div>
    );

}