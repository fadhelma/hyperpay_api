const express = require('express');
const app = express();
app.use(express.json());
const querystring = require('querystring');
const https = require('https');

// ENTITY_IDS[0] for Mada ---- ENTITY_IDS[1] for Master & Visa
const ENTITY_IDS = ['8ac7a4c984e452310184e6d7b7611ab3','8ac7a4c97915fc49017917ebab6f03b6']
const ACCESS_TOKEN = "OGFjN2E0Yzk3OTE1ZmM0OTAxNzkxN2VhZTg0ZDAzYjJ8ZVlBelJ0M2ZIcg==";
const TEST_API = 'eu-test.oppwa.com';

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

//////////////////////////////////// Pay and register a new card ////////////////////////////////////
app.post('/register-and-pay', (req, res) => {
	const { paymentType, cardNumber, year, month, cvc, holderName, amount, saveCard } = req.body;
  
	// Validate required parameters
	if (!cardNumber || !year || !month || !paymentType || !cvc || !holderName || !amount || !saveCard) {
	  return res.status(400).json({ error: 'Missing required parameters' });
	}
  
	const request = async () => {
		const path='/v1/payments';
		const data = querystring.stringify({
		'entityId': paymentType == "MADA"? ENTITY_IDS[0] : ENTITY_IDS[1],
		'amount':amount,
		'currency':'SAR',
		// 'testMode':'EXTERNAL',
		'paymentType': paymentType == "MADA"? "DB" : "CD",
		'paymentBrand':paymentType,
		'card.cvv':cvc,
		'card.holder':holderName,
		'card.number':cardNumber,
		'card.expiryYear':year,
		'card.expiryMonth':month,
		'standingInstruction.mode':'INITIAL',
		'standingInstruction.source':'CIT',
		'createRegistration':saveCard
	  });
	  const options = {
		port: 443,
		host: TEST_API,
		path: path,
		method: 'POST',
		headers: {
		  'Content-Type': 'application/x-www-form-urlencoded',
		  'Content-Length': data.length,
		  'Authorization': `Bearer ${ACCESS_TOKEN}`
		}
	  };
  
	  try {
		const response = await sendRequest(options, data);
		return response;
	  } catch (error) {
		console.log(error);
		throw new Error('Failed to register the card');
	  }
	};
  
	request()
	  .then((response) => {
		res.status(200).json(response);
	  })
	  .catch((error) => {
		res.status(500).json({ error: error.message });
	  });
  });


//////////////////////////////////// Register a new card ////////////////////////////////////
app.post('/register-card', (req, res) => {
	const { paymentType, cardNumber, year,month , cvc, holderName } = req.body;
  
	// Validate required parameters
	if (!cardNumber || !year || !month || !paymentType || !cvc || !holderName) {
	  return res.status(400).json({ error: 'Missing required parameters' });
	}
  
	const request = async () => {
		const path='/v1/registrations';
		const data = querystring.stringify({
			'entityId': paymentType == "MADA"? ENTITY_IDS[0] : ENTITY_IDS[1],
			'amount':'10.00',
			'currency':'SAR',
			// 'testMode':'EXTERNAL',
			'paymentBrand':paymentType,
			'card.cvv':cvc,
			'card.holder':holderName,
			'card.number':cardNumber,
			'card.expiryYear':year,
			'card.expiryMonth':month
		});
		const options = {
			port: 443,
			host: TEST_API,
			path: path,
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
				'Content-Length': data.length,
				'Authorization':`Bearer ${ACCESS_TOKEN}`
			}
		};
		try {
			const response = await new Promise((resolve, reject) => {
			  const postRequest = https.request(options, function(res) {
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
	  
			return response;
		  } catch (error) {
			throw new Error('Failed to register the card');
		  }
		};
	  
		request()
		  .then((response) => {
			res.status(200).json(response);
		  })
		  .catch((error) => {
			res.status(500).json({ error: error.message });
		  });
  });

//////////////////////////////////// One-click payment ////////////////////////////////////
app.post('/one-click-payment', (req, res) => {
	const { paymentType, cardId, amount } = req.body;

	const request = async () => {
	  const path = `/v1/registrations/${cardId}/payments`;
	  const data = querystring.stringify({
		'entityId': paymentType == "MADA"? ENTITY_IDS[0] : ENTITY_IDS[1],
		'amount': amount,
		'currency': 'SAR',
		'paymentType': paymentType == "MADA"? "DB" : "CD",
		'standingInstruction.source': 'CIT',
		'standingInstruction.mode': 'REPEATED',
		'standingInstruction.type': 'UNSCHEDULED'
	  });
	  const options = {
		port: 443,
		host: TEST_API,
		path: path,
		method: 'POST',
		headers: {
		  'Content-Type': 'application/x-www-form-urlencoded',
		  'Content-Length': data.length,
		  'Authorization':`Bearer ${ACCESS_TOKEN}`
		}
	  };
  
	  try {
		const response = await new Promise((resolve, reject) => {
		  const postRequest = https.request(options, function(res) {
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
  
		return res.status(200).json(response);
	  } catch (error) {
		return res.status(500).json({ error: 'Failed to process the payment' });
	  }
	};
  
	request()
	  .catch((error) => {
		return res.status(500).json({ error: 'Failed to process the payment' });
	  });
  });

  
//////////////////////////////////// Remove a card by ID ////////////////////////////////////
app.delete('/delete-card/:id', (req, res) => {
	const cardId = req.params.id;
	const paymentType = req.body.paymentType;

	const deleteRequest = async () => {
	  var path = `/v1/registrations/${cardId}`;
	  path += `?entityId=${paymentType == "MADA"? ENTITY_IDS[0] : ENTITY_IDS[1]}`;
	  const options = {
		port: 443,
		host: TEST_API,
		path: path,
		method: 'DELETE',
		headers: {
			'Authorization':`Bearer ${ACCESS_TOKEN}`
		}
	  };
  
	  try {
		const response = await new Promise((resolve, reject) => {
		  const deleteRequest = https.request(options, function(res) {
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
		  deleteRequest.on('error', reject);
		  deleteRequest.end();
		});
  
		return res.status(200).json(response);
	  } catch (error) {
		return res.status(500).json({ error: 'Failed to delete the card' });
	  }
	};
  
	deleteRequest()
	  .catch((error) => {
		return res.status(500).json({ error: 'Failed to delete the card' });
	  });
  });
  
// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});