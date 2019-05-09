const Router = require("koa-router");
const router = new Router();
const auth = require("../middlewares/bearer-auth");
const admin = require("firebase-admin");

router.post("/", async ctx => {
  let idToken = ctx.request.body.token;
  try {
    var { uid } = await admin.auth().verifyIdToken(idToken);
  } catch (e) {
    console.log(e);
    return ctx.throwJson(401, { err: "Invalid token" });
  }
  try {
    let user = await global.model.user.findOne({ firebaseId: uid });
    let newUser = false;

    if (!user) {
      let fuser = await admin.auth().getUser(uid);
      user = await global.model.user.create({
        email: fuser.email,
        name: fuser.displayName,
        avatar: fuser.photoURL,
        firebaseId: uid
      });
      user.save();
      newUser = true;
    }
    
    const deviceToken = ctx.request.body.deviceToken;

    let token = await global.model.user.authorize(user._id, deviceToken);

    let info = await user.getRegInfo();

    ctx.status = newUser ? 201 : 200;
    ctx.body = {
      token,
      user: info
    };
  } catch (e) {
    console.error(e);
    return ctx.throw(500);
  }
});

router.post("/logout", auth(), async ctx => {
  try {
    await global.user.deauthorize(ctx.state.authToken);
    ctx.status = 200;
  } catch (e) {
    console.error(e);
    return ctx.throw(500);
  }
});

module.exports = router;
