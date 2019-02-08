const Koa = require("koa");
const Router = require("koa-router");
const oauth = require("./oauth");
const { jwt } = require("./middleware/auth");

const app = new Koa();
const router = new Router();

router.get("/", async ctx => {
  ctx.query.pretty = true;
  ctx.body = {
    routes: {
      "/session": "Returns the currently authenticated user's session",
      "/connect/uclapi": "Authorise via the UCL API",
      "/connect/uclapi/callback": "Callback from the UCL API",
      "/user": "Get information about the currently authenticated user.",
      "/timetable": {
        description: "Return the timetable for the current user.",
        parameters: {
          date: "filter by date.",
        },
      },
      "/search": {
        description: "Returns matching people and information about them",
        parameters: {
          query: "Name of the person you are searching for."
        },
      },
      "/workspaces": "Returns all available workspaces",
      "/workspaces/summary": "Returns summarised data about the occupancy of \
                              all available workspaces",
      "/workspaces/historic": {
        description: "Returns historic data about the occupancy of a workspace",
        parameters: {
          id: "specify survey id for which you want historic data"
        },
      },
      "/workspaces/:id/seatinfo": "returns data for a specific workspace",
      "/workspaces/getimage/:id.png": "returns live seating map given an image id",
      "/ping": "returns a 200 OK message. good for testing liveness",
      "/echo": "returns the HTTP message body as the content",
    },
    tips: {
      "pretty-print": "Add ?pretty=true to pretty print the json (as shown)",
    },
    version: ctx.version,
  };
});

// import and use the OAuth router.
oauth(router);

router.get("/testauth", jwt, async ctx => {
  ctx.body = "Authenticated!";
});

router.get("/ping", async ctx => {
  ctx.body = "pong!";
  ctx.status = 200;
});

router.get("/echo", async ctx => {
  ctx.response.body = ctx.request.body;
  ctx.status = 200;
});

// route not found.
router.get(/.*/, async ctx => {
  console.log("yo");
  ctx.throw(404, "Not found");
});

app.use(router.routes());
app.use(router.allowedMethods());
module.exports = app;
