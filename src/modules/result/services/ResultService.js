var ResultRepository = require('../repositories/ResultRepository');
var ExamRepository = require('../../exam/repositories/ExamRepository');
var ResultDto = require('../dtos/ResultDto');
var Utils = require('../../../shared/utils');
var throwError = require('../../../shared/errors/throwError');

var ResultService = {
  submitExam: function (attemptId, answers) {
    return new Promise(function (resolve, reject) {
      if (!attemptId) {
        return reject(new Error('Attempt ID bắt buộc'));
      }
      if (!Array.isArray(answers)) {
        return reject(new Error('Câu trả lời không hợp lệ'));
      }

      ResultRepository.findById(attemptId)
        .then(function (attempt) {
          if (!attempt) {
            throwError('Không tìm thấy bài làm', 404);
          }
          if (attempt.status === 'completed') {
            throwError('Bài kiểm tra này đã hoàn thành', 400);
          }

          return ExamRepository.findWithAnswers(attempt.exam)
            .then(function (exam) {
              if (!exam) {
                throwError('Không tìm thấy bài kiểm tra', 404);
              }

              var endTime = new Date();
              var timeSpent = Math.floor((endTime - attempt.startTime) / 1000);

              var processedAnswers = exam.questions.map(function (parentQuestion) {
                var submittedParentAnswer = answers.find(function (a) {
                  return a.parentQuestionId === parentQuestion._id.toString();
                });

                return {
                  parentQuestionId: parentQuestion._id,
                  paragraph: parentQuestion.paragraph,
                  imgUrl: parentQuestion.imgUrl,
                  audioUrl: parentQuestion.audioUrl,
                  childAnswers: parentQuestion.childQuestions.map(function (childQuestion) {
                    var submittedChildAnswer = submittedParentAnswer && submittedParentAnswer.childAnswers
                      ? submittedParentAnswer.childAnswers.find(function (ca) {
                        return ca.id === childQuestion._id.toString();
                      })
                      : null;

                    var isCorrect = submittedChildAnswer
                      ? submittedChildAnswer.userAnswer === childQuestion.correctAnswer
                      : false;

                    // Đảm bảo score có giá trị hợp lệ
                    var score = isCorrect ? (childQuestion.point || childQuestion.score || 1) : 0;

                    console.log('Processing child question:', {
                      childId: childQuestion._id,
                      content: childQuestion.content,
                      isCorrect: isCorrect,
                      userAnswer: submittedChildAnswer ? submittedChildAnswer.userAnswer : null,
                      correctAnswer: childQuestion.correctAnswer,
                      point: childQuestion.point,
                      score: childQuestion.score,
                      calculatedScore: score
                    });

                    return {
                      id: childQuestion._id,
                      content: childQuestion.content,
                      options: childQuestion.options,
                      userAnswer: submittedChildAnswer ? submittedChildAnswer.userAnswer : null,
                      isCorrect: isCorrect,
                      correctAnswer: childQuestion.correctAnswer,
                      score: score
                    };
                  })
                };
              });

              var totalScore = processedAnswers.reduce(function (total, parentAnswer) {
                var parentScore = parentAnswer.childAnswers.reduce(function (childTotal, childAnswer) {
                  var childScore = childAnswer.score || 0;
                  console.log('Adding child score:', { childId: childAnswer.id, score: childScore });
                  return childTotal + childScore;
                }, 0);
                console.log('Parent score:', { parentId: parentAnswer.parentQuestionId, score: parentScore });
                return total + parentScore;
              }, 0);

              console.log('Final total score:', totalScore);

              // Đảm bảo totalScore là số hợp lệ
              if (isNaN(totalScore)) {
                console.error('Total score is NaN, setting to 0');
                totalScore = 0;
              }

              var passingScore = exam.passingScore || Utils.getPassingScore(exam.level);
              var isPassed = totalScore >= passingScore;

              var updateData = {
                endTime: endTime,
                timeSpent: timeSpent,
                totalScore: totalScore,
                answers: processedAnswers,
                isPassed: isPassed,
                status: 'completed'
              };

              return ResultRepository.update(attemptId, updateData)
                .then(function (result) {
                  var responseDto = new ResultDto.SubmitExamResponseDto({
                    attemptId: result._id,
                    totalScore: result.totalScore,
                    timeSpent: result.timeSpent,
                    passed: result.isPassed,
                    scoredAnswers: processedAnswers
                  });
                  resolve(responseDto);
                });
            });
        })
        .catch(function (error) {
          reject(error);
        });
    });
  },

  getExamResult: function (attemptId, userId) {
    return new Promise(function (resolve, reject) {
      if (!attemptId) {
        return reject(new Error('Attempt ID bắt buộc'));
      }

      ResultRepository.findById(attemptId, true)
        .then(function (result) {
          if (!result) {
            throwError('Không tìm thấy kết quả', 404);
          }

          if (userId && result.user.toString && result.user.toString() !== userId.toString()) {
            throwError('Không có quyền truy cập kết quả này', 403);
          }

          console.log('ResultService - Raw result data:', {
            id: result._id,
            exam: result.exam,
            totalScore: result.totalScore,
            answers: result.answers,
            answersType: typeof result.answers,
            answersLength: result.answers?.length
          })

          return ExamRepository.findById(result.exam)
            .then(function (exam) {
              var resultDto = new ResultDto.ResultDetailDto({
                _id: result._id,
                exam: result.exam,
                examTitle: exam ? exam.title : 'Unknown Exam',
                user: result.user,
                startTime: result.startTime,
                endTime: result.endTime,
                totalScore: result.totalScore,
                isPassed: result.isPassed,
                status: result.status,
                timeSpent: result.timeSpent,
                answers: result.answers || [],
                passingScore: exam ? exam.passingScore : null
              });

              console.log('ResultService - Processed result DTO:', {
                id: resultDto.id,
                examTitle: resultDto.examTitle,
                totalScore: resultDto.totalScore,
                answers: resultDto.answers,
                answersLength: resultDto.answers?.length
              })

              resolve(resultDto);
            });
        })
        .catch(function (error) {
          reject(error);
        });
    });
  },

  getUserExamHistory: function (userId, filters) {
    return new Promise(function (resolve, reject) {
      if (userId && !Utils.isValidObjectId(userId)) {
        return reject(new Error('User ID không hợp lệ'));
      }

      var queryFilters = userId ? { user: userId } : {};

      var filtersDto = new ResultDto.ExamHistoryFiltersDto(filters);

      var queryFilters = {};
      if (filtersDto.examId) {
        queryFilters.exam = Utils.convertToObjectId(filtersDto.examId);
      }
      if (filtersDto.status) {
        queryFilters.status = filtersDto.status;
      }

      var options = {
        page: filtersDto.page,
        limit: filtersDto.limit,
        populate: true
      };

      Promise.all([
        ResultRepository.findByUser(userId, queryFilters, options),
        ResultRepository.countByUser(userId, queryFilters)
      ])
        .then(function (results) {
          var examHistory = results[0];
          var total = results[1];

          var resultDtos = examHistory.map(function (result) {
            return new ResultDto.ResultListDto(result);
          });

          resolve({
            results: resultDtos,
            pagination: {
              total: total,
              page: filtersDto.page,
              limit: filtersDto.limit,
              totalPages: Math.ceil(total / filtersDto.limit)
            }
          });
        })
        .catch(function (error) {
          reject(error);
        });
    });
  },

  getStudentsByExam: function (examId) {
    return new Promise(function (resolve, reject) {
      if (!examId) {
        return reject(new Error('Exam ID bắt buộc'));
      }

      ResultRepository.findStudentsByExam(examId)
        .then(function (results) {
          if (!results || results.length === 0) {
            return resolve([]);
          }

          var studentDtos = results.map(function (result) {
            return new ResultDto.StudentResultDto(result);
          });
          resolve(studentDtos);
        })
        .catch(function (error) {
          reject(error);
        });
    });
  },

  getResultByExamAndStudent: function (examId, studentId) {
    return new Promise(function (resolve, reject) {
      if (!examId || !studentId) {
        return reject(new Error('Exam ID và Student ID bắt buộc'));
      }

      ResultRepository.findByExamAndUser(examId, studentId)
        .then(function (result) {
          if (!result) {
            throwError('Không tìm thấy kết quả cho học sinh này', 404);
          }

          var detailedAnswers = result.answers.map(function (parentAnswer) {
            return {
              parentQuestion: parentAnswer.parentQuestionId,
              paragraph: parentAnswer.paragraph,
              imgUrl: parentAnswer.imgUrl,
              audioUrl: parentAnswer.audioUrl,
              childAnswers: parentAnswer.childAnswers.map(function (childAnswer) {
                return {
                  id: childAnswer.id,
                  content: childAnswer.content,
                  options: childAnswer.options,
                  userAnswer: childAnswer.userAnswer,
                  isCorrect: childAnswer.isCorrect,
                  correctAnswer: childAnswer.correctAnswer,
                  score: childAnswer.score
                };
              })
            };
          });

          resolve({
            user: {
              id: result.user._id,
              name: result.user.name,
              email: result.user.email
            },
            examId: result.exam,
            totalScore: result.totalScore,
            isPassed: result.isPassed,
            timeSpent: result.timeSpent,
            status: result.status,
            startTime: result.startTime,
            endTime: result.endTime,
            answers: detailedAnswers
          });
        })
        .catch(function (error) {
          reject(error);
        });
    });
  },

  checkExamTimeLimit: function (attemptId) {
    return new Promise(function (resolve, reject) {
      if (!attemptId) {
        return reject(new Error('Attempt ID bắt buộc'));
      }

      ResultRepository.findById(attemptId)
        .then(function (attempt) {
          if (!attempt) {
            throwError('Không tìm thấy lần thi', 404);
          }

          if (attempt.status === 'completed') {
            throwError('Lần thi đã hoàn thành');
          }

          return ExamRepository.findById(attempt.exam)
            .then(function (exam) {
              if (!exam) {
                throwError('Không tìm thấy bài thi', 404);
              }

              var timeInfo = Utils.calculateRemainingTime(attempt.startTime, exam.time_limit);
              resolve(timeInfo);
            });
        })
        .catch(function (error) {
          reject(error);
        });
    });
  },

  saveExamProgress: function (attemptId, answers) {
    return new Promise(function (resolve, reject) {
      if (!attemptId) {
        return reject(new Error('Attempt ID bắt buộc'));
      }
      if (!Array.isArray(answers)) {
        return reject(new Error('Answers phải là một mảng'));
      }

      ResultRepository.saveProgress(attemptId, answers)
        .then(function (result) {
          if (!result) {
            throwError('Không tìm thấy bài làm', 404);
          }
          resolve({ success: true, lastSaved: result.lastSaved });
        })
        .catch(function (error) {
          reject(error);
        });
    });
  },

  getExamProgress: function (attemptId) {
    return new Promise(function (resolve, reject) {
      if (!attemptId) {
        return reject(new Error('Attempt ID bắt buộc'));
      }

      ResultRepository.findById(attemptId)
        .then(function (attempt) {
          if (!attempt) {
            throwError('Không tìm thấy bài làm', 404);
          }

          return ExamRepository.findById(attempt.exam)
            .then(function (exam) {
              var timeInfo = Utils.calculateRemainingTime(attempt.startTime, exam.time_limit);
              var totalQuestions = exam.questions ? exam.questions.reduce(function (total, q) {
                return total + (q.childQuestions ? q.childQuestions.length : 0);
              }, 0) : 0;

              var progressDto = new ResultDto.ExamProgressDto({
                attemptId: attempt._id,
                answeredQuestions: attempt.answers ? attempt.answers.length : 0,
                totalQuestions: totalQuestions,
                lastSaved: attempt.lastSaved,
                remainingTime: timeInfo.remainingTime,
                timeSpent: timeInfo.timeSpent,
                status: attempt.status
              });

              resolve(progressDto);
            });
        })
        .catch(function (error) {
          reject(error);
        });
    });
  },

  markQuestionForReview: function (attemptId, questionId) {
    return new Promise(function (resolve, reject) {
      if (!attemptId || !questionId) {
        return reject(new Error('Attempt ID và Question ID bắt buộc'));
      }

      ResultRepository.markQuestionForReview(attemptId, questionId)
        .then(function (result) {
          if (!result) {
            throwError('Không tìm thấy bài làm', 404);
          }
          resolve({ success: true, markedQuestions: result.markedQuestions });
        })
        .catch(function (error) {
          reject(error);
        });
    });
  }
};

module.exports = ResultService;
