// utils/TokenFactory.js
const jwt = require('jsonwebtoken');

class TokenFactory {
  static createToken(userId, type = 'jwt') {
    switch (type) {
      case 'jwt':
        return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
     
      default:
        throw new Error('Unsupported token type');
    }
  }
}

module.exports = TokenFactory;
