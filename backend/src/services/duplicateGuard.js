const crypto = require('node:crypto');

const MAX_ENTRIES = 5000;

/**
 * Remembers recent enquiries (by mobile, email and course) so a double click, a retry or a
 * resubmission does not email the team twice. In-memory: it resets on restart and is not shared
 * between processes, which is acceptable for a single-instance API.
 */
function createDuplicateGuard({ windowMs, now = () => Date.now() }) {
  const entries = new Map();

  const keyFor = ({ mobile, email, course }) =>
    crypto.createHash('sha256').update(`${mobile}|${email}|${course}`).digest('hex');

  const prune = () => {
    const current = now();
    for (const [key, expiresAt] of entries) {
      if (expiresAt <= current) entries.delete(key);
    }
    while (entries.size > MAX_ENTRIES) entries.delete(entries.keys().next().value);
  };

  return {
    /** Claims the enquiry. Returns false when the same enquiry is in flight or was sent recently. */
    claim(enquiry) {
      prune();
      const key = keyFor(enquiry);
      if (entries.has(key)) return false;
      entries.set(key, now() + windowMs);
      return true;
    },
    /** Frees a claim after a failed send so the student can retry. */
    release(enquiry) {
      entries.delete(keyFor(enquiry));
    },
  };
}

module.exports = { createDuplicateGuard };
