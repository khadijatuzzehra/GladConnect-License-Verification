const success = {
  GET_GYM_SETS: "Getting gym sets successfully",
  GYM_SETS_CREATED: "Gym sets created successfully",

  // instructor
  REGISTER: "Instructor has been created",
  GET_INSTRUCTOR: "Getting instructor successfully",

  //users
  GET_USERS: "Getting users successfully",

  // user
  SIGN_UP: "User has been created",
  GET_USER: "Getting user successfully",
  USER_DELETED: "User deleted successfully",

  // database
  DATABASE_CONNECTION: "Successfully connected to the database",

  MAIL_SENT: "Mail has been sent",
  PASSORD_UPDATED: "Password has been updated successfully",
};
const error = {
  // user
  USER_NOT_FOUND: "User not found",
  USER_REGISTRATION_FAILED: "Failed to register a user",
  GETTING_USER: "Error occurred while getting user",
  EMAIL_EXISTS: "Email already exists, please login.",
  GET_USER: "Error occurred while fetching user data",
  FAILED_TO_DEACTIVATE_USER_ACCOUNT: "Failed to deactivate user account",
  CREATE_PIN_FAILED: "Failed to create a PIN",
  ACCEPT_PARTNER_INVITE_FAILED: "Failed to accept partner invitation",
  INVALID_OTP: "Invalid otp",
  INVALID_PASSWORD: "Invalid password",
  PASSWORD_NOT_MATCH: "Password not match",
  FAILED_TO_UPDATE_PASSWORD: "Failed to update password",
  LOGIN_FAILED: "There was an error while logging in",
  USER_NOT_DELETED: "Error, unable to delete the user",
  //users
  GETTING_USERS: "Error occurred while getting users",

  // token
  REQUIRE_TOKEN: "A token is required for authentication",
  INVALID_TOKEN: "Invalid token",

  // database
  DATABASE_CONNECTION: "Could not connect to the database",
  FAILED_TO_SEND_INVITATION_MAIL: "Failed to send invitation mail to a user",
  FAILED_TO_SEND_OTP_MAIL: "Failed to send otp mail to a user",
  INVALID_EMAIL: "Invalid email address",
};

const authorizeStatusCodes = {
  OK: "Ok",
  Error: "Error",
};

const authorizeResultCodes = {
  SUCCESS: "I00001",
  DUPLICATE: "E00039",
  INVALID: "E00013",
  NO_SUCH_RECORD_FOUND: "E00040",
  DUPLICATE_TRANSACTION: "11",
};

export { authorizeResultCodes, authorizeStatusCodes, success, error };
