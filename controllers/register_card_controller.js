const querystring = require('querystring');
const sendRequest = require('../utils/send_request');

require('dotenv').config();

const entityIds = process.env.ENTITY_IDS.split(", ");
const accessToken = process.env.ACCESS_TOKEN;
const api = process.env.API;

const RegisterCardController = {
  registerCard: async (req, res) => {
    const { paymentType, cardNumber, year, month, cvc, holderName } = req.body;

    if (!cardNumber || !year || !month || !paymentType || !cvc || !holderName) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const path = '/v1/registrations';
    const data = querystring.stringify({
      'entityId': paymentType === "MADA" ? entityIds[0] : entityIds[1],
      'amount': '10.00',
      'currency': 'SAR',
      'paymentBrand': paymentType,
      'card.cvv': cvc,
      'card.holder': holderName,
      'card.number': cardNumber,
      'card.expiryYear': year,
      'card.expiryMonth': month
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

module.exports = RegisterCardController;