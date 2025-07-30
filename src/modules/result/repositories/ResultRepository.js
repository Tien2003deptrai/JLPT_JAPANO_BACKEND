var ResultModel = require('../models/ResultModel');
var Utils = require('../../../shared/utils');

var ResultRepository = {
  findById: function (resultId, populateRefs) {
    if (populateRefs === undefined) {
      populateRefs = false;
    }

    var query = ResultModel.findById(resultId);

    if (populateRefs) {
      query = query.populate('user', 'name email').populate('exam', 'title level');
    }

    return query.lean();
  },

  create: function (resultData) {
    return ResultModel.create(resultData);
  },

  update: function (resultId, updateData, returnNew) {
    if (returnNew === undefined) {
      returnNew = true;
    }

    return ResultModel
      .findByIdAndUpdate(resultId, updateData, { new: returnNew })
      .lean();
  },

  findInProgressAttempt: function (userId, examId) {
    return ResultModel
      .findOne({
        user: Utils.convertToObjectId(userId),
        exam: Utils.convertToObjectId(examId),
        status: 'in-progress'
      })
      .lean();
  },

  countAttempts: function (userId, examId) {
    return ResultModel.countDocuments({
      user: Utils.convertToObjectId(userId),
      exam: Utils.convertToObjectId(examId)
    });
  },

  countCompletedAttempts: function (userId, examId) {
    return ResultModel.countDocuments({
      user: Utils.convertToObjectId(userId),
      exam: Utils.convertToObjectId(examId),
      status: 'completed'
    });
  },

  findByUser: function (userId, filters, options) {
    if (filters === undefined) {
      filters = {};
    }
    if (options === undefined) {
      options = {};
    }

    var query = Object.assign({ user: Utils.convertToObjectId(userId) }, filters);

    var mongoQuery = ResultModel.find(query);

    // Apply population
    if (options.populate !== false) {
      mongoQuery = mongoQuery.populate('exam', 'title level tags passingScore');
    }

    // Apply sorting
    if (options.sort) {
      mongoQuery = mongoQuery.sort(options.sort);
    } else {
      mongoQuery = mongoQuery.sort({ startTime: -1 });
    }

    // Apply pagination
    if (options.page && options.limit) {
      var skip = (options.page - 1) * options.limit;
      mongoQuery = mongoQuery.skip(skip).limit(options.limit);
    }

    return mongoQuery.lean();
  },

  countByUser: function (userId, filters) {
    if (filters === undefined) {
      filters = {};
    }

    var query = Object.assign({ user: Utils.convertToObjectId(userId) }, filters);
    return ResultModel.countDocuments(query);
  },

  findByExam: function (examId, options) {
    if (options === undefined) {
      options = {};
    }

    var query = { exam: Utils.convertToObjectId(examId) };

    var mongoQuery = ResultModel.find(query);

    // Apply population
    if (options.populate !== false) {
      mongoQuery = mongoQuery.populate('user', 'name email');
    }

    // Apply sorting
    if (options.sort) {
      mongoQuery = mongoQuery.sort(options.sort);
    } else {
      mongoQuery = mongoQuery.sort({ totalScore: -1, timeSpent: 1 });
    }

    // Apply limit
    if (options.limit) {
      mongoQuery = mongoQuery.limit(options.limit);
    }

    return mongoQuery.lean();
  },

  getExamResults: function (examId, limit) {
    if (limit === undefined) {
      limit = 10;
    }

    return ResultModel
      .find({
        exam: Utils.convertToObjectId(examId),
        status: 'completed'
      })
      .populate('user', 'name email avatar')
      .sort({ totalScore: -1, timeSpent: 1 })
      .limit(limit)
      .lean();
  },

  findByExamAndUser: function (examId, userId) {
    return ResultModel
      .findOne({
        exam: Utils.convertToObjectId(examId),
        user: Utils.convertToObjectId(userId)
      })
      .populate('user', 'name email')
      .lean();
  },

  deleteByExam: function (examId) {
    return ResultModel.deleteMany({ exam: Utils.convertToObjectId(examId) });
  },

  deleteByUser: function (userId) {
    return ResultModel.deleteMany({ user: Utils.convertToObjectId(userId) });
  },

  findStudentsByExam: function (examId) {
    return ResultModel
      .find({ exam: Utils.convertToObjectId(examId) })
      .populate('user', 'name email')
      .select('user totalScore isPassed timeSpent status')
      .lean();
  },

  updateLastActivity: function (resultId) {
    return this.update(resultId, { lastActivity: new Date() });
  },

  markQuestionForReview: function (resultId, questionId) {
    return ResultModel
      .findByIdAndUpdate(
        resultId,
        { $addToSet: { markedQuestions: questionId } },
        { new: true }
      )
      .lean();
  },

  saveProgress: function (resultId, answers) {
    return this.update(resultId, {
      answers: answers,
      lastSaved: new Date(),
      lastActivity: new Date()
    });
  }
};

module.exports = ResultRepository;
