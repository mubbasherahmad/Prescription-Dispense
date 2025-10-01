const AdminUser = require('./users/AdminUser');
const MemberUser = require('./users/MemberUser');

// Factory: central place to create User objects
class UserFactory {
  static create(userDoc) {
    if (!userDoc) return null;
    return userDoc.role === 'admin'
      ? new AdminUser(userDoc)
      : new MemberUser(userDoc);
  }
}

module.exports = UserFactory;
