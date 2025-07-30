var ExamService = require('../services/ExamService');
var handleRequest = require('../../../shared/utils/baseController');
var throwError = require('../../../shared/errors/throwError');

var ExamController = {
  getExams: function (req, res) {
    return handleRequest(res, function () {
      var filters = {
        level: req.query.level,
        tags: req.query.tags,
        difficulty: req.query.difficulty,
        searchTerm: req.query.search,
        page: req.query.page,
        limit: req.query.limit
      };
      return ExamService.getExamsWithFilters(filters);
    }, 'Danh sách bài kiểm tra');
  },

  getExamDetails: function (req, res) {
    return handleRequest(res, function () {
      return ExamService.getExamById(req.params.exam_id);
    }, 'Chi tiết bài kiểm tra');
  },

  getExamForTaking: function (req, res) {
    return handleRequest(res, function () {
      return ExamService.getExamForTaking(req.params.exam_id, req.user.userId);
    }, 'Thông tin bài kiểm tra');
  },

  startExam: function (req, res) {
    return handleRequest(res, function () {
      return ExamService.startExam(req.params.exam_id, req.user.userId);
    }, 'Bắt đầu bài kiểm tra thành công');
  },

  createExam: function (req, res) {
    return handleRequest(res, function () {
      var examData = Object.assign({}, req.body, { creator: req.user.userId });
      return ExamService.createExam(examData);
    }, 'Tạo bài kiểm tra thành công');
  },

  updateExam: function (req, res) {
    return handleRequest(res, function () {
      return ExamService.updateExam(req.params.id, req.body);
    }, 'Cập nhật bài kiểm tra thành công');
  },

  deleteExam: function (req, res) {
    return handleRequest(res, function () {
      return ExamService.deleteExam(req.params.id);
    }, 'Xóa bài kiểm tra thành công');
  },

  updateExamQuestions: function (req, res) {
    return handleRequest(res, function () {
      return ExamService.updateExamQuestions(req.params.examId, req.body.newQuestions);
    }, 'Cập nhật câu hỏi thành công');
  },

  getExamsByCreator: function (req, res) {
    return handleRequest(res, function () {
      var options = {
        sort: { createdAt: -1 },
        page: req.query.page,
        limit: req.query.limit
      };

      return ExamService.getExamsByCreator(req.params.userId, options);
    }, 'Danh sách bài kiểm tra của giáo viên');
  },

  getPublishedExams: function (req, res) {
    return handleRequest(res, function () {
      var filters = {
        level: req.query.level,
        tags: req.query.tags
      };

      var options = {
        page: req.query.page,
        limit: req.query.limit,
        sort: { createdAt: -1 }
      };

      return ExamService.getPublishedExams(filters, options);
    }, 'Danh sách bài kiểm tra đã công bố');
  },

  updateExamSchedule: function (req, res) {
    return handleRequest(res, function () {
      if (req.body.startTime && req.body.endTime) {
        if (!req.body.startTime || !req.body.endTime) {
          throwError('Cần cung cấp cả startTime và endTime');
        }
      }

      return ExamService.updateExamSchedule(req.params.examId, req.body);
    }, 'Cập nhật lịch thi thành công');
  }
};

module.exports = ExamController;
