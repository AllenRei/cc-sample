const mongoose = require("mongoose");
module.exports.schemaIdCheck = (param) => {
    return async (ctx, next) => {
      //checks params.id and throwing error if it's invalid
      if (ctx.params[param]) {
        if (mongoose.Types.ObjectId.isValid(ctx.params[param])) {
          await next();
        } else {
          return ctx.throwJson(400, { err: "Wrong " + param + " param" });
        }
      } else {
        await next();
      }
    };
  }