import adminStyle from '../../styles/admin.module.css'

export default function StudentContent(props: any) {

    return (
        <div className={adminStyle.content}>
            <div className="p-5">
                {props.children}
            </div>
        </div>
    )
}