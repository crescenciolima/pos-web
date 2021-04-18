import adminStyle from '../styles/admin.module.css'

export default function AdminContent(props: any) {

    return (
        <div className="col-md-9 ms-sm-auto col-lg-10 px-md-4">
            <div className={adminStyle.content}>
                {props.children}
            </div>
        </div>
    )
}