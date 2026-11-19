import { handleEnquiry } from '../_lib/enquiryCore.mjs';

export function onRequestPost(context) {
  return handleEnquiry(context, { requireTiming: true });
}
