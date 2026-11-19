import { onRequestPost as handlePost } from '../_lib/enquiryCore.mjs';

/** Existing form path. Same handler as /api/enquiry. */
export function onRequestPost(context) {
  return handlePost(context, { requireTiming: true });
}
