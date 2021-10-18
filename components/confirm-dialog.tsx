
interface Props {
    title?: string;
    text?: string;
    open: boolean;
    actionButtonText: string;
    onClose?: Function;
    onConfirm?: Function;
}
export default function ConfirmDialog(props: Props) {
    const { open, onClose, title, text, onConfirm, actionButtonText } = props;
    // if (!open) {
    //     return <></>;
    // }

    function close() {
        onClose ? onClose() : false;
    }

    function sucess() {
        onConfirm ? onConfirm() : false;
    }


    return (
        <div className={" modal fade   " + (open ? 'd-block show modal-open' : '')}  >
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{title}</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"  onClick={close}></button>
                    </div>
                    <div className="modal-body text-start">
                        <p>{text}</p>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal" onClick={close}>Fechar</button>
                        <button type="button" className="btn btn-primary" onClick={sucess}>{actionButtonText}</button>
                    </div>
                </div>
            </div>
        </div>
    );
}