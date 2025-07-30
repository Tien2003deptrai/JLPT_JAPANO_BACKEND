var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DOCUMENT_NAME = 'Result';
var COLLECTION_NAME = 'Results';

var childAnswerSchema = new Schema({
  id: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  options: [{
    text: String,
    id: String
  }],
  userAnswer: {
    type: String,
    required: true
  },
  isCorrect: {
    type: Boolean,
    default: false
  },
  correctAnswer: {
    type: String
  },
  score: {
    type: Number,
    default: 0
  }
});

var answerSchema = new Schema({
  parentQuestionId: {
    type: String,
    required: true
  },
  paragraph: {
    type: String
  },
  imgUrl: {
    type: String
  },
  audioUrl: {
    type: String
  },
  childAnswers: [childAnswerSchema]
});

var resultSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    exam: {
      type: Schema.Types.ObjectId,
      ref: 'Exam',
      required: true
    },
    startTime: {
      type: Date,
      default: Date.now
    },
    endTime: {
      type: Date
    },
    totalScore: {
      type: Number,
      default: 0
    },
    isPassed: {
      type: Boolean,
      default: false
    },
    answers: [answerSchema],
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'abandoned'],
      default: 'in-progress'
    },
    timeSpent: {
      type: Number,
      default: 0
    },
    lastActivity: {
      type: Date,
      default: Date.now
    },
    markedQuestions: [String]
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

// Tạo index để tối ưu truy vấn
resultSchema.index({ user: 1, exam: 1, startTime: -1 });
resultSchema.index({ status: 1 });

module.exports = mongoose.model(DOCUMENT_NAME, resultSchema);
