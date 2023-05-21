const https = require('https');
const querystring = require('querystring');

const entityIds = process.env.ENTITY_IDS.split(", ");
const accessToken = process.env.ACCESS_TOKEN;
const api = process.env.API;

const deleteCardController = (req, res) => {
  const cardId = req.params.id;
  const paymentType = req.body.paymentType;

  const path = `/v1/registrations/${cardId}`;
  const query = querystring.stringify({
    entityId: paymentType == 'MADA' ? entityIds[0] : entityIds[1]
  });
  const options = {
    port: 443,
    host: api,
    path: `${path}?${query}`,
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  };

  const deleteRequest = https.request(options, (response) => {
    let data = '';
    response.on('data', (chunk) => {
      data += chunk;
    });
    response.on('end', () => {
      try {
        const result = JSON.parse(data);
        res.status(200).json(result);
      } catch (error) {
        res.status(500).json({ error: 'Failed to delete the card' });
      }
    });
  });

  deleteRequest.on('error', (error) => {
    res.status(500).json({ error: 'Failed to delete the card' });
  });

  deleteRequest.end();
};

module.exports = deleteCardController;