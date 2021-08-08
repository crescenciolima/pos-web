import { GetServerSidePropsContext, GetStaticProps, InferGetServerSidePropsType } from 'next'
import React, {useEffect, useState, useRef} from 'react'
import * as Yup from 'yup'
import {ErrorMessage, Field, Formik} from 'formik'
import ClipLoader from "react-spinners/ClipLoader";
import { css } from "@emotion/core";

import AdminBase from '../../../components/admin/admin-base';
import { Subscription } from "../../../models/subscription";
import { APIRoutes } from '../../../lib/api.routes';
import API from '../../../lib/api.service';
import Cookies from '../../../lib/cookies.service';
import { authAdmin } from '../../../utils/firebase-admin';
import Permission from '../../../lib/permission.service';
import { UserType } from '../../../enum/type-user.enum';
import StudentBase from '../../../components/student/student-base';


export default function SubscriptionLayout(props: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(true);
  const api = API(setLoading);
  const [subscription, setSubscription] = useState<Subscription>();

  const saveSubscription = async (values: Subscription) => {
    try {
      if(subscription){
        values = {...values, id: subscription.id};
      }
      console.log(values);
      const result = await api.post(APIRoutes.SUBSCRIPTION, values);

      setReload(!reload);
    } catch (error) {
      console.error(error);
    }
  };
  
  const onSubmit = async (values, actions) => {
    try {
      actions.setSubmitting(true);
      const student = values;
      const newSubscription: Subscription = {
        student, 
        handicapped: false,
        vacancyType: 'ampla_concorrencia',
        status: 'open'
      }
      await saveSubscription(newSubscription);
    } catch (error) {
      console.error(error);
      actions.setSubmitting(false);
    }
  }

  useEffect(() => {
    const loadSubscription = async () => {
      const result = await api.get(APIRoutes.SUBSCRIPTION);
      setSubscription(result ?? result[0]);
      setLoading(false);
    };
    setLoading(false);
    //loadSubscription();
  }, [reload]);

  const override = css`  
    display: block;
    margin: 0 auto;
  `;
  if(loading){
    return (
      <StudentBase>
        <div>
          <ClipLoader color="#34A853" loading={loading} size={50} css={override}/>
        </div>
      </StudentBase>
    );
  }

  return (    
    <StudentBase>
      <Formik
        enableReinitialize
        initialValues={{
          name: subscription ? subscription.student.name : '',
          birthdate: subscription ? subscription.student.birthdate : '',
          postalCode: subscription ? subscription.student.postalCode : '',
          street: subscription ? subscription.student.street : '',
          houseNumber: subscription ? subscription.student.houseNumber : '',
          complement: subscription ? subscription.student.complement : '',
          district: subscription ? subscription.student.district : '',
          city: subscription ? subscription.student.city : '',
          state: subscription ? subscription.student.state : '',
          homePhoneNumber: subscription ? subscription.student.homePhoneNumber : '',
          phoneNumber: subscription ? subscription.student.phoneNumber : '',
          document: subscription ? subscription.student.document : '',
          identityDocument: subscription ? subscription.student.identityDocument : '',
          issuingAgency: subscription ? subscription.student.issuingAgency : '',
          issuanceDate: subscription ? subscription.student.issuanceDate : '',
          graduation: subscription ? subscription.student.graduation : '',
          graduationInstitution: subscription ? subscription.student.graduationInstitution: '',
          postgraduateLatoSensu: subscription ? subscription.student.postgraduateLatoSensu : '',
          postgraduateLatoSensuInstitution: subscription ? subscription.student.postgraduateLatoSensuInstitution : '',
          postgraduateStrictoSensu: subscription ? subscription.student.postgraduateStrictoSensu : '',
          postgraduateStrictoSensuInstitution: subscription ? subscription.student.postgraduateStrictoSensuInstitution : '',
          profession: subscription ? subscription.student.profession : '',
          company: subscription ? subscription.student.company : '',
          postalCodeCompany: subscription ? subscription.student.postalCodeCompany : '',
          streetCompany: subscription ? subscription.student.streetCompany : '',
          houseNumberCompany: subscription ? subscription.student.houseNumberCompany : '',
          complementCompany: subscription ? subscription.student.complementCompany : '',
          districtCompany: subscription ? subscription.student.districtCompany : '',
          cityCompany: subscription ? subscription.student.cityCompany : '',
          stateCompany: subscription ? subscription.student.stateCompany : '',
          workShift: subscription ? subscription.student.workShift : '',
          workRegime: subscription ? subscription.student.workRegime : '',
        }}
        validationSchema={Yup.object().shape({
          name: Yup.string().required('Preencha este campo.'),
          birthdate: Yup.string().required('Preencha este campo.'),
          postalCode: Yup.string().required('Preencha este campo.'),
          street: Yup.string().required('Preencha este campo.'),
          houseNumber: Yup.string().required('Preencha este campo.'),
          district: Yup.string().required('Preencha este campo.'),
          city: Yup.string().required('Preencha este campo.'),
          state: Yup.string().required('Preencha este campo.'),
          homePhoneNumber: Yup.string().required('Preencha este campo.'),
          phoneNumber: Yup.string().required('Preencha este campo.'),
          document: Yup.string().required('Preencha este campo.'),
          identityDocument: Yup.string().required('Preencha este campo.'),
          issuingAgency: Yup.string().required('Preencha este campo.'),
          issuanceDate: Yup.string().required('Preencha este campo.'),
          graduation: Yup.string().required('Preencha este campo.'),
          graduationInstitution: Yup.string().required('Preencha este campo.'),
        })}
        onSubmit={onSubmit}>
        {({
          values, 
          isSubmitting, 
          handleSubmit,
          handleChange
        }) => (
          <form onSubmit={handleSubmit}>
            <div className="row mt-5 justify-content-center">
                <div className="col-6">
                    <div className="mb-3">
                    <label htmlFor="name" className="form-label">Nome</label>
                    <input 
                        type="text" 
                        className="form-control" 
                        name="name" 
                        id="name" 
                        placeholder="Nome Completo"
                        value={values.name}                
                        onChange={handleChange} />                
                    <ErrorMessage name="name" className="input-error" />
                    </div>
                </div>
                <div className="col-6">
                    <div className="mb-3">
                        <label htmlFor="birthdate" className="form-label">Data de Nascimento</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="birthdate" 
                            id="birthdate" 
                            placeholder="Data de Nascimento"
                            value={values.birthdate}                
                            onChange={handleChange} />                
                        <ErrorMessage name="birthdate" className="input-error" />
                    </div>
                </div>
            </div>            
            <div className="row justify-content-center">
                <div className="col-2">
                    <div className="mb-3">
                        <label htmlFor="postalCode" className="form-label">CEP</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="postalCode" 
                            id="postalCode" 
                            placeholder="CEP"
                            value={values.postalCode}                
                            onChange={handleChange} />                
                        <ErrorMessage name="postalCode" className="input-error" />
                    </div>
                </div>
                <div className="col-3">
                    <div className="mb-3">
                        <label htmlFor="street" className="form-label">Endereço</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="street" 
                            id="street" 
                            placeholder="Rua"
                            value={values.street}                
                            onChange={handleChange} />                
                        <ErrorMessage name="street" className="input-error" />
                    </div>
                </div>
                <div className="col-2">
                    <div className="mb-3">
                        <label htmlFor="houseNumber" className="form-label">Número</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="houseNumber" 
                            id="houseNumber" 
                            placeholder="Número"
                            value={values.houseNumber}                
                            onChange={handleChange} />                
                        <ErrorMessage name="houseNumber" className="input-error" />
                    </div>
                </div>
                <div className="col-5">
                    <div className="mb-3">
                        <label htmlFor="complement" className="form-label">Complemento</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="complement" 
                            id="complement" 
                            placeholder="Complemento"
                            value={values.complement}                
                            onChange={handleChange} />                
                        <ErrorMessage name="complement" className="input-error" />
                    </div>
                </div>
            </div>
            <div className="row justify-content-center">
                <div className="col-4">
                    <div className="mb-3">
                        <label htmlFor="district" className="form-label">Bairro</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="district" 
                            id="district" 
                            placeholder="Bairro"
                            value={values.district}                
                            onChange={handleChange} />                
                        <ErrorMessage name="district" className="input-error" />
                    </div>
                </div>
                <div className="col-4">
                    <div className="mb-3">
                        <label htmlFor="city" className="form-label">Cidade</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="city" 
                            id="city" 
                            placeholder="Cidade"
                            value={values.city}                
                            onChange={handleChange} />                
                        <ErrorMessage name="city" className="input-error" />
                    </div>
                </div>
                <div className="col-4">
                    <div className="mb-3">
                        <label htmlFor="state" className="form-label">Estado</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="state" 
                            id="state" 
                            placeholder="Estado"
                            value={values.state}                
                            onChange={handleChange} />                
                        <ErrorMessage name="state" className="input-error" />
                    </div>
                </div>
            </div>
            <div className="row justify-content-center">
                <div className="col-4">
                    <div className="mb-3">
                        <label htmlFor="homePhoneNumber" className="form-label">Telefone Residencial</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="homePhoneNumber" 
                            id="homePhoneNumber" 
                            placeholder="Telefone Residencial"
                            value={values.homePhoneNumber}                
                            onChange={handleChange} />                
                        <ErrorMessage name="homePhoneNumber" className="input-error" />
                    </div>
                </div>
                <div className="col-4">
                    <div className="mb-3">
                        <label htmlFor="phoneNumber" className="form-label">Telefone Celular</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="phoneNumber" 
                            id="phoneNumber" 
                            placeholder="Telefone Celular"
                            value={values.phoneNumber}                
                            onChange={handleChange} />                
                        <ErrorMessage name="phoneNumber" className="input-error" />
                    </div>                
                </div>
                <div className="col-4">
                    <div className="mb-3">
                        <label htmlFor="document" className="form-label">CPF</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="document" 
                            id="document" 
                            placeholder="CPF"
                            value={values.document}                
                            onChange={handleChange} />                
                        <ErrorMessage name="document" className="input-error" />
                    </div>                
                </div>              
            </div>
            <div className="row justify-content-center">
                <div className="col-4">
                    <div className="mb-3">
                        <label htmlFor="identityDocument" className="form-label">Documento de Identidade</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="identityDocument" 
                            id="identityDocument" 
                            placeholder="Documento de Identidade"
                            value={values.identityDocument}                
                            onChange={handleChange} />                
                        <ErrorMessage name="identityDocument" className="input-error" />
                    </div>
                </div>
                <div className="col-4">
                    <div className="mb-3">
                        <label htmlFor="issuingAgency" className="form-label">Órgão Expedidor</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="issuingAgency" 
                            id="issuingAgency" 
                            placeholder="Órgão Expedidor"
                            value={values.issuingAgency}                
                            onChange={handleChange} />                
                        <ErrorMessage name="issuingAgency" className="input-error" />
                    </div>
                </div>
                <div className="col-4">
                    <div className="mb-3">
                        <label htmlFor="issuanceDate" className="form-label">Data de Expedição</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="issuanceDate" 
                            id="issuanceDate" 
                            placeholder="Data de Expedição"
                            value={values.issuanceDate}                
                            onChange={handleChange} />                
                        <ErrorMessage name="issuanceDate" className="input-error" />
                    </div>
                </div>
            </div>
            <div className="row justify-content-center">
                <div className="col-6">
                    <div className="mb-3">
                        <label htmlFor="graduation" className="form-label">Graduação</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="graduation" 
                            id="graduation" 
                            placeholder="Graduação"
                            value={values.graduation}                
                            onChange={handleChange} />                
                        <ErrorMessage name="graduation" className="input-error" />
                    </div>
                </div>
                <div className="col-6">
                    <div className="mb-3">
                        <label htmlFor="graduationInstitution" className="form-label">Instituição de obtenção do título de Graduação</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="graduationInstitution" 
                            id="graduationInstitution" 
                            placeholder="Instituição"
                            value={values.graduationInstitution}                
                            onChange={handleChange} />                
                        <ErrorMessage name="graduationInstitution" className="input-error" />
                    </div>
                </div>
                <div className="col-6">
                    <div className="mb-3">
                        <label htmlFor="postgraduateLatoSensu" className="form-label">Pós-graduação Lato Sensu</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="postgraduateLatoSensu" 
                            id="postgraduateLatoSensu" 
                            placeholder="Pós-graduação Lato Sensu"
                            value={values.postgraduateLatoSensu}                
                            onChange={handleChange} />                
                        <ErrorMessage name="postgraduateLatoSensu" className="input-error" />
                    </div>
                </div>
                <div className="col-6">
                    <div className="mb-3">
                        <label htmlFor="postgraduateLatoSensuInstitution" className="form-label">Instituição de obtenção do título de Pós-graduação Lato Sensu</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="postgraduateLatoSensuInstitution" 
                            id="postgraduateLatoSensuInstitution" 
                            placeholder="Instituição"
                            value={values.postgraduateLatoSensuInstitution}                
                            onChange={handleChange} />                
                        <ErrorMessage name="postgraduateLatoSensuInstitution" className="input-error" />
                    </div>
                </div>
                <div className="col-6">
                    <div className="mb-3">
                        <label htmlFor="postgraduateStrictoSensu" className="form-label">Pós-graduação Stricto Sensu</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="postgraduateStrictoSensu" 
                            id="postgraduateStrictoSensu" 
                            placeholder="Pós-graduação Stricto Sensu"
                            value={values.postgraduateStrictoSensu}                
                            onChange={handleChange} />                
                        <ErrorMessage name="postgraduateStrictoSensu" className="input-error" />
                    </div>
                </div>
                <div className="col-6">
                    <div className="mb-3">
                        <label htmlFor="postgraduateStrictoSensuInstitution" className="form-label">Instituição de obtenção do título de Pós-graduação Stricto Sensu</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="postgraduateStrictoSensuInstitution" 
                            id="postgraduateStrictoSensuInstitution" 
                            placeholder="Instituição"
                            value={values.postgraduateStrictoSensuInstitution}                
                            onChange={handleChange} />                
                        <ErrorMessage name="postgraduateStrictoSensuInstitution" className="input-error" />
                    </div>
                </div>
                <div className="col-6">
                    <div className="mb-3">
                        <label htmlFor="profession" className="form-label">Atividade Profissional</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="profession" 
                            id="profession" 
                            placeholder="Atividade Profissional"
                            value={values.profession}                
                            onChange={handleChange} />                
                        <ErrorMessage name="profession" className="input-error" />
                    </div>
                </div>
                <div className="col-6">
                    <div className="mb-3">
                        <label htmlFor="company" className="form-label">Instituição ou Empresa de Atuação</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="company" 
                            id="company" 
                            placeholder="Instituição ou Empresa de Atuação"
                            value={values.company}                
                            onChange={handleChange} />                
                        <ErrorMessage name="company" className="input-error" />
                    </div>
                </div>
            </div>

            <div className="row justify-content-center">
                <div className="col-2">
                    <div className="mb-3">
                        <label htmlFor="postalCodeCompany" className="form-label">CEP</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="postalCodeCompany" 
                            id="postalCodeCompany" 
                            placeholder="CEP"
                            value={values.postalCodeCompany}                
                            onChange={handleChange} />                
                        <ErrorMessage name="postalCodeCompany" className="input-error" />
                    </div>
                </div>
                <div className="col-3">
                    <div className="mb-3">
                        <label htmlFor="streetCompany" className="form-label">Endereço</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="streetCompany" 
                            id="streetCompany" 
                            placeholder="Rua"
                            value={values.streetCompany}                
                            onChange={handleChange} />                
                        <ErrorMessage name="streetCompany" className="input-error" />
                    </div>
                </div>
                <div className="col-2">
                    <div className="mb-3">
                        <label htmlFor="houseNumberCompany" className="form-label">Número</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="houseNumberCompany" 
                            id="houseNumberCompany" 
                            placeholder="Número"
                            value={values.houseNumberCompany}                
                            onChange={handleChange} />                
                        <ErrorMessage name="houseNumberCompany" className="input-error" />
                    </div>
                </div>
                <div className="col-5">
                    <div className="mb-3">
                        <label htmlFor="complementCompany" className="form-label">Complemento</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="complementCompany" 
                            id="complementCompany" 
                            placeholder="Complemento"
                            value={values.complementCompany}                
                            onChange={handleChange} />                
                        <ErrorMessage name="complementCompany" className="input-error" />
                    </div>
                </div>
                <div className="col-4">
                    <div className="mb-3">
                        <label htmlFor="districtCompany" className="form-label">Bairro</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="districtCompany" 
                            id="districtCompany" 
                            placeholder="Bairro"
                            value={values.districtCompany}                
                            onChange={handleChange} />                
                        <ErrorMessage name="districtCompany" className="input-error" />
                    </div>
                </div>
                <div className="col-4">
                    <div className="mb-3">
                        <label htmlFor="cityCompany" className="form-label">Cidade</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="cityCompany" 
                            id="cityCompany" 
                            placeholder="Cidade"
                            value={values.cityCompany}                
                            onChange={handleChange} />                
                        <ErrorMessage name="cityCompany" className="input-error" />
                    </div>
                </div>
                <div className="col-4">
                    <div className="mb-3">
                        <label htmlFor="stateCompany" className="form-label">Estado</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="stateCompany" 
                            id="stateCompany" 
                            placeholder="Estado"
                            value={values.stateCompany}                
                            onChange={handleChange} />                
                        <ErrorMessage name="stateCompany" className="input-error" />
                    </div>
                </div>
                <div className="col-6">
                    <div className="mb-3">
                        <label htmlFor="workShift" className="form-label">Turno de Trabalho</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="workShift" 
                            id="workShift" 
                            placeholder="Turno de Trabalho"
                            value={values.workShift}                
                            onChange={handleChange} />                
                        <ErrorMessage name="workShift" className="input-error" />
                    </div>
                </div>
                <div className="col-6">
                    <div className="mb-3">
                        <label htmlFor="workRegime" className="form-label">Carga Horária ou Regime de Trabalho</label>
                        <input 
                            type="text" 
                            className="form-control" 
                            name="workRegime" 
                            id="workRegime" 
                            placeholder="Carga Horária ou Regime de Trabalho"
                            value={values.workRegime}                
                            onChange={handleChange} />                
                        <ErrorMessage name="workRegime" className="input-error" />
                    </div>
                </div>
            </div>
            <br />
            <button type="submit" className="btn btn-primary" disabled={isSubmitting}>Salvar</button>
          </form>
        )}
      </Formik>
    </StudentBase>
  )
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const permission = Permission();
  return await permission.checkPermission(ctx, [UserType.STUDENT]);
};

