module.exports.isParticipant = async (ctx, next) => {
    if (ctx.state.event.participants.find(
            p => p.toString() === ctx.state.user.id.toString()
        )) {
        await next();
    } else {
        ctx.throw(403);
    }
}