var express = require('express');
var cors = require('cors');
var helmet = require('helmet');
var rateLimit = require('express-rate-limit');
require('dotenv').config();

var DatabaseConfig = require('./config/database');

var examRoutes = require('./modules/exam/routes/examRoutes');
var resultRoutes = require('./modules/result/routes/resultRoutes');
var userRoutes = require('./modules/user/routes/userRoutes');

var ApiResponse = require('./shared/response/ApiResponse');

var app = express();

DatabaseConfig.connect()
  .then(function () {
    console.log('🎉 Database connection established');
  })
  .catch(function (error) {
    console.error('💥 Failed to connect to database:', error.message);
    console.error('🔧 Please check your MongoDB connection and try again');
    process.exit(1);
  });

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));

var limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(function (req, res, next) {
  console.log('[' + new Date().toISOString() + '] ' + req.method + ' ' + req.url);
  next();
});

app.get('/health', function (req, res) {
  var dbStatus = DatabaseConfig.getConnectionStatus();
  var isHealthy = dbStatus === 'connected';

  var responseData = {
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    status: isHealthy ? 'healthy' : 'unhealthy',
    database: {
      status: dbStatus,
      type: 'MongoDB'
    },
    modules: ['user', 'exam', 'result']
  };

  if (isHealthy) {
    ApiResponse.success(res, 'Japan Backend API is running', responseData);
  } else {
    ApiResponse.error(res, 'Service temporarily unavailable - Database connection issue', 503);
  }
});

app.use('/api/auth', userRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/results', resultRoutes);

app.get('/', function (req, res) {
  ApiResponse.success(res, 'Welcome to Japan Learning Platform Backend API', {
    version: '1.0.0',
    modules: ['user', 'exam', 'result'],
    database: {
      status: DatabaseConfig.getConnectionStatus(),
      type: 'MongoDB'
    },
    endpoints: {
      health: '/health',
      users: '/api/users',
      exams: '/api/exams',
      results: '/api/results'
    }
  });
});

app.use(function (req, res) {
  ApiResponse.error(res, 'Endpoint not found', 404);
});

app.use(function (error, req, res, next) {
  console.error('Global Error:', error);

  var statusCode = error.statusCode || error.status || 500;
  var message = error.message || 'Internal Server Error';

  // Handle database errors
  if (error.name === 'MongoError' || error.name === 'MongooseError') {
    statusCode = 500;
    message = 'Database error occurred';
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal Server Error';
  }

  ApiResponse.error(res, message, statusCode);
});

var PORT = process.env.PORT || 3000;
var HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, function () {
  console.log('============================================');
  console.log('🚀 Japan Backend API Server Started');
  console.log('============================================');
  console.log('📡 Server: http://' + HOST + ':' + PORT);
  console.log('🏥 Health: http://' + HOST + ':' + PORT + '/health');
  console.log('👤 Users:  http://' + HOST + ':' + PORT + '/api/users');
  console.log('📚 Exams:  http://' + HOST + ':' + PORT + '/api/exams');
  console.log('📊 Results: http://' + HOST + ':' + PORT + '/api/results');
  console.log('============================================');
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('Database:', DatabaseConfig.getConnectionStatus());
  console.log('Modules: User, Exam, Result');
  console.log('Architecture: Clean Architecture with ES5');
  console.log('============================================');
});

module.exports = app;
