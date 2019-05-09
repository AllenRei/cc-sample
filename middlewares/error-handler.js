const jsonHandler = function(code, obj) {
  this.jsonError = obj;
  this.throw(code, obj);
};
const codeHandler = function(code) {
  this.throw(code, obj);
}
module.exports = async (ctx, next) => {
  try {
    ctx.throwJson = jsonHandler;
    ctx.throwCode = codeHandler;
    await next();
  } catch (err) {
    if (err) console.error("Throwed error without details");
    console.log(`Entered error handler on ${ctx.path}`, err);
    ctx.status = err ? err.status || 500 : 500;
    ctx.body = ctx.jsonError || err.message;
  }
};
