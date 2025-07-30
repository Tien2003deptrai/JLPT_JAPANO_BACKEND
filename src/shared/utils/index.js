var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var crypto = require('crypto');
var _ = require('lodash');

var Utils = {
  convertToObjectId: function (id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      console.log('Invalid ObjectId:', id);
      return id;
    }
    return new mongoose.Types.ObjectId(id);
  },

  getInfoData: function (options) {
    var fields = options.fields || [];
    var object = options.object || {};
    return _.pick(object, fields);
  },

  removeUndefinedKeys: function (obj) {
    Object.keys(obj).forEach(function (key) {
      if (obj[key] == null) {
        delete obj[key];
      }
    });
    return obj;
  },

  generateToken: function (user) {
    if (!user || !user._id) {
      throw new Error('Invalid user data for token generation');
    }

    return jwt.sign(
      {
        id: user._id.toString(),
        email: user.email,
        roles: user.roles
      },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '7d' }
    );
  },

  generateRandomPassword: function (length) {
    if (length === undefined) {
      length = 10;
    }
    return crypto.randomBytes(length).toString('hex').slice(0, length);
  },

  formatTimeSpent: function (startTime, endTime) {
    var start = new Date(startTime);
    var end = new Date(endTime);
    var diffMs = end - start;
    var diffMinutes = Math.floor(diffMs / (1000 * 60));
    return diffMinutes + ' phút';
  },

  calculateRemainingTime: function (startTime, timeLimitMinutes) {
    var currentTime = new Date();
    var timeSpent = Math.floor((currentTime - startTime) / 1000);
    var timeLimitInSeconds = timeLimitMinutes * 60;
    var remainingTime = timeLimitInSeconds - timeSpent;

    return {
      remainingTime: Math.max(0, remainingTime),
      timeSpent: timeSpent,
      timeLimit: timeLimitInSeconds,
      isTimeUp: remainingTime <= 0
    };
  },

  isValidExamLevel: function (level) {
    var validLevels = ['N1', 'N2', 'N3', 'N4', 'N5'];
    return validLevels.includes(level);
  },

  getPassingScore: function (level) {
    var passingScores = {
      N1: 100,
      N2: 90,
      N3: 95,
      N4: 90,
      N5: 80
    };
    return passingScores[level] || 80;
  }
};

module.exports = Utils;
