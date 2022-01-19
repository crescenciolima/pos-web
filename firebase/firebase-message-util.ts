export default function FirebaseMessage(): { [key: string]: string; } {
    return {
        ['auth/email-already-in-use']: 'Este e-mail já está sendo utilizado. Tente outro.',
        ['auth/wrong-password']: 'Usuário ou senha incorretos.',
        ['auth/user-not-found']: 'Usuário ou senha incorretos.',
        ['auth/too-many-requests']: 'Serviço indisponível por excesso de tentativas.\nTente novamente mais tarde.',
        ['auth/weak-password']: 'Senha muito fraca. Tente outra.',
    };
};