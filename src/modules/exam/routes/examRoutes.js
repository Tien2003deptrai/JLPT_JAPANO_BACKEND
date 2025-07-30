var express = require('express');
var router = express.Router();
var ExamController = require('../controllers/ExamController');
var authMiddleware = require('../../../shared/middleware/authMiddleware');

router.get('/published', ExamController.getPublishedExams);

router.get('/take/:exam_id',
  authMiddleware.authenticateJWT,
  ExamController.getExamForTaking
);

router.post('/start/:exam_id',
  authMiddleware.authenticateJWT,
  ExamController.startExam
);

router.get('/list',
  authMiddleware.authenticateJWT,
  ExamController.getExams
);

router.post('',
  authMiddleware.authenticateJWT,
  authMiddleware.authorizeRoles(['admin', 'teacher']),
  ExamController.createExam
);

router.put('/:id',
  authMiddleware.authenticateJWT,
  authMiddleware.authorizeRoles(['admin', 'teacher']),
  ExamController.updateExam
);

router.delete('/:id',
  authMiddleware.authenticateJWT,
  authMiddleware.authorizeRoles(['admin', 'teacher']),
  ExamController.deleteExam
);

router.put('/:examId/questions',
  authMiddleware.authenticateJWT,
  authMiddleware.authorizeRoles(['admin', 'teacher']),
  ExamController.updateExamQuestions
);

router.get('/creator/:userId',
  authMiddleware.authenticateJWT,
  authMiddleware.authorizeRoles(['admin', 'teacher']),
  ExamController.getExamsByCreator
);

router.put('/:examId/schedule',
  authMiddleware.authenticateJWT,
  authMiddleware.authorizeRoles(['admin', 'teacher']),
  ExamController.updateExamSchedule
);

router.get('/:exam_id',
  authMiddleware.authenticateJWT,
  ExamController.getExamDetails
);

module.exports = router;
