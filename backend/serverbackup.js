const express = require("express");
const twilio = require("./twilio");
const cors = require("cors");
const bodyParser = require("body-parser");

//const http = require("http");
const socketIo = require("socket.io");

const app = require("express")();

const jwt = require("jsonwebtoken");
const secret_key = "some_secret";

// const token = jwt.sign({username} , secret_key);
// const data = jwt.verify(token , secret_key);

app.use(bodyParser.json());
app.use(cors());

app.use(function (request, response, next) {
  response.header("Access-Control-Allow-Origin", "*");
  response.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.post("/test", (req, resp) => {
  const { a } = req.body;

  console.log(a);
  resp.send("test");
});

app.post("/login", async (req, resp) => {
  const data = await twilio.sendVerify("+15107365704‬", "sms");
  console.log(data);
  resp.send(data);
});

app.post("/sendverifycheck", async (req, resp) => {
  let { code } = req.body;
  const data = await twilio.sendVerifyCheck("+15107365704", code);
  console.log("data from server.js" + data);
  resp.send(data);
});

app.post("/handlecall", async (req, resp) => {
  console.log("call connected from twilio");
  io.emit("call-new", { data: "test" });
  const response = twilio.voiceResponse("thank you for call");
  resp.type("text/xml");
  resp.send(response.toString());
});

app.post("/handlecallstatuschange", async (req, resp) => {
  console.log("call status changed from twilio");
});

app.use(function (request, response, next) {
  response.header("Access-Control-Allow-Origin", "*");
  response.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.listen("3001", () => {
  console.log("listening on port 3001");
});

//const server = http.createServer(app);
var http = require("http").createServer(app);

//const io = socketIo(server);

// const io = socketIo(server, {
//   cors: {
//     origin: "http://localhost:3000",
//     methods: ["GET", "POST"],
//     credentials: true,
//   },
// });

var io = require("socket.io")(http);
// const socket = socketIo(server);

io.on("connection", (socket) => {
  console.log("socket connected", socket.id);
});
