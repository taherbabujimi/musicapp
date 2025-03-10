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
const bcrypt = require("bcrypt");

module.exports.registerUser = async (req, res) => {
  try {
    const validationResponse = registerUserSchema(req.body, res);
    if (validationResponse !== false) return;

    let { username, password } = req.body;
    username = username.replace(/ +/g, "");

    const email = req.body.email.toLowerCase();

    password = bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);

    const data = await Models.sequelize.query(
      "SELECT registerUser(:username, :email, :password) AS result",
      {
        replacements: {
          username,
          email,
          password,
        },
      }
    );

    const user = data[0][0].result;

    return successResponseData(res, user.data, user.status, user.message);
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

    const data = await Models.sequelize.query("CALL userLogin(:email)", {
      replacements: {
        email,
      },
    });

    let accessToken;

    let user = data[0].result;

    if (user.data !== null) {
      const isPasswordValid = await validPassword(password, user.password);

      if (!isPasswordValid) {
        return errorResponseWithoutData(
          res,
          messages.incorrectCredentials,
          400
        );
      }

      accessToken = await generateAccessToken(user.data);
    }

    return successResponseData(res, data, user.status, user.message, {
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

module.exports.registerAdmin = async (req, res) => {
  try {
    let { password, role_id } = req.body;

    const username = req.body.username.replace(/ +/g, "");

    const email = req.body.email.toLowerCase();

    password = bcrypt.hashSync(password, bcrypt.genSaltSync(10), null);

    const data = await Models.sequelize.query(
      "CALL registerAdmin(:username, :email, :password, :role_id)",
      {
        replacements: {
          username,
          email,
          password,
          role_id,
        },
      }
    );

    const admin = data[0].result;

    return successResponseData(res, admin.data, admin.status, admin.message);
  } catch (error) {
    return errorResponseWithoutData(
      res,
      `${messages.somethingWentWrong}: ${error}`,
      400
    );
  }
};
