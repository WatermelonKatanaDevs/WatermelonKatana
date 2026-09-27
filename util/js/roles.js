const adminroles = ["Admin", "Uni Lover"];

function isadmin(role) {
  return adminroles.includes(role);
}

module.exports = { adminroles, isadmin };
