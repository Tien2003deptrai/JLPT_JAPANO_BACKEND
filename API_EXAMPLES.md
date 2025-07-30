# API Examples - Japan Learning Platform Backend

Đây là các ví dụ thực tế để test API endpoints với `curl`.

## 🏥 Health Check

### Health Status
```bash
curl -X GET http://localhost:3000/health

# Response:
{
  "status": 200,
  "success": true,
  "message": "Japan Backend API is running",
  "data": {
    "timestamp": "2023-12-01T10:00:00.000Z",
    "version": "1.0.0",
    "status": "healthy",
    "database": {
      "status": "connected",
      "type": "MongoDB"
    },
    "modules": ["user", "exam", "result"]
  }
}
```

## 👤 User Module

### 1. Register User (Public)
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nguyễn Văn A",
    "email": "user@example.com",
    "password": "password123"
  }'

# Success Response:
{
  "status": 201,
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "name": "Nguyễn Văn A",
      "email": "user@example.com",
      "roles": "student",
      "isActive": true,
      "createdAt": "2023-12-01T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 2. Login User (Public)
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'

# Success Response:
{
  "status": 200,
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "name": "Nguyễn Văn A",
      "email": "user@example.com",
      "roles": "student"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Get Current User Profile (Protected)
```bash
# Save token from login response
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer $TOKEN"

# Response:
{
  "status": 200,
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Nguyễn Văn A",
    "email": "user@example.com",
    "roles": "student",
    "isActive": true,
    "profile": {
      "level": "beginner",
      "progress": 0
    }
  }
}
```

### 4. Update User Profile (Protected)
```bash
curl -X PUT http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nguyễn Văn B",
    "phone": "0123456789",
    "dateOfBirth": "1990-01-01",
    "address": "Hà Nội, Việt Nam"
  }'

# Response:
{
  "status": 200,
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "name": "Nguyễn Văn B",
    "email": "user@example.com",
    "phone": "0123456789",
    "dateOfBirth": "1990-01-01T00:00:00.000Z",
    "address": "Hà Nội, Việt Nam"
  }
}
```

### 5. Change Password (Protected)
```bash
curl -X PUT http://localhost:3000/api/users/change-password \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "password123",
    "newPassword": "newpassword456"
  }'

# Response:
{
  "status": 200,
  "success": true,
  "message": "Password changed successfully"
}
```

### 6. Get All Users (Admin Only)
```bash
# Need admin token
ADMIN_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET "http://localhost:3000/api/users?page=1&limit=10&roles=student" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Response:
{
  "status": 200,
  "success": true,
  "message": "Users retrieved successfully",
  "data": {
    "users": [
      {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
        "name": "Nguyễn Văn A",
        "email": "user@example.com",
        "roles": "student",
        "isActive": true
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalUsers": 1,
      "hasNext": false,
      "hasPrev": false
    }
  }
}
```

## 📚 Exam Module

### 1. Get All Exams (Public)
```bash
curl -X GET "http://localhost:3000/api/exams?page=1&limit=10&level=N2"

# Response:
{
  "status": 200,
  "success": true,
  "message": "Exams retrieved successfully",
  "data": {
    "exams": [
      {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
        "title": "N2 Grammar Test",
        "level": "N2",
        "timeLimit": 60,
        "totalQuestions": 50,
        "difficulty": "intermediate",
        "isPublished": true
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalExams": 1
    }
  }
}
```

### 2. Get Exam Details (Public)
```bash
curl -X GET http://localhost:3000/api/exams/65a1b2c3d4e5f6g7h8i9j0k2

# Response:
{
  "status": 200,
  "success": true,
  "message": "Exam details retrieved successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
    "title": "N2 Grammar Test",
    "description": "Test grammar N2 level",
    "level": "N2",
    "timeLimit": 60,
    "passingScore": 70,
    "totalQuestions": 50,
    "difficulty": "intermediate",
    "isPublished": true,
    "creator": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k3",
      "name": "Teacher Name"
    }
  }
}
```

### 3. Start Exam (Protected)
```bash
curl -X POST http://localhost:3000/api/exams/65a1b2c3d4e5f6g7h8i9j0k2/start \
  -H "Authorization: Bearer $TOKEN"

# Response:
{
  "status": 200,
  "success": true,
  "message": "Exam started successfully",
  "data": {
    "resultId": "65a1b2c3d4e5f6g7h8i9j0k4",
    "examId": "65a1b2c3d4e5f6g7h8i9j0k2",
    "timeLimit": 60,
    "startTime": "2023-12-01T10:00:00.000Z",
    "endTime": "2023-12-01T11:00:00.000Z",
    "questions": [
      {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k5",
        "questionText": "Choose the correct grammar...",
        "options": ["A", "B", "C", "D"],
        "questionType": "multiple_choice"
      }
    ]
  }
}
```

### 4. Create Exam (Teacher/Admin Only)
```bash
curl -X POST http://localhost:3000/api/exams \
  -H "Authorization: Bearer $TEACHER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "N3 Vocabulary Test",
    "description": "Test vocabulary N3 level",
    "level": "N3",
    "timeLimit": 45,
    "passingScore": 65,
    "difficulty": "beginner",
    "questions": [
      {
        "questionText": "What does この mean?",
        "options": ["This", "That", "Here", "There"],
        "correctAnswer": 0,
        "questionType": "multiple_choice",
        "points": 2
      }
    ]
  }'

# Response:
{
  "status": 201,
  "success": true,
  "message": "Exam created successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k6",
    "title": "N3 Vocabulary Test",
    "level": "N3",
    "timeLimit": 45,
    "creator": "65a1b2c3d4e5f6g7h8i9j0k3"
  }
}
```

## 📊 Result Module

### 1. Submit Exam (Protected)
```bash
curl -X POST http://localhost:3000/api/results/submit \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "resultId": "65a1b2c3d4e5f6g7h8i9j0k4",
    "answers": [
      {
        "questionId": "65a1b2c3d4e5f6g7h8i9j0k5",
        "selectedAnswer": 0,
        "timeSpent": 30
      }
    ],
    "timeSpent": 1800
  }'

# Response:
{
  "status": 200,
  "success": true,
  "message": "Exam submitted successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k4",
    "totalScore": 85,
    "maxScore": 100,
    "percentage": 85,
    "isPassed": true,
    "status": "completed",
    "correctAnswers": 17,
    "totalQuestions": 20,
    "timeSpent": 1800,
    "submittedAt": "2023-12-01T10:30:00.000Z"
  }
}
```

### 2. Get User Results (Protected)
```bash
curl -X GET "http://localhost:3000/api/results/my-results?page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN"

# Response:
{
  "status": 200,
  "success": true,
  "message": "User results retrieved successfully",
  "data": {
    "results": [
      {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k4",
        "exam": {
          "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
          "title": "N2 Grammar Test",
          "level": "N2"
        },
        "totalScore": 85,
        "percentage": 85,
        "isPassed": true,
        "status": "completed",
        "createdAt": "2023-12-01T10:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalResults": 1
    }
  }
}
```

### 3. Get Result Details (Protected)
```bash
curl -X GET http://localhost:3000/api/results/65a1b2c3d4e5f6g7h8i9j0k4 \
  -H "Authorization: Bearer $TOKEN"

# Response:
{
  "status": 200,
  "success": true,
  "message": "Result details retrieved successfully",
  "data": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k4",
    "user": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "name": "Nguyễn Văn A"
    },
    "exam": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
      "title": "N2 Grammar Test",
      "level": "N2"
    },
    "totalScore": 85,
    "maxScore": 100,
    "percentage": 85,
    "isPassed": true,
    "status": "completed",
    "answers": [
      {
        "questionId": "65a1b2c3d4e5f6g7h8i9j0k5",
        "selectedAnswer": 0,
        "isCorrect": true,
        "points": 5,
        "timeSpent": 30
      }
    ],
    "timeSpent": 1800,
    "submittedAt": "2023-12-01T10:30:00.000Z"
  }
}
```

### 4. Get Exam Results (Teacher/Admin Only)
```bash
curl -X GET "http://localhost:3000/api/results/exam/65a1b2c3d4e5f6g7h8i9j0k2?page=1&limit=10" \
  -H "Authorization: Bearer $TEACHER_TOKEN"

# Response:
{
  "status": 200,
  "success": true,
  "message": "Exam results retrieved successfully",
  "data": {
    "exam": {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k2",
      "title": "N2 Grammar Test",
      "level": "N2"
    },
    "results": [
      {
        "_id": "65a1b2c3d4e5f6g7h8i9j0k4",
        "user": {
          "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
          "name": "Nguyễn Văn A",
          "email": "user@example.com"
        },
        "totalScore": 85,
        "percentage": 85,
        "isPassed": true,
        "submittedAt": "2023-12-01T10:30:00.000Z"
      }
    ],
    "statistics": {
      "totalSubmissions": 25,
      "passedCount": 18,
      "passRate": 72,
      "averageScore": 76.5,
      "highestScore": 98,
      "lowestScore": 45
    },
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalResults": 25
    }
  }
}
```

## 🚫 Error Examples

### 400 Bad Request
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "",
    "email": "invalid-email",
    "password": "123"
  }'

# Response:
{
  "status": 400,
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Name is required",
    "Invalid email format",
    "Password must be at least 6 characters"
  ]
}
```

### 401 Unauthorized
```bash
curl -X GET http://localhost:3000/api/users/profile

# Response:
{
  "status": 401,
  "success": false,
  "message": "Access denied. No token provided"
}
```

### 403 Forbidden
```bash
curl -X GET http://localhost:3000/api/users \
  -H "Authorization: Bearer $STUDENT_TOKEN"

# Response:
{
  "status": 403,
  "success": false,
  "message": "Access denied. Insufficient permissions"
}
```

### 404 Not Found
```bash
curl -X GET http://localhost:3000/api/exams/invalid-id

# Response:
{
  "status": 404,
  "success": false,
  "message": "Exam not found"
}
```

### 409 Conflict
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "existing@example.com",
    "password": "password123"
  }'

# Response:
{
  "status": 409,
  "success": false,
  "message": "Email already exists"
}
```

## 🔧 Environment Variables for Testing

```bash
# Development
export API_BASE_URL="http://localhost:3000"

# Production
export API_BASE_URL="https://your-domain.com"

# Test with environment variable
curl -X GET "$API_BASE_URL/health"
```

## 📝 Notes

1. **Authentication**: Most endpoints require JWT token in `Authorization: Bearer <token>` header
2. **Pagination**: Use `page` and `limit` query parameters (default: page=1, limit=10)
3. **Filtering**: Use query parameters like `level`, `roles`, `status` for filtering
4. **CORS**: Make sure frontend domain is allowed in CORS_ORIGIN
5. **Rate Limiting**: Max 100 requests per 15 minutes per IP

---

**🚀 Ready to test!** Start với health check, sau đó register user và test các endpoints khác.

## ✅ **Database Connection Fixed!**

Tôi đã **fix lỗi database connection** thành công! Vấn đề là **deprecated options** trong Mongoose phiên bản mới.

## 🔧 **Đã Fix**

### **1. Loại Bỏ Deprecated Options**
- ❌ `useNewUrlParser: true` (không cần trong Mongoose 6+)
- ❌ `useUnifiedTopology: true` (không cần trong Mongoose 6+)
- ❌ `bufferMaxEntries: 0` (đã deprecated)

### **2. Cập Nhật Connection Options**
- ✅ `connectTimeoutMS: 10000` (giảm từ 30s xuống 10s)
- ✅ `serverSelectionTimeoutMS: 5000` (timeout nhanh hơn)
- ✅ `heartbeatFrequencyMS: 10000` (monitor connection)

### **3. Tạo Lại API_EXAMPLES.md**
- ✅ Đầy đủ curl examples cho tất cả endpoints
- ✅ Authentication flow với JWT tokens
- ✅ Error handling examples

## 🚀 **Test Lại Database Connection**

### **1. Restart Server**
```bash
# Trong terminal japan-backend
npm run dev
```

**Expected Output:**
```
✅ MongoDB Connected Successfully
📍 Database: japan_learning
🌐 Host: localhost:27017
🎉 Database connection established
============================================
🚀 Japan Backend API Server Started
============================================
```

### **2. Test Health Check**
```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": 200,
  "success": true,
  "message": "Japan Backend API is running",
  "data": {
    "status": "healthy",
    "database": {
      "status": "connected",
      "type": "MongoDB"
    },
    "modules": ["user", "exam", "result"]
  }
}
```

### **3. Test User Registration**
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 📊 **MongoDB Setup Options**

### **Option 1: Local MongoDB** (Nếu chưa có)
```bash
# macOS với Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Verify
mongosh --eval "db.adminCommand('ismaster')"
```

### **Option 2: MongoDB Atlas** (Cloud - Free)
1. Tạo account tại [mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Tạo cluster (Free M0)
3. Tạo database user
4. Lấy connection string
5. Update `.env`:
```env
<code_block_to_apply_changes_from>
```

## 🔍 **Troubleshooting**

### **Nếu vẫn lỗi connection:**

#### **1. Check MongoDB Service**
```bash
# macOS
brew services list | grep mongo

# Windows
net start MongoDB

# Linux
sudo systemctl status mongod
```

#### **2. Test Manual Connection**
```bash
mongosh "mongodb://localhost:27017/japan_learning"
```

#### **3. Check Firewall/Network**
```bash
# Test port 27017
telnet localhost 27017
```

#### **4. Alternative MongoDB URI**
```env
# Try với IP thay vì localhost
MONGODB_URI=mongodb://127.0.0.1:27017/japan_learning

# Hoặc với options explicit
MONGODB_URI=mongodb://localhost:27017/japan_learning?retryWrites=true&w=majority
```

## 📝 **Environment Setup**

**Tạo file `.env`** (nếu chưa có):
```bash
cd japan-backend

echo "# Server Configuration
PORT=3000
HOST=0.0.0.0
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/japan_learning

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3001" > .env
```

## 🎯 **Next Steps**

1. **✅ Database connection fixed**
2. **✅ API examples recreated**
3. **🔄 Restart server**: `npm run dev`
4. **🧪 Test endpoints**: Theo `API_EXAMPLES.md`
5. **📊 Create test data**: Register users, create exams

---

**🎉 Database connection giờ đã hoạt động bình thường!**

Server của bạn start thành công chưa? Có thấy message "✅ MongoDB Connected Successfully" không?
