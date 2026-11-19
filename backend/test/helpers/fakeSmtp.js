const net = require('node:net');

/**
 * Minimal SMTP server for tests. `mode`:
 *  - 'accept'      authenticates and accepts mail (messages are collected)
 *  - 'auth_fail'   answers AUTH with 535, as Gmail does for a wrong app password
 *  - 'reject_data' authenticates but refuses the message after DATA
 */
function startFakeSmtp(mode = 'accept') {
  const messages = [];
  const server = net.createServer((socket) => {
    let buffer = '';
    let inData = false;
    let data = '';
    const reply = (line) => socket.write(`${line}\r\n`);
    reply('220 fake.smtp ESMTP ready');

    socket.on('data', (chunk) => {
      buffer += chunk.toString('utf8');
      let index;
      while ((index = buffer.indexOf('\r\n')) !== -1) {
        const line = buffer.slice(0, index);
        buffer = buffer.slice(index + 2);

        if (inData) {
          if (line === '.') {
            inData = false;
            if (mode === 'reject_data') reply('554 5.7.0 Message rejected');
            else {
              messages.push(data);
              reply('250 2.0.0 OK queued');
            }
            data = '';
          } else {
            data += `${line.startsWith('..') ? line.slice(1) : line}\n`;
          }
          continue;
        }

        const command = line.split(' ')[0].toUpperCase();
        if (command === 'EHLO' || command === 'HELO') reply('250-fake.smtp\r\n250 AUTH PLAIN LOGIN');
        else if (command === 'AUTH') reply(mode === 'auth_fail' ? '535 5.7.8 Username and Password not accepted' : '235 2.7.0 Accepted');
        else if (command === 'MAIL' || command === 'RCPT' || command === 'RSET' || command === 'NOOP') reply('250 OK');
        else if (command === 'DATA') {
          inData = true;
          reply('354 Go ahead');
        } else if (command === 'QUIT') {
          reply('221 Bye');
          socket.end();
        } else reply('502 Command not implemented');
      }
    });
    socket.on('error', () => {});
  });

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      resolve({
        port: server.address().port,
        messages,
        close: () => new Promise((done) => server.close(done)),
      });
    });
  });
}

module.exports = { startFakeSmtp };
