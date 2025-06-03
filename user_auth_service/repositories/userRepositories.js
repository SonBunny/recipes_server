import {User} from '../models/userSchema.js';

export default class UserRepository {
  async findByEmail(email) {
    return User.findOne({ email });
  }

  async findById(id) {
    console.log(id);
    return User.findById(id);
  }

  async create(userData) {
    const user = new User(userData);
    return user.save();
  }

  async updateProfile(userId, profileData) {
    return User.findByIdAndUpdate(
      userId,
      { $set: profileData },
      { new: true }
    );
  }

  async deactivateAccount(userId) {
    return User.findByIdAndUpdate(
      userId,
      { $set: { status: 'deactivated' } },
      { new: true }
    );
  }

  async activateAccount(userId) {
    return User.findByIdAndUpdate(
      userId,
      { $set: { status: 'active' } },
      { new: true }
    );
  }

  async deleteAccount(userId) {
    return User.findByIdAndDelete(userId);
  }
}