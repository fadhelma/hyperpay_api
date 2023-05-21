const https = require('https');
const querystring = require('querystring');

const entityIds = process.env.ENTITY_IDS.split(", ");
const accessToken = process.env.ACCESS_TOKEN;
const api = process.env.API;

const paymentStatusController = (req, res) => {
  const checkoutId = req.params.checkoutId;
  const paymentType = req.body.paymentType;

  const path = `/v1/checkouts/${checkoutId}/payment`;
  const query = querystring.stringify({
    entityId: paymentType == 'MADA' ? entityIds[0] : entityIds[1]
  });
  const options = {
    port: 443,
    host: api,
    path: `${path}?${query}`,
    method: 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  };

  const getRequest = https.request(options, (response) => {
    let data = '';
    response.on('data', (chunk) => {
      data += chunk;
    });
    response.on('end', () => {
      try {
        const result = JSON.parse(data);
        res.status(200).json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });
  });

  getRequest.on('error', (error) => {
    res.status(500).json({ error: error.message });
  });

  getRequest.end();
};

module.exports = paymentStatusController;