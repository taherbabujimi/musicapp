const Models = require("../../models/index");
const {
  validPassword,
  generateAccessToken,
} = require("../../services/helpers");
const {
  registerUserSchema,
  userLoginSchema,
} = require("../../services/validation/userValidation");

const {
  validationErrorResponseData,
  successResponseData,
  errorResponseWithoutData,
} = require("../../services/responses");

const { messages } = require("../../services/messages");

module.exports.registerUser = async (req, res) => {
  try {
    const validationResponse = registerUserSchema(req.body, res);
    if (validationResponse !== false) return;

    let { username, password } = req.body;
    username = username.replace(/ +/g, "");

    const email = req.body.email.toLowerCase();

    const oldUser = await Models.User.findOne({
      where: { email: email },
    });

    if (oldUser) {
      return validationErrorResponseData(res, messages.userAlreadyExists, 400);
    }

    const user = await Models.User.create({
      username,
      email,
      password,
    });

    return successResponseData(res, user, 200, messages.userCreated);
  } catch (error) {
    return errorResponseWithoutData(
      res,
      `${messages.somethingWentWrong}: ${error}`,
      400
    );
  }
};

module.exports.userLogin = async (req, res) => {
  try {
    const validationResponse = userLoginSchema(req.body, res);
    if (validationResponse !== false) return;

    const { password } = req.body;

    const email = req.body.email.toLowerCase();

    const user = await Models.User.findOne({
      where: { email: email },
    });

    if (!user) {
      return errorResponseWithoutData(res, messages.userNotExist, 400);
    }

    const isPasswordValid = await validPassword(password, user);

    if (!isPasswordValid) {
      return errorResponseWithoutData(res, messages.incorrectCredentials, 400);
    }

    const accessToken = await generateAccessToken(user);

    const userData = {
      username: user.username,
      email: user.email,
      usertype: user.usertype,
    };

    return successResponseData(res, userData, 200, messages.userLoginSuccess, {
      token: accessToken,
    });
  } catch (error) {
    return errorResponseWithoutData(
      res,
      `${messages.somethingWentWrong}: ${error}`,
      400
    );
  }
};

module.exports.addAdmin = async (req, res) => {
  try {
    const { password, role_id } = req.body;

    const username = req.body.username.replace(/ +/g, "");

    const email = req.body.email.toLowerCase();

    const oldAdmin = await Models.User.findOne({
      where: { email: email },
    });

    if (oldAdmin) {
      return validationErrorResponseData(res, messages.adminAlreadyExists, 400);
    }

    const admin = await Models.User.create({
      username,
      email,
      password,
      usertype: "admin",
      role_id,
    });

    return successResponseData(res, admin, 200, messages.adminCreatedSuccess);
  } catch (error) {
    return errorResponseWithoutData(
      res,
      `${messages.somethingWentWrong}: ${error}`,
      400
    );
  }
};
