import express from 'express';
import { registerUser, loginUser, loginAdmin } from '../controller/authController.js';

const AuthRouter = express.Router();

// Route for user registration
AuthRouter.post('/register', registerUser);
AuthRouter.post('/login', loginUser);
AuthRouter.post('/admin/login', loginAdmin);

export default AuthRouter;
