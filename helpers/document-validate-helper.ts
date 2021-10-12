export const DocumentValidateHelper = {
    documentValidate: (document): boolean => {
      let valid;
      if(document.length === 14 && !DocumentValidateHelper.validateCpf(document)){          
        valid = 'CPF inválido.';
      } 
      return valid;
    },
    
    validateCpf: (document) => {
      let cpf = document.trim();
       
      cpf = cpf.replace(/\./g, '');
      cpf = cpf.replace('-', '');
      cpf = cpf.split('');
      
      let v1 = 0;
      let v2 = 0;
      let aux = false;
      
      for (let i = 1; cpf.length > i; i++) {
          if (parseInt(cpf[i - 1]) !== parseInt(cpf[i])) {
              aux = true;   
          }
      } 
      
      if (aux === false) {
          return false; 
      } 
      
      for (let i = 0, p = 10; (cpf.length - 2) > i; i++, p--) {
          v1 += parseInt(cpf[i]) * p; 
      } 
      
      v1 = ((v1 * 10) % 11);
      
      if (v1 === 10) {
          v1 = 0; 
      }
      
      if (v1 !== parseInt(cpf[9])) {
          return false; 
      } 
      
      for (let i = 0, p = 11; (cpf.length - 1) > i; i++, p--) {
          v2 += parseInt(cpf[i]) * p; 
      } 
      
      v2 = ((v2 * 10) % 11);
      
      if (v2 === 10) {
          v2 = 0; 
      }
      
      if (v2 !== parseInt(cpf[10])) {
          return false; 
      } else {   
          return true; 
      }
    }
  }
  