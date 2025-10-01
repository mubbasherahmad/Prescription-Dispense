const BaseMiddleware = require('./BaseMiddleware');

// Chain of Responsibility: Role-based access middleware
class RoleMiddleware extends BaseMiddleware {
  constructor(allowedRoles = []) {
    super();
    this.allowedRoles = allowedRoles;
  }

  async handle(req, res) {
    if (!req.user) {
      return res.status(401).json({ 
        success: false,
        message: 'Authentication required' 
      });
    }

    if (!this.allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false,
        message: 'Insufficient permissions' 
      });
    }

    // Pass to next middleware
    return await super.handle(req, res);
  }
}

module.exports = RoleMiddleware;