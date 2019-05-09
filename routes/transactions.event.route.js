const Router = require("koa-router");
const router = new Router();

const { validate, Joi } = require("../middlewares/joi-validator");
const { paginate } = require("../middlewares/paginate");

let mongoose = require('mongoose');

router.post(
  "/",
  validate({
    body: {
      type: Joi.number().required(),
      tag: Joi.string().optional(),
      amount: Joi.number().required(),
      comment: Joi.string().max(256).optional(),
      target: Joi.string().optional(),
      attachments: Joi.array()
    }
  }),
  async ctx => {
    
    const options = {
      _id : mongoose.Types.ObjectId(),
      author: ctx.state.user.id,
      tag: ctx.request.body.tag,
      type: ctx.request.body.type,
      amount: ctx.request.body.amount,
      comment : ctx.request.body.comment,
      date: Date.now()
    };

    ctx.state.event.transactions.push(options);
    
    await ctx.state.event.save();
    await ctx.state.event.calculate();

    ctx.status = 200;
    ctx.body = options;
  }
);

router.get("/", paginate, async ctx => {
  let items = [];
  let count = ctx.state.event.actions.length;
  if (ctx.query["tag"]) {
    items = ctx.state.event.toObject().actions.filter(a => a.tag === ctx.query["tag"]);
    count = items.length;
  } else {
    items = ctx.state.event.toObject().actions;
  }
  items = items.map(i => {
    let p = ctx.state.user.pointers.find(
      po => po.event.toString() === ctx.state.event.id.toString()
    );
    if(!p || i.date >= p.date) i.is_new = true;
    return i;
  })

  ctx.status = 200;
  ctx.body =  items;
});

module.exports = router;
