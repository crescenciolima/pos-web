export default function FirebaseMessage(): { [key: string]: string; } {
    return {
        ['auth/email-already-in-use']: 'Este e-mail já está sendo utilizado. Tente outro.',
    };
};