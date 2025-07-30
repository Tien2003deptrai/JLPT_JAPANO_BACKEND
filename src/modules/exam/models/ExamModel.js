var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var DOCUMENT_NAME = 'Exam';
var COLLECTION_NAME = 'Exams';

var questionSchema = new Schema({
  _id: {
    type: Schema.Types.ObjectId,
    auto: true
  },
  id: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['multiple_choice', 'fill_in', 'ordering', 'listening', 'reading'],
    default: 'multiple_choice'
  },
  content: {
    type: String,
    required: true
  },
  options: [{
    text: String,
    id: String
  }],
  correctAnswer: {
    type: String,
    required: true
  },
  point: {
    type: Number,
    default: 1
  }
});

var examSchema = new Schema(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    time_limit: {
      type: Number,
      required: true
    },
    totalPoints: {
      type: Number
    },
    level: {
      type: String,
      enum: ['N5', 'N4', 'N3', 'N2', 'N1'],
      required: true
    },
    sections: [
      {
        title: String,
        description: String,
        type: {
          type: String,
          enum: ['listening', 'reading', 'vocabulary', 'grammar']
        }
      }
    ],
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    isPublished: {
      type: Boolean,
      default: false
    },
    tags: [String],
    questions: [
      {
        parentQuestion: { type: String },
        paragraph: { type: String },
        imgUrl: { type: String },
        audioUrl: { type: String },
        childQuestions: [questionSchema]
      }
    ],
    allowedTime: {
      type: Number
    },
    passingScore: {
      type: Number
    },
    allowedAttempts: {
      type: Number,
      default: 1
    },
    allowedUsers: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    allowedGroups: [{
      type: String
    }],
    startTime: {
      type: Date
    },
    endTime: {
      type: Date
    },
    settings: {
      shuffleQuestions: {
        type: Boolean,
        default: false
      },
      showResults: {
        type: Boolean,
        default: true
      },
      showAnswers: {
        type: Boolean,
        default: false
      },
      preventCopy: {
        type: Boolean,
        default: false
      },
      fullScreen: {
        type: Boolean,
        default: false
      }
    }
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true
  }
);

// Tạo index để tối ưu truy vấn
examSchema.index({ level: 1, tags: 1 });
examSchema.index({ creator: 1 });

module.exports = mongoose.model(DOCUMENT_NAME, examSchema);
