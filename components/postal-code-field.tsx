import { useField, useFormikContext } from "formik";
import { useEffect, useState } from "react";
import API from "../lib/api.service";
import MaskedInput from 'react-input-mask';
import { MaskHelper } from '../helpers/mask-helper';

export const PostalCodeField = (props) => {    
    const api = API();
    const [searching, setSearching] = useState(false);
    const {
      values: { postalCode },
      touched,
      setFieldValue,
      errors,
    } = useFormikContext() as any
    const [field] = useField(props)
    const [valid, setValid] = useState(false);
  
    useEffect(() => {
      let isCurrent = true
      if (postalCode.length === 9 && touched.postalCode && !errors.postalCode) {
        setSearching(true);
        api.getViaCep(postalCode.replace('-', '')).then(
          (address: any) => {
            setSearching(false);
            if (!!isCurrent && !address.erro) {
                setFieldValue(`street${props.type}`, address.logradouro)
                setFieldValue(`Complement${props.type}`, address.complemento)
                setFieldValue(`district${props.type}`, address.bairro)
                setFieldValue(`city${props.type}`, address.localidade)
                setFieldValue(`state${props.type}`, address.uf)
            } else if (address.erro){   
                setFieldValue(`street${props.type}`, '')
                setFieldValue(`complement${props.type}`, '')
                setFieldValue(`district${props.type}`, '')
                setFieldValue(`city${props.type}`, '')
                setFieldValue(`state${props.type}`, '')
            }
          },
          () => {
            setSearching(false);
            setFieldValue(`street${props.type}`, '')
            setFieldValue(`complement${props.type}`, '')
            setFieldValue(`district${props.type}`, '')
            setFieldValue(`city${props.type}`, '')
            setFieldValue(`state${props.type}`, '')
          }
        )
      }
      return () => {
        isCurrent = false
      }
    }, [postalCode, touched.postalCode, setFieldValue, props.name, errors.postalCode])
  
    return (
      <>
        <MaskedInput
          {...props}
          {...field}
          id="postalCode"
          className="form-control"
          maskChar=""
          disabled={!!props.disabled}  
          mask={MaskHelper.makeMask(field.value, '', 'cep')}
        />
        <p className="input-info">{searching && 'Pesquisando...'}</p>
      </>
    )
  }
  