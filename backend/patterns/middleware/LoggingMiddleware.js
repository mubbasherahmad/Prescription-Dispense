const BaseMiddleware = require('./BaseMiddleware');

// Chain of Responsibility: Logging middleware
class LoggingMiddleware extends BaseMiddleware {
  async handle(req, res, next) {
    console.log(`📝 [${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    console.log(`👤 User: ${req.user ? req.user.id : 'Unauthenticated'}`);
    console.log(`📦 Body:`, req.body);
    
    // Pass to next middleware
    await super.handle(req, res, next);
  }
}

module.exports = LoggingMiddleware;