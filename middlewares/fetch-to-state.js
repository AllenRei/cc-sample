module.exports.fetchToState = (param, name) => {
    return async (ctx, next) => {
      let elem;

      if (!mongoose.Types.ObjectId.isValid(ctx.params[param])) {
        ctx.throwJson(400, { err: "Wrong " + param + " param" });
      }

      try {
        elem = await global.model[name].findById(ctx.params[param]);
      } catch (e) {
        console.log(e);
        return ctx.throw(500);
      }
      if (!elem) return ctx.throwJson(404, { err: name + " Not found!" });
      ctx.state[name] = elem;
      await next();
    };
  }