export const MaskHelper = {
    makeMask: (value, mask = '', maskType = ''): string => {
      switch (maskType) {
        case 'phone':
          return MaskHelper.changeMaskPhone(value);
        case 'cpf':
          return MaskHelper.maskCpf();
        case 'cnpj':
          return MaskHelper.maskCnpj();
        case 'cep':
          return MaskHelper.maskCep();
        case 'other':
          return '';
        default:
          return mask;
      }
    },
  
    changeMaskPhone: (value) => {
      if (value !== undefined && value !== null) {
        const newValue = value.replace(/\D/g, '');
        if (newValue.slice(2, 3).indexOf(9) !== -1) {
          return '(99) 99999-9999';
        }
      }
      return '(99) 9999-9999';
    },
    
    maskCpf: () => {
      return '999.999.999-99';
    },
    
    maskCnpj: () => {
      return '99.999.999/9999-99';
    },
  
    maskCep: () => {
      return '99999-999';
    },
  }
  