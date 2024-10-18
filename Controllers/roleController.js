const Models = require("../models/index");
const { messages } = require("../services/messages");
const {
  errorResponseWithoutData,
  successResponseData,
} = require("../services/responses");
const {
  addRoleValidation,
} = require("../services/validation/addRoleValidation");
const { sequelize } = require("../models/index");

module.exports.addRole = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const validationResult = addRoleValidation(req.body, res);
    if (validationResult !== false) return;

    const { role_name, permissions } = req.body;

    const oldRole = await Models.Role.findOne({
      where: { role_name: role_name },
    });

    if (oldRole) {
      return errorResponseWithoutData(res, messages.roleAlreadyExists, 400);
    }

    const role = await Models.Role.create(
      {
        role_name,
      },
      { transaction }
    );

    const promises = permissions.map((permission_id) =>
      role.addPermission(permission_id, { transaction })
    );

    Promise.all(promises)
      .then(async (result) => {
        console.log("Permissions added: ", result);
        await transaction.commit();
        return successResponseData(res, role, 200, messages.roleAddedSucces);
      })
      .catch(async (error) => {
        console.log("Error while adding permissions: ", error);
        await transaction.rollback();
        return errorResponseWithoutData(
          res,
          messages.errorAddingPermission,
          400
        );
      });
  } catch (error) {
    await transaction.rollback();
    return errorResponseWithoutData(
      res,
      `${messages.somethingWentWrong}: ${error}`,
      400
    );
  }
};
