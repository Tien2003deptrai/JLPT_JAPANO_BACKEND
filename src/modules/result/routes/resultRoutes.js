var express = require('express');
var router = express.Router();
var ResultController = require('../controllers/ResultController');
var authMiddleware = require('../../../shared/middleware/authMiddleware');

router.post('/submit/:attemptId',
  // authMiddleware.authenticateJWT,
  ResultController.submitExam
);

// Get exam result by attempt ID
router.get('/attempt/:attemptId',
  // authMiddleware.authenticateJWT,
  ResultController.getExamResult
);

// Get user exam history
router.get('/history',
  // authMiddleware.authenticateJWT,
  ResultController.getUserExamHistory
);

// Get exam history by exam ID
router.get('/history/:examId',
  // authMiddleware.authenticateJWT,
  ResultController.getUserExamHistory
);

// Check exam time limit
router.get('/check-time/:attemptId',
  // authMiddleware.authenticateJWT,
  ResultController.checkExamTime
);

// Save exam progress
router.post('/save-progress/:attemptId',
  // authMiddleware.authenticateJWT,
  ResultController.saveExamProgress
);

// Get exam progress
router.get('/progress/:attemptId',
  // authMiddleware.authenticateJWT,
  ResultController.getExamProgress
);

// Mark question for review
router.post('/mark-question/:attemptId',
  // authMiddleware.authenticateJWT,
  ResultController.markQuestionForReview
);

router.get('/exam/:examId/students',
  authMiddleware.authenticateJWT,
  authMiddleware.authorizeRoles(['admin', 'teacher']),
  ResultController.getStudentsByExam
);

router.get('/exam/:examId/student/:studentId',
  authMiddleware.authenticateJWT,
  authMiddleware.authorizeRoles(['admin', 'teacher']),
  ResultController.getResultByExamAndStudent
);

module.exports = router;
