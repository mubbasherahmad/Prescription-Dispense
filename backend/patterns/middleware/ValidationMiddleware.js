const BaseMiddleware = require('./BaseMiddleware');

// Chain of Responsibility: Validation middleware
class ValidationMiddleware extends BaseMiddleware {
  constructor(rules = {}) {
    super();
    this.rules = rules;
  }

  async handle(req, res, next) {
    const route = req.originalUrl;
    const method = req.method;
    
    // Apply validation rules based on route and method
    if (this.rules[route] && this.rules[route][method]) {
      const validationRules = this.rules[route][method];
      const errors = this.validateRequest(req.body, validationRules);
      
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors
        });
      }
    }
    
    // Pass to next middleware
    await super.handle(req, res, next);
  }

  validateRequest(data, rules) {
    const errors = [];
    
    for (const [field, rule] of Object.entries(rules)) {
      const value = data[field];
      
      if (rule.required && (!value || value.toString().trim() === '')) {
        errors.push(`${field} is required`);
      }
      
      if (value && rule.type) {
        if (rule.type === 'email' && !this.isValidEmail(value)) {
          errors.push(`${field} must be a valid email`);
        }
        
        if (rule.type === 'number' && isNaN(Number(value))) {
          errors.push(`${field} must be a number`);
        }
      }
    }
    
    return errors;
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

module.exports = ValidationMiddleware;