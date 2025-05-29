function generateRandomPassword() {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const nums = "0123456789";
  const specials = "!@#$%^&*";
  return (
    chars[Math.floor(Math.random() * chars.length)] +
    specials[Math.floor(Math.random() * specials.length)] +
    nums[Math.floor(Math.random() * nums.length)] +
    Math.random().toString(36).slice(-5)
  );
}
module.exports = generateRandomPassword;
