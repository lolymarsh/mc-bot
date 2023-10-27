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

const createBot = () => {
  try {
    const bot = mineflayer.createBot({
      host: process.env.HOST_SERVER,
      username: process.env.BOT_NAME,
      port: process.env.PORT_SERVER_MC || "", // เปิดถ้ามี port
      auth: "offline", // microsoft || offline
    });

    bot.setMaxListeners(20);
    bot.loadPlugin(pathfinder);

    bot.on("end", createBot, () => {
      io.emit("chat-error", message);
    });
    return bot;
  } catch (error) {
    console.log(error);
    return;
  }
};

bot = createBot();

bot.on("messagestr", (message) => {
  console.log(message);
  io.emit("chat-message", message);
});
bot.on("kicked", (message) => {
  console.log(message);
  io.emit("chat-error", message);
});
bot.on("error", (message) => {
  console.log(message);
  io.emit("chat-error", message);
});

bot.on("resourcePack", () => {
  console.log("Resource pack accepted.");
  bot.acceptResourcePack();
});

// Drop Item Auto
setInterval(() => {
  checkAndThrowItems("bamboo", 2176);
  checkAndThrowItems("sugar_cane", 2176);
}, 5000); // delay 15 sec
// Drop Item Auto

const checkAndThrowItems = async (itemName, amount) => {
  try {
    const inventory = bot.inventory;
    // const items = inventory.items();

    // const totalItemCount = await items
    //   .map((itemStack) => itemStack.count)
    //   .reduce((acc, count) => acc + count, 0);

    const itemsWithMatchingName = await inventory
      .items()
      .filter((itemStack) => itemStack.name === itemName);
    const itemCount = await countItemsByName(inventory, itemName);

    // console.log(amount);
    // console.log(itemsWithMatchingName);
    // console.log(totalItemCount);

    // bot.toss(bot.registry.itemsByName[itemName].id, null, count);

    if (itemCount >= amount) {
      io.emit("chat-bot", `กำลังเริ่มโยนไอเทม ${itemName} จำนวน ${amount}`);
      async function processItems() {
        for (let i = 0; i < itemsWithMatchingName.length; i++) {
          bot.toss(bot.registry.itemsByName[itemName].id, null, 64);
          await new Promise((resolve) => setTimeout(resolve, 1000)); // delay 1 sec
        }
      }

      processItems();
    }
  } catch (error) {
    return console.log(error);
  }
};

async function countItemsByName(inventory, itemName) {
  const itemsWithMatchingName = inventory
    .items()
    .filter((itemStack) => itemStack.name === itemName);
  const itemCount = itemsWithMatchingName.reduce(
    (acc, itemStack) => acc + itemStack.count,
    0
  );
  return itemCount;
}

// Drop Item Auto

app.post("/get-data", (req, res) => {
  try {
    return res.status(200).json({
      message: "Data From Server",
      ServerAddress: process.env.HOST_SERVER,
    });
  } catch (error) {
    console.log(error);
    return res.status(400).json({
      message: "Error",
      status: false,
    });
  }
});

// FarmPumpkin
let isFarmPumpkinEnabled = false;
app.post("/farm-pumpkin", (req, res) => {
  try {
    if (isFarmPumpkinEnabled) {
      io.emit("chat-bot-disable", `กำลังใช้ปิดงานออโต้ฟาร์ม Pumpkin`);
      isFarmPumpkinEnabled = false;
      autofarm.FarmPumpkin(bot, isFarmPumpkinEnabled, io);
      return res.status(200).json({
        message: "FarmPumpkin",
        status: isFarmPumpkinEnabled,
      });
    } else {
      io.emit("chat-bot-enable", `กำลังใช้เปิดงานออโต้ฟาร์ม Pumpkin`);
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
      io.emit("chat-bot-disable", `กำลังใช้ปิดงานออโต้ฟาร์ม Wheat`);
      isFarmWheatEnabled = false;
      autofarm.FarmWheat(bot, isFarmWheatEnabled, io);
      // loop();
      return res.status(200).json({
        message: "FarmWheat",
        status: isFarmWheatEnabled,
      });
    } else {
      io.emit("chat-bot-enable", `กำลังใช้เปิดงานออโต้ฟาร์ม Wheat`);
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

    if (message.includes("/")) {
      io.emit("chat-bot", `บอทใช้คำสั่ง : ${message}`);
    } else {
      io.emit("chat-bot", `บอทพิมพ์ : ${message}`);
    }
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

    io.emit(
      "chat-bot",
      `บอทเดินกำลังเดินไปที่: X ${req.body.x_pos} Y ${req.body.y_pos} Z ${req.body.z_pos}`
    );
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

        io.emit("chat-bot", `บอทกำลังเข้าสู่เซิร์ฟ Survival ของ Amorycraft`);
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
    io.emit("chat-bot", `บอทกำลังถือ ${name}`);
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
    io.emit("chat-bot", `บอทโยน ${name} จำนวน ${count}`);
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
