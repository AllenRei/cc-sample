const Router = require("koa-router");
const router = new Router();
const auth = require("../middlewares/bearer-auth");
const light = auth({
  fetchUser: false
});
const koaBody = require('koa-body');
const sharp = require('sharp');

const {
  uploadFile
} = require("../services/s3");
const {
  validate,
  Joi
} = require("../middlewares/joi-validator");

const Event = require("../models/Event");

router.get("/", auth(), async ctx => {
  ctx.status = 200;
  ctx.body = await ctx.state.user.getRegInfo();
});

router.put(
  "/device-token",
  light,
  validate({
    body: {
      deviceToken: Joi.string().required()
    }
  }),
  async ctx => {
    try {
      await global.user.changeDeviceToken(
        ctx.state.user.id,
        ctx.state.authToken,
        ctx.request.body.deviceToken
      );
      ctx.status = 200;
    } catch (e) {
      console.error(e);
      ctx.throw(500);
    }
  }
);

router.put("/avatar", auth(), koaBody({
  multipart: true
}), async ctx => {
  const picture = ctx.request.files.picture;
  let file;
  let f = sharp(picture.path).resize(300).png();
  try {
    const filename = `avatars/${ctx.state.user.id}.png}`;
    file = await uploadFile(f, filename);
  } catch (e) {
    return ctx.throw(500);
  }
  console.log(file);
  ctx.state.user.avatar = file.url;
  await ctx.state.user.save();
  ctx.status = 200;
  ctx.body = {
    url: file.url
  };
});

router.get("/debts", auth(), async ctx => {
  let calcs = await Event.find({
    calculations: {
      transfers: {
        $elemMatch: {
          $or: [
            {
              from: {
                $eq: ctx.state.user.id
              }
            },
            {
              to: {
                $eq: ctx.state.user.id
              }
            }
          ]
        }
      }
    },
  });
  ctx.status = 200;
  ctx.body = calcs;
});

module.exports = router;