function RegisterUserDto(data) {
  this.name = data.name;
  this.email = data.email;
  this.password = data.password;
  this.roles = data.roles || 'student';
  this.phone = data.phone;
  this.dateOfBirth = data.dateOfBirth;
}

function LoginUserDto(data) {
  this.email = data.email;
  this.password = data.password;
}

function UpdateUserProfileDto(data) {
  if (data.name !== undefined) this.name = data.name;
  if (data.phone !== undefined) this.phone = data.phone;
  if (data.dateOfBirth !== undefined) this.dateOfBirth = data.dateOfBirth;
  if (data.address !== undefined) this.address = data.address;
  if (data.avatar !== undefined) this.avatar = data.avatar;
  if (data.profile !== undefined) this.profile = data.profile;
}

function ChangePasswordDto(data) {
  this.currentPassword = data.currentPassword;
  this.newPassword = data.newPassword;
  this.confirmPassword = data.confirmPassword;
}

function ResetPasswordDto(data) {
  this.email = data.email;
}

function SetNewPasswordDto(data) {
  this.token = data.token;
  this.newPassword = data.newPassword;
  this.confirmPassword = data.confirmPassword;
}

function UserResponseDto(user) {
  this.id = user._id;
  this.name = user.name;
  this.email = user.email;
  this.roles = user.roles;
  this.avatar = user.avatar;
  this.phone = user.phone;
  this.dateOfBirth = user.dateOfBirth;
  this.address = user.address;
  this.isActive = user.isActive;
  this.isEmailVerified = user.isEmailVerified;
  this.lastLogin = user.lastLogin;
  this.loginCount = user.loginCount;
  this.profile = user.profile;
  this.createdAt = user.createdAt;
  this.updatedAt = user.updatedAt;
}

function UserListDto(user) {
  this.id = user._id;
  this.name = user.name;
  this.email = user.email;
  this.roles = user.roles;
  this.avatar = user.avatar;
  this.isActive = user.isActive;
  this.isEmailVerified = user.isEmailVerified;
  this.lastLogin = user.lastLogin;
  this.createdAt = user.createdAt;
}

function LoginResponseDto(data) {
  this.token = data.token;
  this.user = new UserResponseDto(data.user);
  this.expiresIn = data.expiresIn || '7d';
}

function UserFiltersDto(query) {
  this.search = query.search;
  this.roles = query.roles;
  this.isActive = query.isActive;
  this.isEmailVerified = query.isEmailVerified;
  this.page = parseInt(query.page) || 1;
  this.limit = parseInt(query.limit) || 10;
  this.sortBy = query.sortBy || 'createdAt';
  this.sortOrder = query.sortOrder || 'desc';
}

function UpdateUserAdminDto(data) {
  if (data.name !== undefined) this.name = data.name;
  if (data.email !== undefined) this.email = data.email;
  if (data.roles !== undefined) this.roles = data.roles;
  if (data.isActive !== undefined) this.isActive = data.isActive;
  if (data.isEmailVerified !== undefined) this.isEmailVerified = data.isEmailVerified;
  if (data.phone !== undefined) this.phone = data.phone;
  if (data.address !== undefined) this.address = data.address;
}

module.exports = {
  RegisterUserDto: RegisterUserDto,
  LoginUserDto: LoginUserDto,
  UpdateUserProfileDto: UpdateUserProfileDto,
  ChangePasswordDto: ChangePasswordDto,
  ResetPasswordDto: ResetPasswordDto,
  SetNewPasswordDto: SetNewPasswordDto,
  UserResponseDto: UserResponseDto,
  UserListDto: UserListDto,
  LoginResponseDto: LoginResponseDto,
  UserFiltersDto: UserFiltersDto,
  UpdateUserAdminDto: UpdateUserAdminDto
};
