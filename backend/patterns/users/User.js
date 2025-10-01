// Base User class (Encapsulation)
class User {
  constructor(userDoc) {
    this._doc = userDoc; // encapsulate raw mongoose doc
  }

  get id() { return this._doc._id; }
  get name() { return this._doc.name; }
  get role() { return this._doc.role; }

  // default behavior
  canManageInventory() {
    return false;
  }
}

module.exports = User;
