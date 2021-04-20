/// <reference types="next" />
/// <reference types="next/types/global" />

module.exports = {
    /* config options here */
    env: {
      FB_API_KEY: process.env.FB_API_KEY,
      FB_AUTH_DOMAIN: process.env.FB_AUTH_DOMAIN,
      FB_PROJECT_ID: process.env.FB_PROJECT_ID,
      FB_STORAGE_BUCKET: process.env.FB_STORAGE_BUCKET,
      FB_MESSAGING_SENDER_ID: process.env.FB_MESSAGING_SENDER_ID,
      FB_APP_ID: process.env.FB_APP_ID,
      API_URL: process.env.API_URL

    },
}