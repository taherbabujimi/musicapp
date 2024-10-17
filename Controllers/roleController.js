const Models = require("../models/index");
const { messages } = require("../services/messages");
const {
  errorResponseWithoutData,
  successResponseData,
} = require("../services/responses");

module.exports.addRole = async (req, res) => {
  try {
    const { role_name, permissions } = req.body;

    const oldRole = await Models.Role.findOne({
      where: { role_name: role_name },
    });

    if (oldRole) {
      return errorResponseWithoutData(res, messages.roleAlreadyExists, 400);
    }

    const role = await Models.Role.create({
      role_name,
    });

    const promises = permissions.map((permission_id) =>
      role.addPermission(permission_id)
    );

    Promise.all(promises)
      .then((result) => {
        console.log("Permissions added: ", result);
      })
      .catch((error) => {
        console.log("Error while adding permissions: ", error);
      });

    return successResponseData(res, role, 200, messages.roleAddedSucces);
  } catch (error) {
    return errorResponseWithoutData(
      res,
      `${messages.somethingWentWrong}: ${error}`,
      400
    );
  }
};
