const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const app = express();
const port = 4000;
const server = http.createServer(app);
const io = socketIO(server);
const mineflayer = require("mineflayer");
const {
  pathfinder,
  Movements,
  goals: { GoalNear },
} = require("mineflayer-pathfinder");
const command = require("./command/pathfinder");
const autofarm = require("./command/autofarm");
const basiccommand = require("./command/basic");

server.listen(3000, () => {
  console.log("listening on *:3000");
});

app.use(express.json());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html"); // แก้ไขที่อยู่ไฟล์
});

const bot = mineflayer.createBot({
  host: "0.0.0.0",
  username: "lolykung",
  port: "55555",
  auth: "offline",
});

bot.loadPlugin(pathfinder);

bot.once("spawn", () => {
  command.goToPlayer(bot);
  command.goToPos(bot);
});

bot.on("messagestr", (message) => {
  console.log(message);
  io.emit("chat-message", message); // ส่งข้อมูลไปยังห้อง Socket.io
});
bot.on("kicked", console.log);
bot.on("error", console.log);

// FarmPumpkin
let isFarmPumpkinEnabled = false;
app.post("/farm-pumpkin", (req, res) => {
  if (isFarmPumpkinEnabled) {
    isFarmPumpkinEnabled = false;
    autofarm.FarmPumpkin(bot, isFarmPumpkinEnabled);
    return res.status(200).json({
      message: "FarmPumpkin",
      status: isFarmPumpkinEnabled,
    });
  } else {
    isFarmPumpkinEnabled = true;
    autofarm.FarmPumpkin(bot, isFarmPumpkinEnabled);
    return res.status(200).json({
      message: "FarmPumpkin",
      status: isFarmPumpkinEnabled,
    });
  }
});
// FarmPumpkin]

// Command to bot
app.post("/command", (req, res) => {
  const { message } = req.body;
  basiccommand.CommandTodo(bot, message);
  return res.status(200).json({
    message: "Command",
    status: true,
  });
});
// Command to bot

// Position TO GO
app.post("/send-pos", (req, res) => {
  basiccommand.PositionToWalk(bot, req.body);
  return res.status(200).json({
    message: "Position",
    status: true,
  });
});
// Position TO GO
