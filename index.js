const Koa = require("koa");
const bodyParser = require("koa-bodyparser")
const morgan = require("koa-morgan");
const cors = require('koa2-cors');
const Router = require("koa-router");
const http = require("http");
const app = new Koa();
const api = Router();

require("dotenv").config();

global.constants = require("./constants");
global.basepath = __dirname;
global.config = require("./config.js");
global.helpers = require("./utils/helpers.js");
global.helpers.loadFrom("model", "models");

require('./services/firebase').init()
require('./services/mongoose').init();
require('./services/s3').init()

const auth = require('./routes/auth.route');
const users = require('./routes/users.route');
const test = require('./routes/test.route');
const event = require('./routes/event.route');
const invites = require('./routes/invite.route');
const me = require('./routes/me.route');

console.log(`Running in  ${process.env.ENV==='prod'} mode`);

app.use(require('./middlewares/error-handler'));

app.use(morgan(":date[clf] :method :url :res[content-length] :status - :response-time ms "));
app.use(cors());
app.use(bodyParser());

api.use('/auth', auth.routes());
api.use('/users', users.routes());
api.use('/test', test.routes());
api.use('/events', event.routes());
api.use('/me', me.routes());
api.use('/invites', invites.routes());

app.use(api.routes());

const server = http.createServer(app.callback());

if (!module.parent) {
  server.listen(process.env.PORT || global.config.PORT);
  server.on("listening", () => {
    console.info("Server listening on ", server.address().port);
  });
}

module.exports = server;