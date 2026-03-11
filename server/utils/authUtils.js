const crypto = require("crypto");

const hashPassword = (password) =>
    `sha256$${crypto.createHash("sha256").update(password).digest("hex")}`;

const isPasswordMatch = (inputPassword, storedPassword) => {
    if (!storedPassword) return false;
    if (storedPassword.startsWith("sha256$")) {
        return hashPassword(inputPassword) === storedPassword;
    }
    // Backward compatibility for legacy plain-text passwords.
    return storedPassword === inputPassword;
};

module.exports = {
    hashPassword,
    isPasswordMatch,
};
