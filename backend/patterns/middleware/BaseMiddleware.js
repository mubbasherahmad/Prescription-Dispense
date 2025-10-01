// Chain of Responsibility: Base middleware class
class BaseMiddleware {
  constructor() {
    this.nextMiddleware = null;
  }

  setNext(middleware) {
    this.nextMiddleware = middleware;
    return middleware; // Enable chaining
  }

  async handle(req, res, next) {
    try {
      if (this.nextMiddleware) {
        return await this.nextMiddleware.handle(req, res, next);
      } else {
        // End of chain - call next() to proceed to controller
        next();
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = BaseMiddleware;