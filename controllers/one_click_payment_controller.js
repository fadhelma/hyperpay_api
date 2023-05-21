const querystring = require('querystring');
const sendRequest = require('../utils/send_request');

require('dotenv').config();

const entityIds = process.env.ENTITY_IDS.split(", ");
const accessToken = process.env.ACCESS_TOKEN;
const api = process.env.API;

const OneClickPaymentController = {
  oneClickPayment: async (req, res) => {
    const { paymentType, cardId, amount } = req.body;

    const path = `/v1/registrations/${cardId}/payments`;
    const data = querystring.stringify({
      'entityId': paymentType === "MADA" ? entityIds[0] : entityIds[1],
      'amount': amount,
      'currency': 'SAR',
      'paymentType': paymentType === "MADA" ? "DB" : "CD",
      'standingInstruction.source': 'CIT',
      'standingInstruction.mode': 'REPEATED',
      'standingInstruction.type': 'UNSCHEDULED'
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
      res.status(500).json({ error: 'Failed to process the payment' });
    }
  }
};

module.exports = OneClickPaymentController;