var ResultService = require('../services/ResultService');
var handleRequest = require('../../../shared/utils/baseController');
var throwError = require('../../../shared/errors/throwError');

var ResultController = {
  submitExam: function (req, res) {
    return handleRequest(res, function () {
      var attemptId = req.params.attemptId;
      var answers = req.body.answers;

      if (!answers || !Array.isArray(answers)) {
        throwError('Câu trả lời không hợp lệ');
      }

      return ResultService.submitExam(attemptId, answers);
    }, 'Nộp bài kiểm tra thành công');
  },

  getExamResult: function (req, res) {
    return handleRequest(res, function () {
      var userId = req.user ? req.user.userId : null;
      return ResultService.getExamResult(req.params.attemptId, userId);
    }, 'Kết quả bài kiểm tra');
  },

  getUserExamHistory: function (req, res) {
    return handleRequest(res, function () {
      var filters = {
        examId: req.query.examId,
        status: req.query.status,
        page: req.query.page,
        limit: req.query.limit
      };

      var userId = req.user ? req.user.userId : null;
      return ResultService.getUserExamHistory(userId, filters);
    }, 'Lịch sử kiểm tra');
  },

  checkExamTime: function (req, res) {
    return handleRequest(res, function () {
      return ResultService.checkExamTimeLimit(req.params.attemptId);
    }, 'Kiểm tra thời gian làm bài');
  },

  saveExamProgress: function (req, res) {
    return handleRequest(res, function () {
      var answers = req.body.answers;
      if (!answers || !Array.isArray(answers)) {
        throwError('Câu trả lời không hợp lệ');
      }
      return ResultService.saveExamProgress(req.params.attemptId, answers);
    }, 'Lưu tiến độ làm bài thành công');
  },

  getExamProgress: function (req, res) {
    return handleRequest(res, function () {
      return ResultService.getExamProgress(req.params.attemptId);
    }, 'Thông tin tiến độ làm bài');
  },

  markQuestionForReview: function (req, res) {
    return handleRequest(res, function () {
      var questionId = req.body.questionId;
      if (!questionId) {
        throwError('Question ID bắt buộc');
      }
      return ResultService.markQuestionForReview(req.params.attemptId, questionId);
    }, 'Đánh dấu câu hỏi thành công');
  },

  getStudentsByExam: function (req, res) {
    return handleRequest(res, function () {
      if (req.user.roles !== 'admin' && req.user.roles !== 'teacher') {
        throwError('Không có quyền xem danh sách học sinh', 403);
      }

      var examId = req.params.examId;
      if (!examId) {
        throwError('Exam ID bắt buộc');
      }

      return ResultService.getStudentsByExam(examId);
    }, 'Danh sách học sinh làm bài');
  },

  getResultByExamAndStudent: function (req, res) {
    return handleRequest(res, function () {
      if (req.user.roles !== 'admin' && req.user.roles !== 'teacher') {
        throwError('Không có quyền xem kết quả học sinh', 403);
      }

      var examId = req.params.examId;
      var studentId = req.params.studentId;

      if (!examId || !studentId) {
        throwError('Exam ID và Student ID bắt buộc');
      }

      return ResultService.getResultByExamAndStudent(examId, studentId);
    }, 'Kết quả bài thi của học sinh');
  }
};

module.exports = ResultController;
