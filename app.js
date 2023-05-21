const express = require('express');
const app = express();
app.use(express.json());
const bodyParser = require('body-parser');

const prepareCheckoutController = require('./controllers/prepare_checkout_controller');
const paymentStatusController = require('./controllers/payment_status_controller');
const registerAndPayController = require('./controllers/register_and_pay_controller');
const registerCardController = require('./controllers/register_card_controller');
const oneClickPaymentController = require('./controllers/one_click_payment_controller');
const deleteCardController = require('./controllers/delete_card_controller');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/prepare-checkout', prepareCheckoutController.prepareCheckout);
app.get('/payment-status/:checkoutId', paymentStatusController);
app.post('/register-and-pay', registerAndPayController.registerAndPay);
app.use('/register-card', registerCardController.registerCard);
app.post('/one-click-payment', oneClickPaymentController.oneClickPayment);
app.delete('/delete-card/:id', deleteCardController);

app.listen(3000, () => {
  console.log('Server started on port 3000');
});