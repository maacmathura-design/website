// REACT_APP_* values are inlined at build time and are public. When unset, requests go to the
// same origin: in development the CRA proxy (package.json "proxy") forwards them to the API, and
// in production the web server must route /api to the backend.
export const API_BASE_URL = (process.env.REACT_APP_API_URL || '').trim().replace(/\/+$/, '');

export const ENQUIRY_ENDPOINT = `${API_BASE_URL}/api/enquiries`;
