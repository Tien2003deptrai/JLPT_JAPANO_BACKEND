var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;

var DOCUMENT_NAME = 'User';
var COLLECTION_NAME = 'Users';

var userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email không hợp lệ']
    },
    password: {
      type: String,
      required: true,
      minlength: 6
    },
    roles: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
      default: 'student'
    },
    avatar: {
      type: String,
      default: null
    },
    dateOfBirth: {
      type: Date
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    lastLogin: {
      type: Date
    },
    loginCount: {
      type: Number,
      default: 0
    },
    resetPasswordToken: {
      type: String
    },
    resetPasswordExpires: {
      type: Date
    },
    emailVerificationToken: {
      type: String
    },
    profile: {
      bio: {
        type: String,
        maxlength: 500
      },
      website: {
        type: String
      },
      socialLinks: {
        facebook: String,
        twitter: String,
        linkedin: String
      },
      preferences: {
        language: {
          type: String,
          default: 'vi'
        },
        timezone: {
          type: String,
          default: 'Asia/Ho_Chi_Minh'
        },
        emailNotifications: {
          type: Boolean,
          default: true
        }
      }
    }
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME
  }
);

// Tạo index để tối ưu truy vấn
userSchema.index({ email: 1 });
userSchema.index({ roles: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: -1 });

// Hash password trước khi save
userSchema.pre('save', function (next) {
  var user = this;

  // Chỉ hash password nếu nó được modified hoặc là new user
  if (!user.isModified('password')) {
    return next();
  }

  // Hash password với salt rounds = 12
  bcrypt.hash(user.password, 12, function (err, hash) {
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  });
});

// Instance method để compare password
userSchema.methods.comparePassword = function (candidatePassword, callback) {
  bcrypt.compare(candidatePassword, this.password, callback);
};

// Instance method để tạo safe user object (không có password)
userSchema.methods.toSafeObject = function () {
  var userObject = this.toObject();
  delete userObject.password;
  delete userObject.resetPasswordToken;
  delete userObject.resetPasswordExpires;
  delete userObject.emailVerificationToken;
  return userObject;
};

// Static method để tìm user by email
userSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method để tìm active users
userSchema.statics.findActiveUsers = function (filters) {
  var query = Object.assign({ isActive: true }, filters || {});
  return this.find(query);
};

module.exports = mongoose.model(DOCUMENT_NAME, userSchema);
