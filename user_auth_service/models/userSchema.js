import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: { 
    type: String, 
    unique: true,
    required: true
  },
  dietaryPreference: {
    type: String,
    default: ''
  },
  allergies: {
    type: [String],
    default: []
  },
  status: {
    type: String,
    enum: ['active', 'deactivated'],
    default: 'active'
  },
  password: {
    type: String,
    required: true
  }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);