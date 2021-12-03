import React, { useEffect, useState } from 'react'

import { APIRoutes } from '../../../utils/api.routes'
import AdminBase from '../../../components/admin/admin-base'
import { Teacher } from '../../../models/teacher';
import { useRouter } from 'next/router'
import Link from 'next/link';
import * as Yup from 'yup'
import { ErrorMessage, Field, Formik } from 'formik'
import { toast } from 'react-nextjs-toast'
import API from '../../../lib/api.service';
import { APIResponse } from '../../../models/api-response';
import { GetServerSidePropsContext } from 'next';
import { UserType } from '../../../enum/type-user.enum';
import Permission from '../../../lib/permission.service';
import { FileHelper } from '../../../helpers/file-helper';
import WarningDialog from '../../../components/warning-dialog';

export default function SaveTeacherLayout() {

    const router = useRouter();
    const api = API();

    const [teacher, setTeacher] = useState<Teacher>({
        name: "",
        about: "",
        email: "",
        phone: "",
        photo: "",
    });
    const [file, setFile] = useState<FileList>();
    const [openModal, setOpenModal] = useState<boolean>(false);

    function closeModal() {
        setOpenModal(false);
    }

    const verifyFileSize = (file)  => {
        const check = FileHelper.checkFileSize(file);
        setOpenModal(!check)
        return check
    }

    useEffect(() => {

        const { id } = router.query;
        if (id) {
            if (id.toString() == "new") {
            } else {
                getTeacher(id.toString());
            }
        }

    }, [router.query]);

    const getTeacher = async (id: string) => {
        //Recupera o valor do banco de dados
        const result = await api.get(APIRoutes.TEACHER, { 'id': id });
        if(result){
            const teacher: Teacher = (result as APIResponse).result;
            setTeacher(teacher);
        }
    }

    const saveTeacher = async (values: Teacher) => {
        if(teacher.photo != ""){
            values = {...values, photo: teacher.photo};
        }
        await api.postFile(APIRoutes.TEACHER, values, file && file.length > 0 ? file[0] : null);
    };

    const onSubmit = async (values, actions) => {
        try {
            actions.setSubmitting(true);
            await saveTeacher(values);                
            router.push("/admin/teacher");
        } catch (error) {
            console.error(error);
            actions.setSubmitting(false);
        }
    }
 


    return (
        <AdminBase>
            <div className="row mb-3">
                <div className="col-12 text-right">
                    <Link href="/admin/teacher">
                        <a className="link-primary ">Voltar</a>
                    </Link>
                </div>
            </div>
            <Formik
                enableReinitialize
                initialValues={{ ...teacher, photo: '', file: undefined }}
                validationSchema={
                    Yup.object().shape({
                        name: Yup.string().required('Preencha este campo.'),
                        about: Yup.string().required('Preencha este campo.'),
                        photo: teacher.photo ? null : Yup.string().required('Preencha este campo.'),
                        email: Yup.string().required('Preencha este campo.'),
                        phone: Yup.string().required('Preencha este campo.'),
                    })}
                onSubmit={onSubmit}>
                {({
                    values,
                    isSubmitting,
                    handleSubmit,
                    handleChange,
                    setFieldValue
                }) => (
                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label htmlFor="name" className="form-label">Nome</label>
                            <input
                                type="text"
                                className="form-control"
                                name="name"
                                id="name"
                                placeholder="Nome do docente"
                                value={values.name}
                                onChange={handleChange} />
                            <p className="input-error"><ErrorMessage name="name" /></p>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="photo" className="form-label">Foto</label>
                            <input
                                type="file"
                                className="form-control"
                                name="photo"
                                id="photo"
                                value={values.photo}
                                onChange={(event) => {
                                    const files = event.currentTarget.files;                                                   
                                    if(!verifyFileSize(files)) {
                                        setFieldValue('photo', '');
                                        return;
                                    }
                                    handleChange(event);
                                    setFile(files);
                                }} />
                            <p className="input-info">*Os arquivos devem ter no máximo 4MB</p>
                            <p className="input-error"><ErrorMessage name="photo" /></p>
                        </div>
                        {teacher.photo &&
                         <div className="mb-3 text-center">
                         <img src={teacher.photo} className="img-thumbnail" alt="..."></img>
                         </div>
                        }
                       
                        <div className="mb-3">
                            <label htmlFor="about" className="form-label">Sobre</label>
                            <textarea
                                className="form-control"
                                name="about"
                                id="about"
                                rows={3}
                                value={values.about}
                                onChange={handleChange}
                            ></textarea>
                            <p className="input-error"><ErrorMessage name="about" /></p>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="name" className="form-label">Email</label>
                            <input
                                type="email"
                                className="form-control"
                                name="email"
                                id="email"
                                placeholder=""
                                value={values.email}
                                onChange={handleChange} />
                            <p className="input-error"><ErrorMessage name="email" /></p>
                        </div>
                        <div className="mb-3">
                            <label htmlFor="name" className="form-label">Telefone</label>
                            <input
                                type="phone"
                                className="form-control"
                                name="phone"
                                id="phone"
                                placeholder=""
                                value={values.phone}
                                onChange={handleChange} />
                            <p className="input-error"><ErrorMessage name="phone" /></p>
                        </div>
                        <div className="text-right">
                        <button type="submit" className="btn btn-primary mt-3 me-auto" disabled={isSubmitting}>Salvar</button>
                        </div>
                    </form>
                )}
            </Formik>            
            <WarningDialog open={openModal} actionButtonText="OK" title="Aviso" text={"O tamanho máximo do arquivo deve ser 4MB"} onClose={closeModal} />
        </AdminBase>
    )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
    const permission = Permission();
    return await permission.checkPermission(ctx, [UserType.MASTER, UserType.ADMIN]);
  };

