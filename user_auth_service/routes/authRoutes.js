import express from 'express';
import authController from '../controllers/authController.js';
import authenticate from './authenticate.js';


const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile',authenticate,  authController.getProfile);
router.put('/profile',authenticate, authController.updateProfile);
router.post('/deactivate',authenticate,  authController.deactivateAccount);
router.post('/activate',authenticate, authController.activateAccount);
router.delete('/',authenticate, authController.deleteAccount);
router.post('/logout', authenticate, authController.logout);

export default router;