const { validate, Joi } = require("../middlewares/joi-validator");

const Router = require("koa-router");
const router = new Router();
const mongoose = require('mongoose');

router.post(
  "/",  
  validate({
    body: {
      title: Joi.string()
        .max(128)
        .required()
    }
  }),
  async ctx => {
    const tag = {
      title: ctx.request.body.title,
      _id : mongoose.Types.ObjectId()
    };
    ctx.state.event.tags.unshift(tag);
    try {
      await ctx.state.event.save();
    } catch (e) {
      ctx.throw(500);
    }
    ctx.status = 200;
    ctx.body = tag;
  }
);

module.exports = router;
