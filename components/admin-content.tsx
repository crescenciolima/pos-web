import adminStyle from '../styles/admin.module.css'

export default function AdminContent(props: any) {

    return (
        <div className={adminStyle.content}>
            {props.children}
        </div>
    )
}