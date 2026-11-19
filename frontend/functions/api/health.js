import { enquiryHealth } from '../_lib/enquiryCore.mjs';

/** Reports whether the mail bindings are present. It does not call Resend or reveal their values. */
export function onRequestGet(context) {
  return enquiryHealth(context);
}
