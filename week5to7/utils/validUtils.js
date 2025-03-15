const isValidString = (value) => {
  return typeof value === "string" && value.trim() !== "";
};
const isNumber = (value) => {
  return (
    typeof value === "number" && !isNaN(value) && value % 1 === 0 && value > 0
  );
};

const isNotUndefined = (value) => {
  return typeof value !== undefined;
};

const isValidPassword = (value) => {
  const passwordPattern = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,16}/;
  return passwordPattern.test(value);
};

const isValidEmailAddress = (value) => {
  //郵件地址正規表達式來自 : https://www.w3resource.com/javascript/form/email-validation.php
  const emailPattern = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailPattern.test(value);
};

const isValidUUID = (value) => {
  const uuidPattern =
    /^[0-9A-F]{8}-[0-9A-F]{4}-[1-5][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;
  return uuidPattern.test(value);
};

module.exports = {
  isValidString,
  isNumber,
  isNotUndefined,
  isValidPassword,
  isValidEmailAddress,
  isValidUUID,
};
