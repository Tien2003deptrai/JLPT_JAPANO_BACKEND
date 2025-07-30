# Japan Learning Platform Backend - User, Exam & Result Modules

## Tổng Quan

Dự án backend được tái cấu trúc từ `jpan-backup` theo chuẩn Senior Developer, bao gồm 3 module chính:
- **User Module**: Quản lý người dùng (đăng ký, đăng nhập, profile)
- **Exam Module**: Quản lý bài kiểm tra
- **Result Module**: Quản lý kết quả thi

## Kiến Trúc

### Clean Architecture với ES5
```
japan-backend/
├── src/
│   ├── modules/
│   │   ├── user/
│   │   │   ├── controllers/     # HTTP request handlers
│   │   │   ├── services/        # Business logic
│   │   │   ├── repositories/    # Data access layer
│   │   │   ├── dtos/           # Data transfer objects
│   │   │   ├── models/         # Mongoose schemas
│   │   │   └── routes/         # Express routes
│   │   ├── exam/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── repositories/
│   │   │   ├── dtos/
│   │   │   ├── models/
│   │   │   └── routes/
│   │   └── result/
│   │       ├── controllers/
│   │       ├── services/
│   │       ├── repositories/
│   │       ├── dtos/
│   │       ├── models/
│   │       └── routes/
│   ├── shared/
│   │   ├── middleware/         # Auth, error handling
│   │   ├── utils/             # Utility functions
│   │   ├── errors/            # Error classes
│   │   └── response/          # Response formatters
│   └── app.js                 # Main application
├── package.json
└── README.md
```

### Nguyên Tắc Thiết Kế
- **Separation of Concerns**: Mỗi layer có trách nhiệm riêng biệt
- **Dependency Injection**: Giảm phụ thuộc trực tiếp
- **Clean Code**: Tên biến có ý nghĩa, hàm ngắn gọn
- **ES5 Syntax**: Tương thích với môi trường legacy
- **Error Handling**: Xử lý lỗi tập trung và nhất quán

## Cài Đặt

### 1. Cài đặt dependencies
```bash
cd japan-backend
npm install
```

### 2. Cấu hình môi trường
```bash
cp .env.example .env
# Chỉnh sửa .env với thông tin database và JWT secret
```

### 3. Khởi chạy server
```bash
# Development
npm run dev

# Production
npm start

# Testing
npm test
```

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication
Sử dụng JWT Bearer Token:
```
Authorization: Bearer <token>
```

## User Module APIs

### Public Endpoints

#### Đăng ký người dùng
```http
POST /api/users/register
Content-Type: application/json

{
  "name": "Nguyễn Văn A",
  "email": "user@example.com",
  "password": "password123",
  "phone": "0123456789",
  "dateOfBirth": "1995-01-01",
  "roles": "student"
}
```

#### Đăng nhập
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### Protected Endpoints (Cần Authentication)

#### Lấy thông tin profile hiện tại
```http
GET /api/users/profile
Authorization: Bearer <token>
```

#### Cập nhật profile
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Tên mới",
  "phone": "0987654321",
  "address": "Địa chỉ mới",
  "avatar": "https://example.com/avatar.jpg",
  "profile": {
    "bio": "Mô tả về bản thân",
    "preferences": {
      "language": "vi",
      "emailNotifications": true
    }
  }
}
```

#### Đổi mật khẩu
```http
PUT /api/users/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

#### Xem profile người dùng khác
```http
GET /api/users/:userId
Authorization: Bearer <token>
```

### Teacher/Admin Endpoints

#### Lấy danh sách học sinh
```http
GET /api/users/roles/students?search=tên&page=1&limit=10
Authorization: Bearer <token>
```

### Admin Only Endpoints

#### Lấy danh sách tất cả người dùng
```http
GET /api/users?search=tên&roles=student&isActive=true&page=1&limit=10
Authorization: Bearer <token>
```

#### Tạo người dùng mới (admin)
```http
POST /api/users
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Người dùng mới",
  "email": "newuser@example.com",
  "password": "defaultpassword123",
  "roles": "teacher",
  "phone": "0123456789"
}
```

#### Cập nhật người dùng (admin)
```http
PUT /api/users/admin/:userId
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Tên cập nhật",
  "roles": "teacher",
  "isActive": false,
  "isEmailVerified": true
}
```

#### Xóa người dùng (soft delete)
```http
DELETE /api/users/:userId
Authorization: Bearer <token>
```

#### Lấy danh sách giáo viên
```http
GET /api/users/roles/teachers
Authorization: Bearer <token>
```

#### Thống kê người dùng
```http
GET /api/users/admin/statistics
Authorization: Bearer <token>
```

## Exam Module APIs

### Public Endpoints

#### Lấy danh sách bài thi đã công bố
```http
GET /api/exams/published?level=N1&tags=grammar&page=1&limit=10
```

#### Lấy chi tiết bài thi
```http
GET /api/exams/:exam_id
```

### Protected Endpoints (Cần Authentication)

#### Lấy danh sách bài thi
```http
GET /api/exams?level=N2&search=kanji&courseId=123
```

#### Lấy bài thi để làm (không có đáp án)
```http
GET /api/exams/take/:exam_id
```

#### Bắt đầu làm bài thi
```http
POST /api/exams/start/:exam_id
```

### Admin/Teacher Endpoints

#### Tạo bài thi mới
```http
POST /api/exams
Content-Type: application/json

{
  "title": "N2 Grammar Test",
  "description": "Test about N2 grammar",
  "timeLimit": 60,
  "level": "N2",
  "course": "course_id",
  "questions": [...],
  "passingScore": 80
}
```

#### Cập nhật bài thi
```http
PUT /api/exams/:id
Content-Type: application/json

{
  "title": "Updated title",
  "timeLimit": 90
}
```

#### Xóa bài thi
```http
DELETE /api/exams/:id
```

#### Cập nhật câu hỏi
```http
PUT /api/exams/:examId/questions
Content-Type: application/json

{
  "newQuestions": [...]
}
```

#### Cập nhật lịch thi
```http
PUT /api/exams/:examId/schedule
Content-Type: application/json

{
  "startTime": "2024-01-01T10:00:00Z",
  "endTime": "2024-01-01T12:00:00Z",
  "timeLimit": 60
}
```

## Result Module APIs

### Protected Endpoints

#### Nộp bài thi
```http
POST /api/results/submit/:attemptId
Content-Type: application/json

{
  "answers": [
    {
      "parentQuestionId": "question_id",
      "childAnswers": [
        {
          "id": "child_question_id",
          "userAnswer": "A"
        }
      ]
    }
  ]
}
```

#### Lấy kết quả bài thi
```http
GET /api/results/attempt/:attemptId
```

#### Lấy lịch sử thi của user
```http
GET /api/results/history?examId=123&status=completed&page=1&limit=10
```

#### Kiểm tra thời gian còn lại
```http
GET /api/results/check-time/:attemptId
```

#### Lưu tiến độ làm bài
```http
POST /api/results/save-progress/:attemptId
Content-Type: application/json

{
  "answers": [...]
}
```

#### Lấy tiến độ làm bài
```http
GET /api/results/progress/:attemptId
```

#### Đánh dấu câu hỏi cần xem lại
```http
POST /api/results/mark-question/:attemptId
Content-Type: application/json

{
  "questionId": "question_id"
}
```

### Admin/Teacher Endpoints

#### Lấy danh sách học sinh làm bài
```http
GET /api/results/exam/:examId/students
```

#### Lấy kết quả cụ thể của học sinh
```http
GET /api/results/exam/:examId/student/:studentId
```

## Cấu Trúc Dữ Liệu

### User Schema
```javascript
{
  name: String,
  email: String, // unique, lowercase
  password: String, // hashed with bcrypt
  roles: String, // student, teacher, admin
  avatar: String,
  phone: String,
  dateOfBirth: Date,
  address: String,
  isActive: Boolean, // default: true
  isEmailVerified: Boolean, // default: false
  lastLogin: Date,
  loginCount: Number,
  profile: {
    bio: String,
    website: String,
    socialLinks: {
      facebook: String,
      twitter: String,
      linkedin: String
    },
    preferences: {
      language: String, // default: 'vi'
      timezone: String, // default: 'Asia/Ho_Chi_Minh'
      emailNotifications: Boolean // default: true
    }
  }
}
```

### Exam Schema
```javascript
{
  title: String,
  description: String,
  timeLimit: Number, // phút
  level: String, // N1, N2, N3, N4, N5
  course: ObjectId,
  creator: ObjectId,
  questions: [{
    parentQuestion: String,
    paragraph: String,
    imgUrl: String,
    audioUrl: String,
    childQuestions: [{
      id: String,
      type: String, // multiple_choice, fill_in, etc.
      content: String,
      options: [{ text: String, id: String }],
      correctAnswer: String,
      point: Number
    }]
  }],
  passingScore: Number,
  allowedAttempts: Number,
  startTime: Date,
  endTime: Date,
  isPublished: Boolean
}
```

### Result Schema
```javascript
{
  user: ObjectId,
  exam: ObjectId,
  startTime: Date,
  endTime: Date,
  totalScore: Number,
  isPassed: Boolean,
  status: String, // in-progress, completed, abandoned
  timeSpent: Number, // seconds
  answers: [{
    parentQuestionId: String,
    childAnswers: [{
      id: String,
      content: String,
      userAnswer: String,
      isCorrect: Boolean,
      correctAnswer: String,
      score: Number
    }]
  }]
}
```

## Error Handling

### Error Response Format
```json
{
  "status": 400,
  "success": false,
  "message": "Error message here"
}
```

### Common Error Codes
- `400`: Bad Request - Dữ liệu đầu vào không hợp lệ
- `401`: Unauthorized - Chưa đăng nhập
- `403`: Forbidden - Không có quyền truy cập
- `404`: Not Found - Không tìm thấy tài nguyên
- `409`: Conflict - Dữ liệu đã tồn tại (email trùng)
- `500`: Internal Server Error - Lỗi hệ thống

## User Roles & Permissions

### Student (student)
- Đăng ký, đăng nhập
- Xem và cập nhật profile của mình
- Làm bài thi
- Xem kết quả của mình
- Xem profile người dùng khác (chỉ thông tin công khai)

### Teacher (teacher)
- Tất cả quyền của Student
- Tạo, cập nhật, xóa bài thi
- Xem danh sách học sinh
- Xem kết quả bài thi của học sinh
- Quản lý câu hỏi bài thi

### Admin (admin)
- Tất cả quyền của Teacher
- Quản lý tất cả người dùng (tạo, sửa, xóa)
- Xem thống kê hệ thống
- Quản lý danh sách giáo viên
- Toàn quyền trên hệ thống

## Security Features

### Password Security
- Mật khẩu được hash bằng bcrypt với salt rounds = 12
- Yêu cầu tối thiểu 6 ký tự
- Không lưu trữ plaintext password

### JWT Token
- Expires in 7 days
- Contains user ID, email, and roles
- Automatically updates login info (lastLogin, loginCount)

### Data Protection
- Sensitive fields bị loại bỏ trong responses
- Email verification system ready
- Password reset token system ready
- Soft delete (isActive flag)

## Logging

Server sử dụng console.log để ghi log request:
```
[2024-01-01T10:00:00.000Z] POST /api/users/login
[2024-01-01T10:00:01.000Z] GET /api/users/profile
```

## Testing

Chạy tests:
```bash
npm test
```

## Deployment

### Production Build
```bash
NODE_ENV=production npm start
```

### Environment Variables
Đảm bảo set đúng các biến môi trường trong production:
- `NODE_ENV=production`
- `MONGODB_URI`
- `JWT_SECRET`
- `PORT`

## Bảo Mật

### Implemented Security Features
- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Giới hạn request
- **JWT Authentication**: Token-based auth
- **Password Hashing**: bcrypt với salt rounds = 12
- **Input Validation**: Kiểm tra dữ liệu đầu vào
- **Error Sanitization**: Không leak sensitive data
- **Role-based Access Control**: Phân quyền theo role

### Best Practices
- Không log sensitive data
- Validate tất cả input từ client
- Sử dụng HTTPS trong production
- Regularly update dependencies
- Implement rate limiting
- Use environment variables for secrets

## Contribution

### Code Style
- Sử dụng ES5 syntax
- Meaningful variable names
- Functions làm một việc duy nhất
- Comment cho logic phức tạp
- Error handling rõ ràng

### Testing
- Unit tests cho services
- Integration tests cho APIs
- Mock external dependencies

## Support

Để được hỗ trợ, vui lòng tạo issue trong repository hoặc liên hệ team phát triển.

---

**Phiên bản**: 1.0.0
**Kiến trúc**: Clean Architecture với ES5
**Modules**: User, Exam, Result
**License**: MIT
"# JLPT_JAPANO_BACKEND" 
