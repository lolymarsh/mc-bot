require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const app = express();
const portServer = process.env.PORT_SERVER || 3000;
const server = http.createServer(app);
const io = socketIO(server);
const mineflayer = require("mineflayer");
const { pathfinder } = require("mineflayer-pathfinder");

const autofarm = require("./command/autofarm");
const basiccommand = require("./command/basic");
const commandbasic = require("./command/pathfinder");

server.listen(portServer, () => {
  console.log(`listening on *:${portServer}`);
});

app.use(express.json());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html"); // แก้ไขที่อยู่ไฟล์
});

const createBot = () => {
  try {
    const bot = mineflayer.createBot({
      host: process.env.HOST_SERVER,
      username: process.env.BOT_NAME,
      // port: process.env.PORT_SERVER_MC || "",
      auth: "offline",
    });

    bot.setMaxListeners(20);
    bot.loadPlugin(pathfinder);

    return bot;
  } catch (error) {
    console.log(error);
    return;
  }
};

bot.on("end", createBot);
bot = createBot();

bot.on("resourcePack", () => {
  console.log("Resource pack accepted.");
  bot.acceptResourcePack();
});

bot.on("messagestr", (message) => {
  console.log(message);
  io.emit("chat-message", message);
});
bot.on("kicked", (message) => {
  console.log(message);
  io.emit("chat-message", message);
});
bot.on("error", (message) => {
  console.log(message);
  io.emit("chat-message", message);
});

// FarmPumpkin
let isFarmPumpkinEnabled = false;
app.post("/farm-pumpkin", (req, res) => {
  try {
    if (isFarmPumpkinEnabled) {
      isFarmPumpkinEnabled = false;
      autofarm.FarmPumpkin(bot, isFarmPumpkinEnabled, io);
      return res.status(200).json({
        message: "FarmPumpkin",
        status: isFarmPumpkinEnabled,
      });
    } else {
      isFarmPumpkinEnabled = true;
      autofarm.FarmPumpkin(bot, isFarmPumpkinEnabled, io);
      return res.status(200).json({
        message: "FarmPumpkin",
        status: isFarmPumpkinEnabled,
      });
    }
  } catch (error) {
    console.log(err);
    return res.status(400).json({
      message: "Error",
      status: false,
    });
  }
});
// FarmPumpkin

// FarmWheat
let isFarmWheatEnabled = false;
app.post("/farm-wheat", (req, res) => {
  try {
    if (isFarmWheatEnabled) {
      isFarmWheatEnabled = false;
      autofarm.FarmWheat(bot, isFarmWheatEnabled, io);
      // loop();
      return res.status(200).json({
        message: "FarmWheat",
        status: isFarmWheatEnabled,
      });
    } else {
      isFarmWheatEnabled = true;
      autofarm.FarmWheat(bot, isFarmWheatEnabled, io);
      // loop();
      return res.status(200).json({
        message: "FarmWheat",
        status: isFarmWheatEnabled,
      });
    }
  } catch (error) {
    console.log(err);
    return res.status(400).json({
      message: "Error",
      status: false,
    });
  }
});
// FarmWheat

// Command to bot
app.post("/command", (req, res) => {
  try {
    const { message } = req.body;
    basiccommand.CommandTodo(bot, message);
    return res.status(200).json({
      message: "Command",
      status: true,
    });
  } catch (error) {
    console.log(err);
    return res.status(400).json({
      message: "Error",
      status: false,
    });
  }
});
// Command to bot

// Position TO GO
app.post("/send-pos", (req, res) => {
  try {
    basiccommand.PositionToWalk(bot, req.body);
    return res.status(200).json({
      message: "Position",
      status: true,
    });
  } catch (error) {
    console.log(err);
    return res.status(400).json({
      message: "Error",
      status: false,
    });
  }
});
// Position TO GO

// Position-user
app.post("/follow-user", (req, res) => {
  try {
    const { user } = req.body;
    commandbasic.goToPlayer(bot, user);
    return res.status(200).json({
      message: "Follow User",
      status: true,
    });
  } catch (error) {
    console.log(err);
    return res.status(400).json({
      message: "Error",
      status: false,
    });
  }
});
// Position-user

// Join to survival
app.post("/amory-join", (req, res) => {
  try {
    bot.activateItem();
    bot.on("windowOpen", async (window) => {
      if (window.type === "minecraft:generic_9x6") {
        // console.log("Inventory 9x6 opened");
        // for (let i = 0; i < window.slots.length; i++) {
        //   const slot = window.slots[i];
        //   if (slot) {
        //     console.log(`Slot ${i}: ${slot.name}, Count: ${slot.count}`);
        //     if (slot.nbt) {
        //       console.log("NBT Data:", JSON.stringify(slot.nbt, null, 2));
        //     }
        //   }
        // }
        await bot.clickWindow(15, 0, 0);
        await bot.clickWindow(16, 0, 0);
        await bot.clickWindow(17, 0, 0);
      }
    });
    return res.status(200).json({
      message: "Join to survival",
      status: true,
    });
  } catch (error) {
    console.log(err);
    return res.status(400).json({
      message: "Error",
      status: false,
    });
  }
});
// Join to survival

// Check Inventory
app.post("/check-inventory", (req, res) => {
  try {
    const inventory = bot.inventory.items();
    const result = inventory.map((item) => ({
      name: item.name,
      displayName: item.displayName,
      stackSize: item.stackSize,
      slot: item.slot,
    }));

    // console.log(result);
    return res.status(200).json({
      message: "Check Inven",
      status: true,
      datas: result,
    });
  } catch (error) {
    console.log(err);
    return res.status(400).json({
      message: "Error",
      status: false,
    });
  }
});
// Check Inventory

// Hold Item
app.post("/hold-item", async (req, res) => {
  const { name } = req.body;
  try {
    await bot.equip(bot.registry.itemsByName[name].id, "hand");
    return res.status(200).json({
      message: "Hold Item",
      status: true,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      message: "Error",
      status: false,
    });
  }
});
// Hold Item

// Hold Item
app.post("/drop-item", async (req, res) => {
  const { name, count } = req.body;
  try {
    bot.toss(bot.registry.itemsByName[name].id, null, count);
    return res.status(200).json({
      message: "Drop Item",
      status: true,
    });
  } catch (err) {
    console.log(err);
    return res.status(400).json({
      message: "Error",
      status: false,
    });
  }
});
// Hold Item
