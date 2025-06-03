import jwt from 'jsonwebtoken';
import UserRepository from '../repositories/userRepositories.js';
import passwordHasher from './passwordHasher.js';


const userRepo = new UserRepository();

class AuthService {
  async register(userData) {
    
    const existingUser = await userRepo.findByEmail(userData.email);
    
    if (existingUser) throw new Error('User already exists');


    
    userData.password = await passwordHasher.hash(userData.password);
    
    
    return userRepo.create(userData);
  }

async login(email, password) {
    const user = await userRepo.findByEmail(email);
    if (!user) throw new Error('User not found');
    if (user.status === 'deactivated') throw new Error('Account is deactivated');

    const validPassword = await passwordHasher.verify(user.password, password);
    if (!validPassword) throw new Error('Invalid credentials');

    const token = jwt.sign({
      email: user.email,
      name: user.name,
      _id: user._id,
      status: user.status
    }, process.env.JWT_SECRET, { expiresIn: '24h' });

    return {
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        dietaryPreference: user.dietaryPreference,
        allergies: user.allergies,
        status: user.status
      }
    };
  }

  async getProfile(userId) {
    
    const user = await userRepo.findById(userId);

    if (!user) throw new Error('User not found');
    
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      dietaryPreference: user.dietaryPreference,
      allergies: user.allergies,
      skillLevel: user.skillLevel,
      status: user.status
    };
  }

  async updateProfile(userId, profileData) {
    return userRepo.updateProfile(userId, profileData);
  }

  async deactivateAccount(userId) {
    return userRepo.deactivateAccount(userId);
  }

  async activateAccount(userId) {
    return userRepo.activateAccount(userId);
  }

  async deleteAccount(userId) {
    return userRepo.deleteAccount(userId);
  }
}


export default new AuthService();