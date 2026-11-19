// Same-origin enquiry API. Cloudflare Pages Functions serve this path. In local CRA development
// src/setupProxy.js forwards it to the Express API, which remains until that migration is approved.
export const ENQUIRY_ENDPOINT = '/api/enquiries';
