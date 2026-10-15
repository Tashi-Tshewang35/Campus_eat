const EMAIL_SUFFIX = '.sherubtse@rub.edu.bt';

function isValidSherubtseEmail(email) {
  if (!email) return false;
  return email.toLowerCase().endsWith(EMAIL_SUFFIX);
}

module.exports = { isValidSherubtseEmail, EMAIL_SUFFIX };
