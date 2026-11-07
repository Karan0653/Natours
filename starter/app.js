const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const path = require('path');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./Controller/errorController');
const tourRouter = require('./Routes/tourRoutes');
const userRouter = require('./Routes/userRoutes');
const reviewRouter = require('./Routes/reviewRoutes');
const viewRouter = require('./Routes/viewRoutes');
const bookingRouter = require('./Routes/bookingRoutes');

const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

//1. Global Middlewares
// to serve static files
app.use(express.static(path.join(__dirname, 'public')));

//Set security HTTP headers

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),

        'script-src': [
          "'self'",
          'https://sdk.cashfree.com',
          'https://api.mapbox.com',
        ],

        'connect-src': [
          "'self'",
          'https://api.cashfree.com',
          'https://sdk.cashfree.com',
          'https://api.mapbox.com',
          'https://events.mapbox.com',
          'ws://127.0.0.1:*',
        ],

        // Allow Mapbox to create blob-based workers
        'worker-src': ["'self'", 'blob:'],

        // Allow Cashfree checkout iframe
        'frame-src': ["'self'", 'https://sdk.cashfree.com'],

        'form-action': ["'self'", 'https://sandbox.cashfree.com'],
      },
    },
  }),
);

//dev logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

//limit requests
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour',
});
app.use('/api', limiter);

//body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

//Data sanitize against Nosql query injection
app.use(mongoSanitize());

//Data sanitize against xss
app.use(xss());

//prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

// ROUTING MIDDLEWARE
app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;

// app.get('/api/v1/tours', getAllTours);
// app.get('/api/v1/tour/:id', getTour);
// app.post('/api/v1/tours', createTour);
// app.patch('/api/v1/tour/:id', updateTour);
// app.delete('/api/v1/tour/:id', deleteTour);
