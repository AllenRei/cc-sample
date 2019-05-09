module.exports.paginate = async (ctx, next) => {
    try {
        if (ctx.query["limit"]) ctx.state.limit = parseInt(ctx.query["limit"]);
        else ctx.state.limit = 10;

        if (ctx.query["offset"]) ctx.state.skip = parseInt(ctx.query["offset"]);
        else ctx.state.skip = 0;

        await next();
    } catch (e) {
        console.log(e);
        return ctx.throw(400);
    }
}