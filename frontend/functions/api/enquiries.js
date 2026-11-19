import { handleEnquiry } from '../_lib/enquiryCore.mjs';

/** Existing form path. Same handler as /api/enquiry. */
export function onRequestPost(context) {
  return handleEnquiry(context, { requireTiming: true });
}
