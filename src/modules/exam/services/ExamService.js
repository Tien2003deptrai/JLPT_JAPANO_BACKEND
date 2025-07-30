var ExamRepository = require('../repositories/ExamRepository');
var ResultRepository = require('../../result/repositories/ResultRepository');
var ExamDto = require('../dtos/ExamDto');
var Utils = require('../../../shared/utils');
var throwError = require('../../../shared/errors/throwError');

var ExamService = {
  createExam: function (examData) {
    return new Promise(function (resolve, reject) {
      try {
        if (!examData.title) {
          throwError('Title bắt buộc');
        }
        if (!examData.level) {
          throwError('Level bắt buộc');
        }
        if (!examData.time_limit) {
          throwError('Time limit bắt buộc');
        }
        if (!Utils.isValidExamLevel(examData.level)) {
          throwError('Level không hợp lệ');
        }

        var createDto = new ExamDto.CreateExamDto(examData);

        if (!createDto.passingScore) {
          createDto.passingScore = Utils.getPassingScore(createDto.level);
        }

        ExamRepository.create(createDto)
          .then(function (result) {
            resolve(result);
          })
          .catch(function (error) {
            reject(error);
          });
      } catch (error) {
        reject(error);
      }
    });
  },

  getExamById: function (examId) {
    return new Promise(function (resolve, reject) {
      if (!examId) {
        return reject(new Error('Exam ID bắt buộc'));
      }

      ExamRepository.findById(examId)
        .then(function (exam) {
          if (!exam) {
            throwError('Không tìm thấy bài kiểm tra', 404);
          }

          var examDto = new ExamDto.ExamDetailDto(exam);
          resolve(examDto);
        })
        .catch(function (error) {
          reject(error);
        });
    });
  },

  getExamsWithFilters: function (filters) {
    return new Promise(function (resolve, reject) {
      var filtersDto = new ExamDto.ExamFiltersDto(filters);

      var query = {};

      if (filtersDto.level) {
        query.level = filtersDto.level.toUpperCase();
      }

      if (filtersDto.tags) {
        var tagsArray = Array.isArray(filtersDto.tags) ? filtersDto.tags : [filtersDto.tags];
        query.tags = { $in: tagsArray };
      }

      if (filtersDto.searchTerm) {
        query.title = { $regex: filtersDto.searchTerm, $options: 'i' };
      }

      if (filtersDto.creatorId) {
        query.creator = Utils.convertToObjectId(filtersDto.creatorId);
      }

      var options = {
        page: filtersDto.page,
        limit: filtersDto.limit
      };

      Promise.all([
        ExamRepository.findWithFilters(query, options),
        ExamRepository.countWithFilters(query)
      ])
        .then(function (results) {
          var exams = results[0];
          var total = results[1];

          var examDtos = exams.map(function (exam) {
            return new ExamDto.ExamListDto(exam);
          });

          resolve({
            exams: examDtos,
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

  getExamForTaking: function (examId, userId) {
    return new Promise(function (resolve, reject) {
      if (!examId) {
        return reject(new Error('Exam ID bắt buộc'));
      }

      ExamRepository.findById(examId)
        .then(function (exam) {
          if (!exam) {
            throwError('Không tìm thấy bài kiểm tra', 404);
          }

          var examForTaking = new ExamDto.ExamForTakingDto(exam);
          var result = {
            exam: examForTaking,
            time_limit: exam.time_limit || 60
          };

          if (userId) {
            return ResultRepository.findInProgressAttempt(userId, examId)
              .then(function (existingAttempt) {
                if (existingAttempt) {
                  result.attemptId = existingAttempt._id;
                  result.startTime = existingAttempt.startTime;
                } else {
                  // Nếu không có existing attempt, tạo startTime mới
                  result.startTime = new Date().toISOString();
                }
                resolve(result);
              });
          } else {
            // Nếu không có userId, vẫn tạo startTime mới
            result.startTime = new Date().toISOString();
            resolve(result);
          }
        })
        .catch(function (error) {
          reject(error);
        });
    });
  },

  startExam: function (examId, userId) {
    return new Promise(function (resolve, reject) {
      if (!examId) {
        return reject(new Error('ExamId bắt buộc'));
      }

      if (!userId) {
        return reject(new Error('UserId bắt buộc'));
      }

      ExamRepository.findById(examId)
        .then(function (exam) {
          if (!exam) {
            throwError('Không tìm thấy bài kiểm tra', 404);
          }

          return ResultRepository.findInProgressAttempt(userId, examId)
            .then(function (existingAttempt) {
              if (existingAttempt) {
                var responseDto = new ExamDto.StartExamResponseDto({
                  attemptId: existingAttempt._id,
                  startTime: existingAttempt.startTime,
                  exam: exam
                });
                return resolve(responseDto);
              }

              // Chỉ kiểm tra số lần thử khi không có attempt in-progress
              return ResultRepository.countCompletedAttempts(userId, examId)
                .then(function (completedAttemptCount) {
                  if (exam.allowedAttempts && completedAttemptCount >= exam.allowedAttempts) {
                    throwError('Bạn đã vượt quá số lần thử cho phép (' + exam.allowedAttempts + ')');
                  }

                  var currentTime = new Date();
                  console.log('Creating new attempt with startTime:', currentTime);

                  var attemptData = {
                    user: userId,
                    exam: examId,
                    startTime: currentTime,
                    status: 'in-progress',
                    answers: []
                  };

                  return ResultRepository.create(attemptData)
                    .then(function (attempt) {
                      console.log('New attempt created:', {
                        attemptId: attempt._id,
                        startTime: attempt.startTime,
                        userId: userId,
                        examId: examId
                      });

                      var responseDto = new ExamDto.StartExamResponseDto({
                        attemptId: attempt._id,
                        startTime: attempt.startTime,
                        exam: exam
                      });
                      resolve(responseDto);
                    });
                });
            });
        })
        .catch(function (error) {
          reject(error);
        });
    });
  },

  updateExam: function (examId, updateData) {
    return new Promise(function (resolve, reject) {
      if (!examId) {
        return reject(new Error('Exam ID bắt buộc'));
      }

      var updateDto = new ExamDto.UpdateExamDto(updateData);

      if (updateDto.time_limit && typeof updateDto.time_limit !== 'number') {
        return reject(new Error('Time limit phải là số'));
      }

      if (updateDto.level && !Utils.isValidExamLevel(updateDto.level)) {
        return reject(new Error('Level không hợp lệ'));
      }

      ExamRepository.update(examId, updateDto)
        .then(function (updatedExam) {
          if (!updatedExam) {
            throwError('Không tìm thấy bài kiểm tra', 404);
          }

          var examDto = new ExamDto.ExamDetailDto(updatedExam);
          resolve(examDto);
        })
        .catch(function (error) {
          reject(error);
        });
    });
  },

  deleteExam: function (examId) {
    return new Promise(function (resolve, reject) {
      if (!examId) {
        return reject(new Error('Exam ID bắt buộc'));
      }

      ExamRepository.findById(examId, false)
        .then(function (exam) {
          if (!exam) {
            throwError('Không tìm thấy bài kiểm tra', 404);
          }

          return ExamRepository.deleteById(examId);
        })
        .then(function (result) {
          resolve({ deleted: result.deletedCount > 0 });
        })
        .catch(function (error) {
          reject(error);
        });
    });
  },

  updateExamQuestions: function (examId, newQuestions) {
    return new Promise(function (resolve, reject) {
      if (!examId) {
        return reject(new Error('Exam ID bắt buộc'));
      }
      if (!Array.isArray(newQuestions)) {
        return reject(new Error('Questions phải là một mảng'));
      }

      for (var i = 0; i < newQuestions.length; i++) {
        var question = newQuestions[i];
        if (!question.parentQuestion) {
          return reject(new Error('Câu hỏi ' + (i + 1) + ' thiếu trường parentQuestion'));
        }
        if (!Array.isArray(question.childQuestions)) {
          return reject(new Error('Câu hỏi ' + (i + 1) + ' thiếu trường childQuestions'));
        }

        for (var j = 0; j < question.childQuestions.length; j++) {
          var child = question.childQuestions[j];
          if (!child.content) {
            return reject(new Error('Câu hỏi con ' + (j + 1) + ' của câu hỏi ' + (i + 1) + ' thiếu trường content'));
          }
          if (!child.correctAnswer) {
            return reject(new Error('Câu hỏi con ' + (j + 1) + ' của câu hỏi ' + (i + 1) + ' thiếu trường correctAnswer'));
          }
        }
      }

      ExamRepository.updateQuestions(examId, newQuestions)
        .then(function (result) {
          if (!result) {
            throwError('Không tìm thấy bài kiểm tra', 404);
          }
          resolve({ success: true });
        })
        .catch(function (error) {
          reject(error);
        });
    });
  },

  getExamsByCreator: function (creatorId, options) {
    return new Promise(function (resolve, reject) {
      if (!creatorId) {
        return reject(new Error('Creator ID bắt buộc'));
      }

      ExamRepository.findByCreator(creatorId, options)
        .then(function (exams) {
          var examDtos = exams.map(function (exam) {
            return new ExamDto.ExamListDto(exam);
          });
          resolve(examDtos);
        })
        .catch(function (error) {
          reject(error);
        });
    });
  },

  getPublishedExams: function (filters, options) {
    return new Promise(function (resolve, reject) {
      ExamRepository.findPublished(filters, options)
        .then(function (exams) {
          var examDtos = exams.map(function (exam) {
            return new ExamDto.ExamListDto(exam);
          });
          resolve(examDtos);
        })
        .catch(function (error) {
          reject(error);
        });
    });
  },

  updateExamSchedule: function (examId, scheduleData) {
    return new Promise(function (resolve, reject) {
      if (!examId) {
        return reject(new Error('Exam ID bắt buộc'));
      }

      if (scheduleData.startTime && scheduleData.endTime) {
        var start = new Date(scheduleData.startTime);
        var end = new Date(scheduleData.endTime);
        var now = new Date();

        if (start < now) {
          return reject(new Error('Thời gian bắt đầu không được ở quá khứ'));
        }

        if (start >= end) {
          return reject(new Error('Thời gian bắt đầu phải trước thời gian kết thúc'));
        }

        if (scheduleData.time_limit) {
          var timeLimitMs = scheduleData.time_limit * 60 * 1000;
          var timeRangeMs = end - start;

          if (timeRangeMs < timeLimitMs) {
            return reject(new Error('Khoảng thời gian không phù hợp với thời gian làm bài'));
          }
        }
      }

      var updateDto = new ExamDto.UpdateExamDto(scheduleData);

      ExamRepository.update(examId, updateDto)
        .then(function (updatedExam) {
          if (!updatedExam) {
            throwError('Không tìm thấy bài kiểm tra', 404);
          }

          var examDto = new ExamDto.ExamDetailDto(updatedExam);
          resolve(examDto);
        })
        .catch(function (error) {
          reject(error);
        });
    });
  }
};

module.exports = ExamService;
