module.exports = args => {
  return async (ctx, next) => {
    try {
      const { authorization } = ctx.headers;
      const [type, token] = ctx.headers.authorization.split(' ');
      
      ctx.state.authToken = token;

      let query = global.model.user.findUserByToken(token);
      if(args && args.fetchUser === false) query = query.lean();
      
      user = await query;
      
      if (!user) return ctx.throw(401);

      global.model.user.touch(user._id);
      ctx.state.user = user;

    } catch (e) {
      console.log(e);
      await ctx.throw(401);
    }
    await next();
  };
};