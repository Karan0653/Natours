const { Cashfree } = require('cashfree-pg');
const crypto = require('crypto');
const Booking = require('../Models/bookingModel');
const Tour = require('../Models/tourModel');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

// Initialize Cashfree
const cashfree = new Cashfree(
  Cashfree.SANDBOX,
  process.env.CASHFREE_CLIENT_ID,
  process.env.CASHFREE_CLIENT_SECRET,
);

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);

  if (!tour) {
    return next(new AppError('No tour found with that ID', 404));
  }

  // 2) Generate a unique order ID
  const orderId = `order_${crypto.randomUUID()}`;

  // 3) Prepare the customer details
  const customerDetails = {
    customer_id: String(req.user.id),
    customer_name: req.user.name,
    customer_email: req.user.email,
    customer_phone: process.env.CASHFREE_TEST_PHONE,
  };

  // 4) Prepare the order request
  const request = {
    order_id: orderId,
    order_amount: Number(tour.price.toFixed(2)),
    order_currency: 'INR',

    customer_details: customerDetails,

    order_meta: {
      return_url: `${req.protocol}://${req.get('host')}?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,
    },

    order_note: `${tour.name} Tour booking`,

    order_tags: {
      tour_id: String(tour._id),
      user_id: String(req.user.id),
    },
  };

  // 5) Create order using Cashfree SDK
  const response = await cashfree.PGCreateOrder(request);

  // 6) Send payment session details to frontend
  res.status(200).json({
    status: 'success',
    paymentSessionId: response.data.payment_session_id,
    orderId: response.data.order_id,
  });
});

exports.createBookingCheckout = catchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;

  if (!tour && !user && !price) return next();

  await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
});

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBooking = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
