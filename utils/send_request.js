const https = require('https');

const sendRequest = (options, data) => {
  return new Promise((resolve, reject) => {
    const postRequest = https.request(options, function (res) {
      const buf = [];
      res.on('data', chunk => {
        buf.push(Buffer.from(chunk));
      });
      res.on('end', () => {
        const jsonString = Buffer.concat(buf).toString('utf8');
        try {
          resolve(JSON.parse(jsonString));
        } catch (error) {
          reject(error);
        }
      });
    });
    postRequest.on('error', reject);
    postRequest.write(data);
    postRequest.end();
  });
};

module.exports = sendRequest;