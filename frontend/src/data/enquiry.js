// Values must match backend/src/enquiryOptions.json; enquiry.test.js checks they do.

export const qualificationOptions = [
  { value: '10th', label: '10th (Secondary)' },
  { value: '12th', label: '12th (Higher Secondary)' },
  { value: 'diploma', label: 'Diploma' },
  { value: 'graduate', label: 'Graduate' },
  { value: 'postgraduate', label: 'Postgraduate' },
  { value: 'other', label: 'Other' },
];

export const callbackTimeOptions = [
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
  { value: 'anytime', label: 'Any time' },
];

export const FORM_LOCATION = { page: 'page', popup: 'popup' };

export const ENQUIRY_LIMITS = { name: 80, email: 120, message: 1000 };
