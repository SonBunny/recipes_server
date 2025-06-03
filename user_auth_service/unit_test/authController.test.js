// tests/authController.test.js
import AuthController from '../controllers/authController.js';
import authService from '../services/authService.js';
import app from '../index.js';

jest.mock('../services/authService.js');

describe('AuthController', () => {
  let req;
  let res;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  describe('Auth API', () => {
  it('health check returns 200', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

  describe('register', () => {
    it('should respond with 201 and success message on successful registration', async () => {
      const fakeUser = { email: 'test@example.com' };
      req.body = { email: 'test@example.com' };

      authService.register.mockResolvedValue(fakeUser);

      await AuthController.register(req, res);

      expect(authService.register).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        user: fakeUser,
        message: 'User registered',
        status: 'success',
      });
    });

    it('should respond with 400 and error message if registration fails', async () => {
      req.body = { email: 'test@example.com' };
      authService.register.mockRejectedValue(new Error('User already exists'));

      await AuthController.register(req, res);

      expect(authService.register).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User already exists',
        status: 'error',
      });
    });
  });

  describe('login', () => {
    it('should respond with 200 and token on successful login', async () => {
      const fakeToken = 'jwt.token.here';
      req.body = { email: 'test@example.com', password: 'password123' };
      authService.login.mockResolvedValue(fakeToken);

      await AuthController.login(req, res);

      expect(authService.login).toHaveBeenCalledWith(req.body.email, req.body.password);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        token: fakeToken,
        message: 'User logged in',
        status: 'success',
      });
    });

    it('should respond with 401 and error message if login fails', async () => {
      req.body = { email: 'test@example.com', password: 'wrongpassword' };
      authService.login.mockRejectedValue(new Error('Invalid credentials'));

      await AuthController.login(req, res);

      expect(authService.login).toHaveBeenCalledWith(req.body.email, req.body.password);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid credentials',
        status: 'error',
      });
    });
  });
});
