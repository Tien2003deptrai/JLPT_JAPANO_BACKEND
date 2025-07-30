var mongoose = require('mongoose');

var DatabaseConfig = {
  connect: function () {
    var mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/japan_learning1';

    var options = {
      maxPoolSize: 10,
      maxIdleTimeMS: 30000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 5000,
      heartbeatFrequencyMS: 10000
    };

    return mongoose.connect(mongoUri, options);
  },

  disconnect: function () {
    return mongoose.disconnect();
  },

  getConnectionStatus: function () {
    var readyState = mongoose.connection.readyState;
    var states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    return states[readyState] || 'unknown';
  }
};

mongoose.connection.on('connected', function () {
  console.log('✅ MongoDB Connected Successfully');
  console.log('📍 Database:', mongoose.connection.db.databaseName);
  console.log('🌐 Host:', mongoose.connection.host + ':' + mongoose.connection.port);
});

mongoose.connection.on('error', function (error) {
  console.error('❌ MongoDB Connection Error:', error.message);
});

mongoose.connection.on('disconnected', function () {
  console.log('🔌 MongoDB Disconnected');
});

process.on('SIGINT', function () {
  mongoose.connection.close(function () {
    console.log('🛑 MongoDB connection closed due to application termination');
    process.exit(0);
  });
});

module.exports = DatabaseConfig;
