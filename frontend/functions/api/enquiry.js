import { onRequestPost as handlePost } from '../_lib/enquiryCore.mjs';

export function onRequestPost(context) {
  return handlePost(context, { requireTiming: true });
}
