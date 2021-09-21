const convertLineBreaks = (key:string) => {
    while(key.includes("\\n")){
        key = key.replace("\\n","\n");
    }
    return key
}


const FirebaseAdminSdkCredentials = {
    "type": "service_account",
    "project_id": process.env.FB_PROJECT_ID,
    "private_key_id": process.env.FB_ADMIN_PRIVATE_KEY_ID,
    "private_key": convertLineBreaks(process.env.FB_ADMIN_PRIVATE_KEY.toString()),
    "client_email": process.env.FB_ADMIN_CLIENT_EMAIL,
    "client_id": process.env.FB_ADMIN_CLIENT_ID,
    "auth_uri": process.env.FB_ADMIN_AUTH_URI,
    "token_uri": process.env.FB_ADMIN_TOKEN_URI,
    "auth_provider_x509_cert_url": process.env.FB_ADMIN_AUTH_PROVIDER_X509_CERT_URL,
    "client_x509_cert_url": process.env.FB_ADMIN_CLIENT_X509_CERT_URL
  };

export default FirebaseAdminSdkCredentials;