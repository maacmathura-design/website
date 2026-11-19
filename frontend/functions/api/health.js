import { enquiryHealth } from '../_lib/enquiryCore.mjs';

/** Reports whether the Gmail settings are present. It does not connect to SMTP or reveal values. */
export function onRequestGet(context) {
  return enquiryHealth(context);
}
