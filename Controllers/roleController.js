const Models = require("../models/index");
const { messages } = require("../services/messages");
const {
  errorResponseWithoutData,
  successResponseData,
} = require("../services/responses");
const {
  addRoleValidation,
} = require("../services/validation/addRoleValidation");

module.exports.addRole = async (req, res) => {
  try {
    const validationResult = addRoleValidation(req.body, res);
    if (validationResult !== false) return;

    const { role_name, permissions } = req.body;

    const data = await Models.sequelize.query(
      "CALL addRole(:role_name, :permissions)",
      {
        replacements: {
          role_name,
          permissions: JSON.stringify(permissions),
        },
      }
    );

    const role = data[0].result;

    return successResponseData(res, role.data, role.status, role.message);
  } catch (error) {
    return errorResponseWithoutData(
      res,
      `${messages.somethingWentWrong}: ${error}`,
      400
    );
  }
};
