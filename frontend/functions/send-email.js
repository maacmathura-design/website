import { handleEnquiry } from './_lib/enquiryCore.mjs';

/** Legacy path used by pages cached before the redesign. It does not require form timing. */
export function onRequestPost(context) {
  return handleEnquiry(context, { requireTiming: false });
}
