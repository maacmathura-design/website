/**
 * One JSON line per event. Callers pass event names and non-personal fields only
 * (course ids, error codes); student details and credentials are never logged.
 */
function write(stream, level, event, fields) {
  stream.write(`${JSON.stringify({ time: new Date().toISOString(), level, event, ...fields })}\n`);
}

const logger = {
  info: (event, fields = {}) => write(process.stdout, 'info', event, fields),
  warn: (event, fields = {}) => write(process.stderr, 'warn', event, fields),
  error: (event, fields = {}) => write(process.stderr, 'error', event, fields),
};

const silentLogger = { info() {}, warn() {}, error() {} };

module.exports = { logger, silentLogger };
