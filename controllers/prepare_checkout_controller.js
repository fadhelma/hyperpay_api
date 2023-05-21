const querystring = require('querystring');
const sendRequest = require('../utils/send_request');

require('dotenv').config();

const entityIds = process.env.ENTITY_IDS.split(", ");
const accessToken = process.env.ACCESS_TOKEN;
const api = process.env.API;

const PrepareCheckoutController = {
  prepareCheckout: async (req, res) => {
    const { paymentType, amount } = req.body;

    const path = '/v1/checkouts';
    const data = querystring.stringify({
      'entityId': paymentType == "MADA" ? entityIds[0] : entityIds[1],
      'amount': amount,
      'currency': 'SAR',
      'paymentType': paymentType == "MADA" ? "DB" : "CD"
    });

    const options = {
      port: 443,
      host: api,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': data.length,
        'Authorization': `Bearer ${accessToken}`
      }
    };

    try {
      const result = await sendRequest(options, data);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = PrepareCheckoutController;