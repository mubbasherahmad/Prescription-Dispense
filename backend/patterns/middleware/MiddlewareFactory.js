const LoggingMiddleware = require('./LoggingMiddleware');
const ValidationMiddleware = require('./ValidationMiddleware');
const AuthMiddleware = require('./AuthMiddleware');
const RoleMiddleware = require('./RoleMiddleware');

// Factory Pattern: Create middleware chains
class MiddlewareFactory {
  static createAuthChain() {
    const logging = new LoggingMiddleware();
    const auth = new AuthMiddleware();
    
    logging.setNext(auth);
    return logging;
  }

  static createAdminChain() {
    const logging = new LoggingMiddleware();
    const auth = new AuthMiddleware();
    const adminRole = new RoleMiddleware(['admin']);
    
    logging.setNext(auth).setNext(adminRole);
    return logging;
  }

  static createValidationChain(validationRules) {
    const logging = new LoggingMiddleware();
    const validation = new ValidationMiddleware(validationRules);
    
    logging.setNext(validation);
    return logging;
  }

  static createFullChain(validationRules = {}, allowedRoles = ['admin', 'user']) {
    const logging = new LoggingMiddleware();
    const validation = new ValidationMiddleware(validationRules);
    const auth = new AuthMiddleware();
    const role = new RoleMiddleware(allowedRoles);
    
    logging.setNext(validation).setNext(auth).setNext(role);
    return logging;
  }

  // Simple logging only chain
  static createLoggingChain() {
    return new LoggingMiddleware();
  }
}

module.exports = MiddlewareFactory;