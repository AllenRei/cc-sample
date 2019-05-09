const Router = require("koa-router");
const router = new Router();
const auth = require("../middlewares/bearer-auth");

router.get('/:id', auth(), async ctx => {
    try {
        const user = await global.model.user.findById(ctx.params.id);
        ctx.status = 200;
        ctx.body = await user.getRegInfo();
    }catch(e) {
        console.error(e);
        ctx.status = 404
    }    
})

router.post('/', auth(), async ctx => {
    let users = ctx.request.body.users;
    let res = await User.find().where('_id').in(users);
    
    ctx.status = 200;
    ctx.body = res.map(r => {
        return {
            role: r.role,
            name: r.name,
            avatar: r.avatar,
            _id: r._id
        }
    });
})

module.exports = router;