const User = require('./User');

// Inheritance + Polymorphism
class MemberUser extends User {
  constructor(doc) { super(doc); }
  canManageInventory() { return false; } // override
}

module.exports = MemberUser;
