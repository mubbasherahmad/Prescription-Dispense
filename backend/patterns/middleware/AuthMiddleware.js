const BaseMiddleware = require('./BaseMiddleware');
const jwt = require('jsonwebtoken');
const User = require('../../models/User');

// Chain of Responsibility: Authentication middleware
class AuthMiddleware extends BaseMiddleware {
  async handle(req, res, next) {
    try {
      let token;

      // Check for token in header (same as your old middleware)
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
      }

      if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token provided' });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Get user from token
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return res.status(401).json({ message: 'Not authorized, user not found' });
      }

      req.user = user;
      
      // Pass to next middleware
      await super.handle(req, res, next);
    } catch (error) {
      console.error('Auth middleware error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }
}

module.exports = AuthMiddleware;