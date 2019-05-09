const joi = require("joi");

module.exports = {
  validate: (schema, options) => {
    options = options || {};
    return async (ctx, next) => {
      for (let key in schema) {
        for (let k in schema[key]) {
          let { error } = joi.validate(
            ctx.request[key][k],
            schema[key][k],
            options
          );
          if (error) {
            let err = error.details[0];

            return ctx.throwJson(400, {
              err: err.message,
              path: err.path
            });
          }
        }
      }
      await next();
    };
  },
  Joi : joi
};
