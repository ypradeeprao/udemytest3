const express = require("express");
const twilio = require("./twilio");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const port = process.env.PORT || 4001;
const index = require("./routes/index");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const { twiml } = require("twilio");

const app = express();
app.use(index);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

const server = http.createServer(app);

const secret_key = "some_secret";

// verify logic
app.post("/login", async (req, resp) => {
  console.log(req.body.usernumber);
  // const data = await twilio.sendVerify("+ ", "sms");
  const data = await twilio.sendVerify(req.body.usernumber, "sms");

  console.log(data);
  resp.send(data);
});

app.post("/sendverifycheck", async (req, resp) => {
  let { username, code, usernumber } = req.body;
  const data = await twilio.sendVerifyCheck(usernumber, code);
  console.log("data from server.js" + data);
  resp.send(data);

  const token = jwt.sign({ username }, secret_key);
  socket.emit("logintoken", token);
});

app.post("/handlecall", async (req, resp) => {
  console.log("call connected from twilio");
  io.emit("call-new", { data: req.body });
  let response = twilio.voiceResponse("no thank you for call");
  resp.type("text/xml");
  resp.send(response.toString());

  // response = twilio.enqueCall("thank you for call");
  // resp.type("text/xml");
  // resp.send(response.toString());
});

app.post("/enque", async (req, resp) => {
  console.log("call is in queue");
  io.emit("call-inque", { data: req.body });
  response = twilio.enqueCall("queue name");
  resp.type("text/xml");
  resp.send(response.toString());
});

app.post("/handlecallstatuschange", async (req, resp) => {
  console.log("call disconnected from twilio");
  console.log(resp.body);
  io.emit("call-disc", { data: req.body });
  resp.send("ok");
});

app.post("/connectcall", async (req, resp) => {
  console.log("call is in answering");
  console.log(req.query.client);
  console.log(req.query.callsid);
  let data = { client: req.query.client, callsid: req.query.callsid };
  io.emit("call-answer", { data: data });
  response = twilio.redirectCall(req.query.client);
  resp.type("text/xml");
  resp.send(response.toString());
});

app.post("/dialcallpost", async (req, resp) => {
  console.log("call is in answering");
  //console.log(req.data.CallSid);
  console.log(req.body.CallSid);
  io.emit("dialowncall", {
    data: { CallSid: req.body.CallSid, client: req.query.client },
  });
  response = twilio.redirectCall(req.query.client);
  resp.type("text/xml");
  resp.send(response.toString());
});

app.post("/dialcallpostemit", async (req, resp) => {
  console.log("dialcallpostemit");
  io.emit("call-disc", { data: req.body });
});

app.post("/disconnectcall", async (req, resp) => {
  console.log("call is in disconnectcall");
  console.log(req.query.client);
  response = twilio.disconnectCallMessage(req.query.client);
  resp.type("text/xml");
  resp.send(response.toString());
});

app.post("/disconnectowncall", async (req, resp) => {
  console.log("call is in disconnectowncall");
  console.log(req.query.client);
  response = twilio.disconnectCallMessage(req.query.client);
  resp.type("text/xml");
  resp.send(response.toString());
});

//socket

const io = socketIo(server, {
  cors: {
    // origin: "http://localhost:3000",
    origin: "http://ypradeeprao.github.io/",
    methods: ["GET", "POST"],
  },
});

let interval;

io.on("connection", (socket) => {
  console.log("New client connected");
  //getApiAndEmit(socket);
  // let tokentosend = twilio.getAccessTokenforVoice("pradeep");
  // console.log(tokentosend);
  // socket.emit("twilioclienttoken", {
  //   token: tokentosend,
  // });

  socket.on("sendverifycheck", async (req) => {
    console.log("from sendverifycheck");
    console.log(req);

    let { username, code, usernumber } = req;
    console.log(usernumber);
    console.log(code);
    const data = await twilio.sendVerifyCheck(usernumber, code);
    console.log("isverified" + data);
    let tokentosend = twilio.getAccessTokenforVoice(username);
    console.log("tokentosend");
    console.log(tokentosend);
    socket.emit("twilioclienttoken", {
      token: tokentosend,
      isverified: data,
    });
  });

  // socket.on("gettwilioclienttoken", (a) => {
  //   console.log("from gettwilioclienttoken");
  //   let tokentosend = twilio.getAccessTokenforVoice("pradeep");
  //   socket.emit("twilioclienttoken", {
  //     token: tokentosend,
  //   });
  // });

  socket.on("answercall", (a) => {
    console.log("from Client answercall");
    console.log(a.callSid);
    console.log(a.client);
    twilio.answerCall(a.callSid, a.client);
  });

  socket.on("dialcall", (req) => {
    console.log("from Client dialcall");
    console.log(req);
    twilio.dialCall(req.phoneno, req.client);
  });

  socket.on("rejectcall", (a) => {
    console.log("from Client rejectcall");
    console.log(a.callSid);
    twilio.rejectCall(a.callSid);
  });

  socket.on("disconnectcall", (a) => {
    console.log("from Client disconnectcall");
    console.log(a.callSid);
    twilio.disconnectCall(a.callSid, a.client);
  });

  socket.on("disconnectownCall", (a) => {
    console.log("from Client disconnectOwnCall");
    console.log(a.callSid);
    twilio.disconnectOwnCall(a.callSid, a.client);
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// const getApiAndEmit = (socket) => {
//   const response = new Date();
//   socket.emit("FromAPI", response);
// };

server.listen(port, () => console.log(`Listening on port ${port}`));
