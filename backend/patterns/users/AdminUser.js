const User = require('./User');

// Inheritance + Polymorphism
class AdminUser extends User {
  constructor(doc) { super(doc); }
  canManageInventory() { return true; } // override
}

module.exports = AdminUser;
