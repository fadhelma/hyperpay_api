const querystring = require('querystring');
const sendRequest = require('../utils/send_request');

require('dotenv').config();

const entityIds = process.env.ENTITY_IDS.split(", ");
const accessToken = process.env.ACCESS_TOKEN;
const api = process.env.API;

const RegisterAndPayController = {
  registerAndPay: async (req, res) => {
    const { paymentType, cardNumber, year, month, cvc, holderName, amount, saveCard } = req.body;

    if (!cardNumber || !year || !month || !paymentType || !cvc || !holderName || !amount || !saveCard) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const path = '/v1/payments';
    const data = querystring.stringify({
      'entityId': paymentType === "MADA" ? entityIds[0] : entityIds[1],
      'amount': amount,
      'currency': 'SAR',
      'paymentType': paymentType === "MADA" ? "DB" : "CD",
      'paymentBrand': paymentType,
      'card.cvv': cvc,
      'card.holder': holderName,
      'card.number': cardNumber,
      'card.expiryYear': year,
      'card.expiryMonth': month,
      'standingInstruction.mode': 'INITIAL',
      'standingInstruction.source': 'CIT',
      'createRegistration': "true"
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

module.exports = RegisterAndPayController;