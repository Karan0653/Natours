/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';

const cashfree = Cashfree({
  mode: 'sandbox',
});

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from our backend
    const session = await axios(
      `/api/v1/bookings/checkout-session/${tourId}`,
    );

    // console.log(session);

    // 2) Extract payment session ID
    const paymentSessionId = session.data.paymentSessionId;

    // 3) Open Cashfree Checkout
    await cashfree.checkout({
      paymentSessionId: paymentSessionId,
      redirectTarget: '_self',
    });
  } catch (err) {
    // console.log(err);
    showAlert('error', err.message || 'Payment initialization failed');
  }
};
