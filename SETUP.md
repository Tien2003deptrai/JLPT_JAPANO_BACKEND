# Setup Guide - Japan Learning Platform Backend

## Yêu Cầu Hệ Thống

### Software Requirements
- **Node.js**: >= 16.0.0
- **MongoDB**: >= 4.4.0 (Local hoặc MongoDB Atlas)
- **npm**: >= 8.0.0

### Optional Tools
- **MongoDB Compass**: GUI để quản lý database
- **Postman/Insomnia**: API testing
- **VSCode**: Code editor

## 🚀 Quick Setup

### 1. Clone và Install Dependencies
```bash
cd japan-backend
npm install
```

### 2. Database Setup

#### Option A: Local MongoDB
```bash
# Install MongoDB Community Edition
# macOS with Homebrew:
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb-community

# Verify MongoDB is running
mongosh --eval "db.adminCommand('ismaster')"
```

#### Option B: MongoDB Atlas (Cloud)
1. Tạo account tại [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Tạo cluster mới (Free tier available)
3. Tạo database user và lấy connection string
4. Whitelist IP address (0.0.0.0/0 cho development)

### 3. Environment Configuration
```bash
# Copy environment template
cp .env.example .env

# Edit .env file
nano .env
```

**Cấu hình .env cho Local MongoDB:**
```env
MONGODB_URI=mongodb://localhost:27017/japan_learning
JWT_SECRET=your-super-secret-jwt-key-here
PORT=3000
NODE_ENV=development
```

**Cấu hình .env cho MongoDB Atlas:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/japan_learning?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-here
PORT=3000
NODE_ENV=development
```

### 4. Start Development Server
```bash
npm run dev
```

### 5. Verify Setup
```bash
# Test health endpoint
curl http://localhost:3000/health

# Expected response:
{
  "status": 200,
  "success": true,
  "message": "Japan Backend API is running",
  "data": {
    "status": "healthy",
    "database": {
      "status": "connected",
      "type": "MongoDB"
    }
  }
}
```

## 📊 Database Collections

Hệ thống sẽ tự động tạo các collections sau:

### Users Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String, // unique
  password: String, // hashed
  roles: String, // student, teacher, admin
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Exams Collection
```javascript
{
  _id: ObjectId,
  title: String,
  level: String, // N1, N2, N3, N4, N5
  timeLimit: Number,
  creator: ObjectId, // ref to User
  course: ObjectId,
  questions: Array,
  createdAt: Date
}
```

### Results Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId, // ref to User
  exam: ObjectId, // ref to Exam
  totalScore: Number,
  isPassed: Boolean,
  status: String, // in-progress, completed
  createdAt: Date
}
```

## 🔧 Development Workflow

### 1. Test Authentication
```bash
# Register new user
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 2. Test Exam Creation (Need Teacher/Admin token)
```bash
# Create admin user first via direct database insert or modify register endpoint
```

### 3. Database Inspection
```bash
# Connect to MongoDB shell
mongosh

# Use database
use japan_learning

# List collections
show collections

# View users
db.users.find().pretty()

# View exams
db.exams.find().pretty()
```

## 🛠️ Troubleshooting

### Common Issues

#### 1. Database Connection Failed
```
Error: Failed to connect to database: MongooseServerSelectionError
```
**Solutions:**
- Check MongoDB service is running: `brew services list | grep mongo`
- Verify connection string in .env
- Check network connectivity for Atlas
- Verify firewall settings

#### 2. Authentication Errors
```
Error: Unauthorized: Invalid token format
```
**Solutions:**
- Check JWT_SECRET in .env
- Verify token format: `Bearer <token>`
- Check token expiration (7 days default)

#### 3. Port Already in Use
```
Error: listen EADDRINUSE: address already in use :::3000
```
**Solutions:**
```bash
# Find process using port 3000
lsof -ti:3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

#### 4. bcrypt Installation Issues
```
Error: Cannot find module 'bcryptjs'
```
**Solutions:**
```bash
# Reinstall bcryptjs
npm uninstall bcryptjs
npm install bcryptjs

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database Debugging

#### Check Connection Status
```bash
curl http://localhost:3000/health | jq '.data.database'
```

#### Reset Database (Development Only)
```bash
mongosh japan_learning --eval "db.dropDatabase()"
```

#### Create Test Data
```javascript
// Connect to MongoDB shell
mongosh japan_learning

// Create admin user
db.users.insertOne({
  name: "Admin User",
  email: "admin@example.com",
  password: "$2a$12$hash_here", // Use bcrypt to hash password
  roles: "admin",
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

## 🏭 Production Setup

### Environment Variables
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://production_user:secure_password@cluster.mongodb.net/japan_learning_prod
JWT_SECRET=very-secure-random-key-minimum-32-characters
PORT=3000
CORS_ORIGIN=https://yourdomain.com
```

### Security Checklist
- [ ] Use strong JWT_SECRET (>= 32 characters)
- [ ] Set proper CORS_ORIGIN
- [ ] Use HTTPS in production
- [ ] Enable MongoDB authentication
- [ ] Set up database backups
- [ ] Monitor database performance
- [ ] Set up logging and error tracking

### Deployment Commands
```bash
# Build for production
NODE_ENV=production npm start

# Or with PM2
npm install -g pm2
pm2 start src/app.js --name "japan-backend"
pm2 startup
pm2 save
```

## 📚 Additional Resources

- [MongoDB Setup Guide](https://docs.mongodb.com/manual/installation/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [JWT Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)
- [Express.js Production Guide](https://expressjs.com/en/advanced/best-practice-performance.html)

## 🆘 Support

Nếu gặp vấn đề:
1. Check console logs để xem error details
2. Verify database connection với mongosh
3. Test API endpoints với curl/Postman
4. Check .env configuration
5. Restart development server

---

**Next Steps:** Sau khi setup thành công, tham khảo `API_EXAMPLES.md` để test các endpoints.
