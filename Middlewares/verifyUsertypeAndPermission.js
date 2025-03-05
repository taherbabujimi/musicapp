"use strict";

const Models = require("../models/index");
const { messages } = require("../services/messages");
const {
  errorResponseWithoutData,
  errorResponseData,
} = require("../services/responses");

module.exports.verifyUsertypeAndPermission = (
  allowedUserType,
  allowedPermission = []
) => {
  return async (req, res, next) => {
    try {
      if (!allowedUserType.includes(req.user.usertype)) {
        return errorResponseWithoutData(res, messages.notAuthorized, 400);
      }

      console.log("USER: ", JSON.stringify(req.user.dataValues));

      if (allowedPermission.length !== 0) {
        const permission_ids = await Models.Role.findOne({
          where: { id: req.user.role_id },
          include: [{ model: Models.Permission, through: { attributes: [] } }],
        });

        const permissions = permission_ids.dataValues.Permissions.map(
          (permission) => permission.dataValues.permission
        );

        const hasPermission = allowedPermission.every((perm) =>
          permissions.includes(perm)
        );

        if (!hasPermission) {
          return errorResponseWithoutData(
            res,
            "You don't have permission.",
            400
          );
        }
      }

      next();
    } catch (error) {
      return errorResponseWithoutData(
        res,
        `${messages.somethingWentWrong}: ${error}`,
        500
      );
    }
  };
};
