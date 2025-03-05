"use strict";

module.exports = {
  successResponseData(res, data, code = 1, message, extras) {
    const response = {
      data,
      meta: {
        code,
        message,
      },
    };
    if (extras) {
      Object.keys(extras).forEach((key) => {
        if ({}.hasOwnProperty.call(extras, key)) {
          response.meta[key] = extras[key];
        }
      });
    }

    return res.status(code).json(response);
  },

  successResponseWithoutData(res, message, code = 1) {
    const response = {
      data: null,
      meta: {
        code,
        message,
      },
    };
    return res.status(code).json(response);
  },

  errorResponseWithoutData(res, message, status = 200, metaData = {}) {
    const response = {
      data: null,
      meta: {
        message,
        ...metaData,
      },
    };
    return res.status(status).send(response);
  },

  errorResponseData(res, message, error, code = 400) {
    const response = {
      code,
      message,
      error,
    };
    return res.status(code).json(response);
  },

  validationErrorResponseData(res, message, code = 400) {
    const response = {
      code,
      message,
    };
    return res.status(code).json(response);
  },
};
