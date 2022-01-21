export default function AmazonMessage(): { [key: string]: string; } {
    return {
        ['Incorrect username or password.']: 'Usuário e/ou senha incorretos.',
        ['User is not confirmed.']: 'Confirme o usuário no email antes de logar.',
        ['Invalid email address format.']: 'Endereço de email com formato inválido.',
        ['An account with the given email already exists.']: 'Uma conta com esse email já existe no sistema.',
        ['Password did not conform with policy: Password not long enough']: 'Senha precisa ter no mínimo 8 caracteres',
        ['Password did not conform with policy: Password must have uppercase characters']: 'Senha precisa ter letras maiúsculas',
        ['Password did not conform with policy: Password must have numeric characters']: 'Senha precisaa ter números',
        ['Password did not conform with policy: Password must have symbol characters']: 'Senha precisa ter caracteres especiais'
    };
};