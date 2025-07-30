function SubmitExamDto(data) {
  this.attemptId = data.attemptId;
  this.answers = data.answers;
  this.endTime = data.endTime || new Date();
}

function ResultDetailDto(result) {
  this.id = result._id;
  this.examId = result.exam;
  this.examTitle = result.examTitle;
  this.userId = result.user;
  this.startTime = result.startTime;
  this.endTime = result.endTime;
  this.totalScore = result.totalScore;
  this.isPassed = result.isPassed;
  this.status = result.status;
  this.timeSpent = result.timeSpent;
  this.answers = result.answers;
  this.passingScore = result.passingScore;
}

function ResultListDto(result) {
  this.id = result._id;
  this.examId = result.exam ? result.exam._id : result.exam;
  this.examTitle = result.exam ? result.exam.title : null;
  this.examLevel = result.exam ? result.exam.level : null;
  this.startTime = result.startTime;
  this.endTime = result.endTime;
  this.totalScore = result.totalScore;
  this.isPassed = result.isPassed;
  this.status = result.status;
  this.timeSpent = result.timeSpent;
  this.createdAt = result.createdAt;
}

function SubmitExamResponseDto(data) {
  this.attemptId = data.attemptId;
  this.totalScore = data.totalScore;
  this.timeSpent = data.timeSpent;
  this.isPassed = data.passed || data.isPassed;
  this.scoredAnswers = data.scoredAnswers;
  this.status = 'completed';
}

function ExamHistoryFiltersDto(query) {
  this.examId = query.examId;
  this.status = query.status;
  this.page = parseInt(query.page) || 1;
  this.limit = parseInt(query.limit) || 10;
}

function StudentResultDto(result) {
  this.userId = result.user ? result.user._id : result.user;
  this.userName = result.user ? result.user.name : null;
  this.userEmail = result.user ? result.user.email : null;
  this.totalScore = result.totalScore;
  this.isPassed = result.isPassed;
  this.timeSpent = result.timeSpent;
  this.status = result.status;
  this.startTime = result.startTime;
  this.endTime = result.endTime;
}

function ExamProgressDto(data) {
  this.attemptId = data.attemptId;
  this.answeredQuestions = data.answeredQuestions || 0;
  this.totalQuestions = data.totalQuestions || 0;
  this.lastSaved = data.lastSaved;
  this.remainingTime = data.remainingTime;
  this.timeSpent = data.timeSpent;
  this.status = data.status;
}

module.exports = {
  SubmitExamDto: SubmitExamDto,
  ResultDetailDto: ResultDetailDto,
  ResultListDto: ResultListDto,
  SubmitExamResponseDto: SubmitExamResponseDto,
  ExamHistoryFiltersDto: ExamHistoryFiltersDto,
  StudentResultDto: StudentResultDto,
  ExamProgressDto: ExamProgressDto
};
