// tests/authService.test.js
import request from 'supertest';
import AuthService from '../services/authService.js';
import UserRepository from '../repositories/userRepositories.js';
import passwordHasher from '../services/passwordHasher.js';
import jwt from 'jsonwebtoken';
import UserFactory from '../services/factory/userFactory.js';
import app from '../index.js';

jest.mock('../repositories/userRepositories.js');
jest.mock('../services/passwordHasher.js');
jest.mock('jsonwebtoken');
jest.mock('../services/factory/userFactory.js');

describe('AuthService', () => {
  let userRepoMock;

  beforeEach(() => {
    userRepoMock = new UserRepository();
  });

  afterEach(() => {
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
    it('should register a new user successfully', async () => {
      const fakeUserData = { email: 'test@example.com', password: 'password123', role: 'Consumer' };
      const createdUser = { _id: 'userId123', email: 'test@example.com' };

      userRepoMock.findByEmail.mockResolvedValue(null); // no existing user
      UserFactory.createUser.mockReturnValue({ ...fakeUserData }); // create user instance
      passwordHasher.hash.mockResolvedValue('hashedPassword');
      userRepoMock.create.mockResolvedValue(createdUser);

      const result = await AuthService.register(fakeUserData);

      expect(userRepoMock.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(UserFactory.createUser).toHaveBeenCalledWith(fakeUserData);
      expect(passwordHasher.hash).toHaveBeenCalledWith('password123');
      expect(userRepoMock.create).toHaveBeenCalled();
      expect(result).toEqual(createdUser);
    });

    it('should throw error if user already exists', async () => {
      userRepoMock.findByEmail.mockResolvedValue({ email: 'test@example.com' }); // user exists

      await expect(AuthService.register({ email: 'test@example.com' }))
        .rejects.toThrow('User already exists');

      expect(userRepoMock.findByEmail).toHaveBeenCalledWith('test@example.com');
      expect(userRepoMock.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login successfully and return JWT token', async () => {
      const fakeUser = {
        email: 'test@example.com',
        password: 'hashedPassword',
        name: 'Test User',
        _id: 'userId123',
        user_type: ['Consumer'],
        profile_image: 'image.png',
      };
      const plainPassword = 'password123';
      const fakeToken = 'jwt.token.here';

      userRepoMock.findByEmail.mockResolvedValue(fakeUser);
      passwordHasher.verify.mockResolvedValue(true);
      jwt.sign.mockReturnValue(fakeToken);

      const result = await AuthService.login(fakeUser.email, plainPassword);

      expect(userRepoMock.findByEmail).toHaveBeenCalledWith(fakeUser.email);
      expect(passwordHasher.verify).toHaveBeenCalledWith(fakeUser.password, plainPassword);
      expect(jwt.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          email: fakeUser.email,
          name: fakeUser.name,
          _id: fakeUser._id,
          user_type: fakeUser.user_type,
          profile_image: fakeUser.profile_image,
        }),
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      expect(result).toBe(fakeToken);
    });

    it('should throw error if user not found', async () => {
      userRepoMock.findByEmail.mockResolvedValue(null);

      await expect(AuthService.login('notfound@example.com', 'password123'))
        .rejects.toThrow('User not found');
    });

    it('should throw error if password invalid', async () => {
      const fakeUser = { email: 'test@example.com', password: 'hashedPassword' };

      userRepoMock.findByEmail.mockResolvedValue(fakeUser);
      passwordHasher.verify.mockResolvedValue(false);

      await expect(AuthService.login(fakeUser.email, 'wrongpassword'))
        .rejects.toThrow('Invalid credentials');
    });
  });
});
