var ExamModel = require('../models/ExamModel');
var Utils = require('../../../shared/utils');

var ExamRepository = {
  findById: function (examId, populateRefs) {
    if (populateRefs === undefined) {
      populateRefs = true;
    }

    var query = ExamModel.findById(examId);

    if (populateRefs) {
      query = query.populate('creator', 'name email');
    }

    return query.lean();
  },

  findForTaking: function (examId) {
    return ExamModel
      .findById(examId)
      .select('-questions.childQuestions.correctAnswer')
      .lean();
  },

  findWithAnswers: function (examId) {
    return ExamModel
      .findById(examId)
      .lean();
  },

  create: function (examData) {
    return ExamModel.create(examData);
  },

  update: function (examId, updateData, returnNew) {
    if (returnNew === undefined) {
      returnNew = true;
    }

    return ExamModel
      .findByIdAndUpdate(examId, updateData, { new: returnNew })
      .lean();
  },

  deleteById: function (examId) {
    return ExamModel.deleteOne({ _id: examId });
  },

  findWithFilters: function (query, options) {
    if (options === undefined) {
      options = {};
    }

    var mongoQuery = ExamModel.find(query);

    // Apply selection
    if (options.select) {
      mongoQuery = mongoQuery.select(options.select);
    } else {
      mongoQuery = mongoQuery.select(
        '_id title description time_limit totalPoints level tags startTime endTime isPublished createdAt'
      );
    }

    // Apply population
    if (options.populate !== false) {
      // Population logic can be added here if needed
    }

    // Apply sorting
    if (options.sort) {
      mongoQuery = mongoQuery.sort(options.sort);
    } else {
      mongoQuery = mongoQuery.sort({ createdAt: -1 });
    }

    // Apply pagination
    if (options.page && options.limit) {
      var skip = (options.page - 1) * options.limit;
      mongoQuery = mongoQuery.skip(skip).limit(options.limit);
    }

    return mongoQuery.lean();
  },

  countWithFilters: function (query) {
    return ExamModel.countDocuments(query);
  },

  findByTagAndLevel: function (tags, level) {
    var query = {};

    if (tags && tags.length > 0) {
      query.tags = { $in: tags };
    }

    if (level) {
      query.level = level.toUpperCase();
    }

    return this.findWithFilters(query);
  },

  findByCreator: function (creatorId, options) {
    var query = { creator: Utils.convertToObjectId(creatorId) };
    return this.findWithFilters(query, options);
  },

  findPublished: function (filters, options) {
    var query = Object.assign({ isPublished: true }, filters || {});
    return this.findWithFilters(query, options);
  },

  checkUserAccess: function (userId, examId) {
    var userObjectId = Utils.convertToObjectId(userId);
    var examObjectId = Utils.convertToObjectId(examId);

    return ExamModel
      .findOne({
        _id: examObjectId,
        $or: [
          { allowedUsers: userObjectId },
          { creator: userObjectId },
          { isPublished: true }
        ]
      })
      .lean()
      .then(function (exam) {
        return !!exam;
      });
  },

  updateQuestions: function (examId, questions) {
    return this.update(examId, { questions: questions });
  },

  addQuestions: function (examId, newQuestions) {
    return ExamModel
      .findByIdAndUpdate(
        examId,
        { $push: { questions: { $each: newQuestions } } },
        { new: true }
      )
      .lean();
  },

  removeQuestion: function (examId, questionId) {
    return ExamModel
      .findByIdAndUpdate(
        examId,
        { $pull: { 'questions.childQuestions': { id: questionId } } },
        { new: true }
      )
      .lean();
  }
};

module.exports = ExamRepository;
