import authService from '../services/authService.js';

class AuthController {
  async register(req, res) {
    try {
      
      const user = await authService.register(req.body);
      
      res.status(201).json({ 
        user: {
          name: user.name,
          email: user.email,
          dietaryPreference: user.dietaryPreference,
          allergies: user.allergies,
          status: user.status
        }, 
        message: 'User registered successfully', 
        status: 'success' 
      });
    } catch (error) {
      res.status(400).json({ message: error.message, status: 'error' });
    }
  }

  async login(req, res) {
    try {
      const { token, user } = await authService.login(req.body.email, req.body.password);
      res.status(200).json({ 
        token, 
        user,
        message: 'Login successful', 
        status: 'success' 
      });
    } catch (error) {
      res.status(401).json({ message: error.message, status: 'error' });
    }
  }

async getProfile(req, res) {
  try {
    // The authenticate middleware already decoded the token and attached user to req
    const userId = req.user._id; // Get from decoded JWT
    
    const profile = await authService.getProfile(userId);
    console.log(profile);
    res.status(200).json(profile);
  } catch (error) {
    res.status(400).json({ 
      message: error.message, 
      status: 'error' 
    });
  }
}

  async updateProfile(req, res) {
    try {
      const userId = req.user._id;
      console.log(req);
      const updatedProfile = await authService.updateProfile(userId, req.body);
      res.status(200).json({
        user: updatedProfile,
        message: 'Profile updated successfully',
        status: 'success'
      });
    } catch (error) {
      res.status(400).json({ message: error.message, status: 'error' });
    }
  }

  async deactivateAccount(req, res) {
    try {
      const userId = req.user._id;
      await authService.deactivateAccount(userId);
      res.status(200).json({
        message: 'Account deactivated successfully',
        status: 'success'
      });
    } catch (error) {
      res.status(400).json({ message: error.message, status: 'error' });
    }
  }

  async activateAccount(req, res) {
    try {
      const userId = req.user._id;
      await authService.activateAccount(userId);
      res.status(200).json({
        message: 'Account activated successfully',
        status: 'success'
      });
    } catch (error) {
      res.status(400).json({ message: error.message, status: 'error' });
    }
  }

  async deleteAccount(req, res) {
    try {
      const userId = req.user._id;
      await authService.deleteAccount(userId);
      res.status(200).json({
        message: 'Account deleted successfully',
        status: 'success'
      });
    } catch (error) {
      res.status(400).json({ message: error.message, status: 'error' });
    }
  }

  async logout(req, res) {
  try {
    // Here you could add token to a blacklist if needed
    res.status(200).json({ 
      message: 'Logged out successfully',
      status: 'success'
    });
  } catch (error) {
    res.status(400).json({ message: error.message, status: 'error' });
  }
}

  
}

export default new AuthController();