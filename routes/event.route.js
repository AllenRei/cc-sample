const Router = require("koa-router");
const router = new Router();
const { validate, Joi } = require("../middlewares/joi-validator");
const { ACTION_TYPES } = require("../constants");
const { fetchToState } = require("../middlewares/fetch-to-state");
const { isParticipant } = require('../middlewares/is-event-participant');
const { uniqueElementsById, randomString, encryptCode } = require("../utils/helpers");
const auth = require("../middlewares/bearer-auth");
const { sendInviteEmailTo } = require('../services/sendgrid');
const fetchEvent = fetchToState("id", "event");

const threads = require("./thread.event.route");
const transactions = require("./transactions.event.route");
const tags = require("./tags.event.route");
const files = require("./files.event.route");

router.use("/:id/tags", auth(), fetchEvent, isParticipant, tags.routes());
router.use("/:id/transactions", auth(), fetchEvent, isParticipant, transactions.routes());
router.use("/:id/thread", auth(), fetchEvent, isParticipant, threads.routes());
router.use("/:id/files", auth(), fetchEvent, isParticipant, files.routes());


router.post(
  "/",
  auth(),
  validate({
    body : {
      title: Joi.string()
      .max(256)
      .required(),
      description: Joi.string()
      .max(256)
      .optional(),
      invites : Joi.array().items(Joi.string().email()).optional()
    }    
  }),
  async ctx => {
    try {
      let event = await global.model.event.create({
        title: ctx.request.body.title,
        description: ctx.request.body.description,
        admins: [ctx.state.user.id],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        inviteCode : randomString(3),
        participants: [ctx.state.user.id],
        thread: [],
        actions: [],
        tags: []
      });

      process.nextTick(async () => {
        const { invites } = ctx.request.body
        const users = await global.model.user.find({}).where('email').in(invites).lean();

        const mailersList = invites.filter(inv => !users.find(u => u.email === inv));
        const encrypted = encryptCode(event.inviteCode);
        mailersList.forEach(mail => sendInviteEmailTo(mail, global.config.FRONT_HOST+'/invite?hash=' + encrypted));        
        users.forEach(u => {
          if(event.participants.find(p => p.toString() === u._id.toString())) {
            event.participants.push(u._id)
          }
        });
        await event.save();
      });

      ctx.status = 200;
      ctx.body = await event.getFullInfo();
    } catch (e) {
      console.error(e);
      ctx.throw(500);
    }
  }
);

router.get('/', auth(), async ctx => {
  const events = await global.model.event.find({ participants : ctx.state.user.id }).lean();
  ctx.status = 200;
  ctx.body = events;
});

router.get('/count', auth(), async ctx => {
  let events = await global.model.event.find({ participants : ctx.state.user.id });
  let actions = 0;
  events.forEach(e => actions += e.actions.length);
  ctx.status = 200;
  ctx.body = actions
})

router.get("/:id", auth(), fetchEvent, isParticipant, async ctx => {
  ctx.status = 200;
  let event = await ctx.state.event.getFullInfo();
  ctx.body = event;
});

router.post("/:id/invite", auth(), fetchEvent, isParticipant, async ctx => {
  ctx.state.event.invite_code = randomString(3);
  await ctx.state.event.save()
  let encrypted = encryptCode(ctx.state.event.invite_code);
  ctx.status = 200;
  ctx.body = {
    code : ctx.state.event.invite_code,
    url : global.config.FRONT_HOST+'/invite?hash='+encrypted
  }
});

router.post("/:id/read", auth(), fetchEvent, isParticipant, async ctx => {
  let exist = false;
  for (let i = 0; i < ctx.state.user.pointers.length; i++) {
    let e = ctx.state.user.pointers[i];
    if(e.event.toString() === ctx.params.id){
      ctx.state.user.pointers[i].date = Date.now();
      exist = true;
    }
  }
  if(!exist) {
    ctx.state.user.pointers.push({
      event : ctx.params.id,
      date : Date.now()
    })
  }
  await ctx.state.user.save();
  ctx.status = 200;
});

router.get('/:id/participants', auth(), fetchEvent, isParticipant, async ctx => {
  let participants = await global.model.user.find({}, 'name avatar role lastSeenAt')
    .where('_id')
    .in(ctx.state.event.participants).lean()
  ctx.status = 200;
  ctx.body = participants;
});


module.exports = router;
