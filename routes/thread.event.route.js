const Router = require("koa-router");
const router = new Router();
const mongoose = require('mongoose');

const { validate, Joi } = require("../middlewares/joi-validator");
const { schemaIdCheck } = require("../middlewares/schema-id-check");
const { paginate } = require("../middlewares/paginate");


router.post(
  "/:cid",
  schemaIdCheck("cid"),
  validate({
    body: {
      body: Joi.string()
        .max(912)
        .required()
    }
  }),
  async ctx => {
    let comment = {
      _id : mongoose.Types.ObjectId(),
      from: ctx.state.user.id,
      reply: ctx.params["cid"],
      body: ctx.request.body.body
    };
    ctx.state.event.thread.unshift(comment);
    try {
      await ctx.state.event.save();
    } catch (e) {
      console.error(e);
      return ctx.throw(500);
    }
    ctx.status = 200;
    ctx.body = comment;
  }
);

router.post(
  "/",
  validate({
    body: {
      body: Joi.string()
        .max(912)
        .required()
    }
  }),
  async ctx => {
    const comment = {
      from: ctx.state.user.id,
      body: ctx.req.body.body
    };
    ctx.state.event.thread.unshift(comment);

    try {
      await ctx.state.event.save();
    } catch (e) {
      return ctx.throw(500);
    }

    ctx.status = 200;
    ctx.body = comment;
  }
);

router.get("/", paginate, async ctx => {
  const count = ctx.state.event.thread.length;
  const items = ctx.state.event.thread.slice(
    ctx.state.skip,
    ctx.state.skip + ctx.state.limit
  );

  ctx.status = 200;
  ctx.body = { count, items };
});

module.exports = router;
