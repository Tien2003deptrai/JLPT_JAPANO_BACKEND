function CreateExamDto(data) {
  this.title = data.title;
  this.description = data.description;
  this.time_limit = data.time_limit;
  this.level = data.level;
  this.creator = data.creator;
  this.tags = data.tags;
  this.questions = data.questions;
  this.allowedTime = data.allowedTime;
  this.passingScore = data.passingScore;
  this.allowedAttempts = data.allowedAttempts;
  this.startTime = data.startTime;
  this.endTime = data.endTime;
  this.settings = data.settings;
}

function UpdateExamDto(data) {
  if (data.title !== undefined) this.title = data.title;
  if (data.description !== undefined) this.description = data.description;
  if (data.time_limit !== undefined) this.time_limit = data.time_limit;
  if (data.level !== undefined) this.level = data.level;
  if (data.tags !== undefined) this.tags = data.tags;
  if (data.allowedTime !== undefined) this.allowedTime = data.allowedTime;
  if (data.passingScore !== undefined) this.passingScore = data.passingScore;
  if (data.allowedAttempts !== undefined) this.allowedAttempts = data.allowedAttempts;
  if (data.startTime !== undefined) this.startTime = data.startTime;
  if (data.endTime !== undefined) this.endTime = data.endTime;
  if (data.settings !== undefined) this.settings = data.settings;
}

function ExamListDto(exam) {
  this.id = exam._id;
  this.title = exam.title;
  this.description = exam.description;
  this.time_limit = exam.time_limit;
  this.totalPoints = exam.totalPoints;
  this.level = exam.level;
  this.tags = exam.tags;
  this.startTime = exam.startTime;
  this.endTime = exam.endTime;
  this.isPublished = exam.isPublished;
  this.createdAt = exam.createdAt;
}

function ExamDetailDto(exam) {
  this.id = exam._id;
  this.title = exam.title;
  this.description = exam.description;
  this.time_limit = exam.time_limit;
  this.totalPoints = exam.totalPoints;
  this.level = exam.level;
  this.sections = exam.sections;
  this.tags = exam.tags;
  this.creator = exam.creator;
  this.questions = exam.questions;
  this.allowedTime = exam.allowedTime;
  this.passingScore = exam.passingScore;
  this.allowedAttempts = exam.allowedAttempts;
  this.startTime = exam.startTime;
  this.endTime = exam.endTime;
  this.settings = exam.settings;
  this.isPublished = exam.isPublished;
  this.createdAt = exam.createdAt;
  this.updatedAt = exam.updatedAt;
}

function ExamForTakingDto(exam) {
  this.id = exam._id;
  this.title = exam.title;
  this.description = exam.description;
  this.time_limit = exam.time_limit || 60;
  this.totalPoints = exam.totalPoints;
  this.level = exam.level;
  this.sections = exam.sections;
  this.tags = exam.tags;
  this.allowedTime = exam.allowedTime;
  this.allowedAttempts = exam.allowedAttempts;
  this.settings = exam.settings;

  // Remove correct answers from questions
  this.questions = exam.questions ? exam.questions.map(function (parentQuestion) {
    return {
      _id: parentQuestion._id,
      parentQuestion: parentQuestion.parentQuestion,
      paragraph: parentQuestion.paragraph,
      imgUrl: parentQuestion.imgUrl,
      audioUrl: parentQuestion.audioUrl,
      childQuestions: parentQuestion.childQuestions.map(function (childQuestion) {
        return {
          _id: childQuestion._id,
          id: childQuestion.id,
          type: childQuestion.type,
          content: childQuestion.content,
          options: childQuestion.options,
          point: childQuestion.point
          // correctAnswer is intentionally excluded
        };
      })
    };
  }) : [];
}

function StartExamResponseDto(data) {
  this.attemptId = data.attemptId;
  this.startTime = data.startTime;
  this.exam = data.exam; // Trả về toàn bộ exam object
  this.examTitle = data.examTitle || (data.exam && data.exam.title);
  this.time_limit = data.exam && data.exam.time_limit ? data.exam.time_limit : 60;
  this.totalQuestions = data.totalQuestions || (data.exam && data.exam.questions && data.exam.questions.length);
}

function ExamFiltersDto(query) {
  this.level = query.level;
  this.tags = query.tags;
  this.difficulty = query.difficulty;
  this.searchTerm = query.search;
  this.creatorId = query.creatorId;
  this.page = parseInt(query.page) || 1;
  this.limit = parseInt(query.limit) || 10;
}

module.exports = {
  CreateExamDto: CreateExamDto,
  UpdateExamDto: UpdateExamDto,
  ExamListDto: ExamListDto,
  ExamDetailDto: ExamDetailDto,
  ExamForTakingDto: ExamForTakingDto,
  StartExamResponseDto: StartExamResponseDto,
  ExamFiltersDto: ExamFiltersDto
};
