require("dotenv").config();
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
const { Vec3 } = require("vec3");

const autofarm = require("./command/autofarm");
const basiccommand = require("./command/basic");
const commandbasic = require("./command/pathfinder");

server.listen(3000, () => {
  console.log("listening on *:3000");
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
      // port: process.env.PORT_SERVER || "",
      auth: "offline",
    });

    bot.on("error", (err) => console.log(err));
    bot.on("end", createBot);
    bot.loadPlugin(pathfinder);

    return bot;
  } catch (error) {
    console.log(error);
    return;
  }
};

bot = createBot();

bot.once("resourcePack", () => {
  console.log("Resource pack accepted.");
  bot.acceptResourcePack();
});

bot.on("messagestr", (message) => {
  console.log(message);
  io.emit("chat-message", message);
});
bot.on("kicked", console.log);
bot.on("error", console.log);

// FarmPumpkin
let isFarmPumpkinEnabled = false;
app.post("/farm-pumpkin", (req, res) => {
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
});
// FarmPumpkin

// FarmWheat
let isFarmWheatEnabled = false;
app.post("/farm-wheat", (req, res) => {
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
});

function blockToSow() {
  return bot.findBlock({
    point: bot.entity.position,
    matching: bot.registry.blocksByName.farmland.id,
    maxDistance: 6,
    useExtraInfo: (block) => {
      const blockAbove = bot.blockAt(block.position.offset(0, 1, 0));
      return !blockAbove || blockAbove.type === 0;
    },
  });
}

function blockToHarvest() {
  return bot.findBlock({
    point: bot.entity.position,
    maxDistance: 6,
    matching: (block) => {
      return (
        block &&
        block.type === bot.registry.blocksByName.wheat.id &&
        block.metadata === 7
      );
    },
  });
}

async function loop() {
  try {
    while (1) {
      const toHarvest = blockToHarvest();
      if (toHarvest) {
        await bot.dig(toHarvest);
      } else {
        break;
      }
    }
    while (1) {
      const toSow = blockToSow();
      if (toSow) {
        await bot.equip(bot.registry.itemsByName.wheat_seeds.id, "hand");
        await bot.placeBlock(toSow, new Vec3(0, 1, 0));
      } else {
        break;
      }
    }
  } catch (e) {
    console.log(e);
  }

  // No block to harvest or sow. Postpone next loop a bit
  setTimeout(loop, 5000);
}

// FarmWheat

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
    console.log(error);
  }
});
// Position-user

// Join to survival
app.post("/amory-join", (req, res) => {
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
});
// Join to survival

// Check Inventory
app.post("/check-inventory", (req, res) => {
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
    return res.status(200).json({
      message: "Hold Item",
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
    return res.status(200).json({
      message: "Drop Item",
      status: false,
    });
  }
});
// Hold Item
