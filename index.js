const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const mineflayer = require("mineflayer");
const {
  pathfinder,
  goals: { GoalGetToBlock },
} = require("mineflayer-pathfinder");
const Movements = require("mineflayer-pathfinder").Movements;
const { app: appElectron, BrowserWindow } = require("electron");
const autofarm = require("./command/autofarm");
const basiccommand = require("./command/basic");
const commandbasic = require("./command/pathfinder");
const utils = require("./utils/utils");
let portServer = 3005;
let bot = null;
let server_address_eiei = "";
let username_eiei = "";

server.once("error", (err) => {
  if (err.code === "EADDRINUSE") {
    portServer++;
  }
});

server.listen(portServer, () => {
  console.log(`listening on *:${portServer}`);
});

app.use(express.json());
app.use(express.static("public"));

appElectron.on("ready", () => {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: true, // ปิดแถบเรื่อง
    autoHideMenuBar: true, // ซ่อนเมนู
  });

  // โหลดหน้าเว็บหลักของคุณ
  mainWindow.loadURL(`http://localhost:${portServer}`);
});

// CreateBot
app.post("/create-bot", async (req, res) => {
  try {
    const { server_address, username } = req.body;

    if (server_address == "") {
      return res.status(400).json({
        message: "server_address_is_required",
        status: false,
      });
    }

    if (username == "") {
      return res.status(400).json({
        message: "username_is_required",
        status: false,
      });
    }

    server_address_eiei = server_address;
    username_eiei = username;
    bot = mineflayer.createBot({
      host: server_address_eiei,
      username: username_eiei,
      // port: process.env.PORT_SERVER_MC || "", // เปิดถ้ามี port
      auth: "offline", // microsoft || offline\
      version: "1.20",
    });

    io.emit("chat-bot", "สร้างบอทสำเร็จ");

    bot.loadPlugin(pathfinder);
    bot.loadPlugin(require("mineflayer-autoclicker"));
    bot.setMaxListeners(20);

    bot.on("end", (message) => {
      io.emit("chat-error", message);
    });

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

    // Search ResourcePack
    bot.on("resourcePack", async () => {
      try {
        await bot.acceptResourcePack();
        console.log("Resource pack accepted");
      } catch (error) {
        console.log("Resource pack rejected");
      }
    });
    // Search ResourcePack

    // Drop item

    if (bot !== null) {
      setInterval(() => {
        checkAndThrowItems("bamboo", 512);
        checkAndThrowItems("sugar_cane", 512);
      }, 5000); // delay 5 sec
    }

    // Drop item

    // AutoEat
    // bot.once("spawn", () => {
    //   bot.autoEat.options = {
    //     priority: "foodPoints",
    //     startAt: 14,
    //     bannedFood: [],
    //   };
    // });
    // bot.on("autoeat_started", () => {
    //   console.log("Auto Eat started!");
    // });

    // bot.on("autoeat_stopped", () => {
    //   console.log("Auto Eat stopped!");
    // });
    // AutoEat

    // Search Window
    bot.on("windowOpen", async (window) => {
      if (window.type === "minecraft:generic_9x6") {
        console.log("Inventory 9x6 opened");
        for (let i = 0; i < window.slots.length; i++) {
          const slot = window.slots[i];
          io.emit("window-opened", slot);
          // if (slot) {
          //   // console.log(`Slot ${i}: ${slot.name}, Count: ${slot.count}`);
          //   if (slot.nbt) {
          //     // console.log("NBT Data:", JSON.stringify(slot.nbt, null, 2));
          //     io.emit("window-opened", slot.nbt);
          //   }
          // }
        }
      }
    });
    // Search Window

    return res.status(200).json({
      message: "Create Bot Success",
    });
  } catch (error) {
    console.log("CreateBot", error);
    return res.status(400).json({
      message: "Error",
      status: false,
    });
  }
});
// CreateBot

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
          await new Promise((resolve) => setTimeout(resolve, 100)); // delay 100 ms
        }
        return io.emit("chat-bot", `โยน ${itemName} จำนวน ${amount} เสร็จสิ้น`);
      }

      processItems();
    }
  } catch (error) {
    return console.log("checkAndThrowItems", error);
  }
};
const countItemsByName = async (inventory, itemName) => {
  const itemsWithMatchingName = await inventory
    .items()
    .filter((itemStack) => itemStack.name === itemName);
  const itemCount = await itemsWithMatchingName.reduce(
    (acc, itemStack) => acc + itemStack.count,
    0
  );
  return itemCount;
};
// Drop Item Auto

// Sent data to client
app.post("/get-data", (req, res) => {
  try {
    if (bot === null) {
      return res.status(400).json({
        message: "Data From Server",
        status: false,
      });
    } else {
      if (username_eiei == "" || server_address_eiei == "") {
        return res.status(400).json({
          message: "Error",
          status: false,
        });
      }

      return res.status(200).json({
        message: "Data From Server",
        status: true,
        username: username_eiei,
        serveraddress: server_address_eiei,
      });
    }
  } catch (error) {
    console.log("Drop Item Auto", error);
    return res.status(400).json({
      message: "Error",
      status: false,
    });
  }
});
// Sent data to client

// Logout
app.post("/logout", (req, res) => {
  try {
    bot.quit();

    bot = null;
    username_eiei = "";
    server_address_eiei = "";

    return res.status(200).json({
      message: "Logut",
      status: true,
    });
  } catch (error) {
    console.log("Logut", error);
    return res.status(400).json({
      message: "Error",
      status: false,
    });
  }
});
// Logout

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
    console.log("FarmPumpkin", err);
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
    console.log("FarmWheat", err);
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
    console.log("Command to bot", err);
    return res.status(400).json({
      message: "Error",
      status: false,
    });
  }
});
// Command to bot

// Command with loop
let isCommandLoopEnable = false;
let commandIntervalTime = false;
app.post("/loop-command", (req, res) => {
  try {
    const { message, loop_time } = req.body;
    if (isCommandLoopEnable !== true) {
      isCommandLoopEnable = true;
      commandIntervalTime = setInterval(() => {
        basiccommand.CommandTodo(bot, message);
      }, loop_time * 1000);
    } else {
      isCommandLoopEnable = false;
      clearInterval(commandIntervalTime);
    }

    if (message.includes("/")) {
      io.emit(
        "chat-bot",
        `บอทใช้คำสั่ง : ${message} เวลาในการลูปทุกๆ ${loop_time} วินาที`
      );
    } else {
      io.emit(
        "chat-bot",
        `บอทพิมพ์ : ${message} เวลาในการลูปทุกๆ ${loop_time} วินาที`
      );
    }
    return res.status(200).json({
      message: "Command Loop",
      status: true,
    });
  } catch (error) {
    console.log("Command with loop", err);
    return res.status(400).json({
      message: "Error",
      status: false,
    });
  }
});
// Command with loop

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
    console.log("Position TO GO", error);
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
    console.log("Position-user", error);
    return res.status(400).json({
      message: "Error",
      status: false,
    });
  }
});
// Position-user

// Face to x z
app.post("/send-face-pos", (req, res) => {
  try {
    const { pos_yaw, pos_pitch } = req.body;

    // const currentYaw = bot.entity.yaw;
    // const currentPitch = bot.entity.pitch;

    // console.log(pos_yaw);
    // console.log(pos_pitch);
    bot.look(pos_yaw, pos_pitch, false);

    io.emit("chat-bot", `บอทหันหน้าไป: Yaw ${pos_yaw} Pitch ${pos_pitch}`);
    return res.status(200).json({
      message: "Face Position",
      status: true,
    });
  } catch (error) {
    console.log("Face to x z", error);
    return res.status(400).json({
      message: "Error",
      status: false,
    });
  }
});
// Face to x z

// AutoLeftClick
let isAutoLeftClick = false;
app.post("/autoclick-left", (req, res) => {
  try {
    const { delay } = req.body;
    if (isAutoLeftClick !== true) {
      isAutoLeftClick = true;
      bot.autoclicker.options = {
        max_distance: 3.5, // Max distance to hit entities (Default: 3.5)
        swing_through: ["experience_orb"], // Hit through entities (Default: ['experience_orb'])
        blacklist: ["player"], // Do not hit certain entities (Default: ['player'])
        stop_on_window: true, // Stop if a window is opened (Default: true)
        always_swing: true, // Always swing, even if there is no entity (Default: true)
        delay: delay,
      };
      bot.autoclicker.start();
    } else {
      isAutoLeftClick = false;
      bot.autoclicker.stop();
    }

    io.emit("chat-bot", `บอทเปิด AutoClcik : Delay ${delay} มิลลิวินาที`);
    return res.status(200).json({
      message: "Face Position",
      status: true,
    });
  } catch (error) {
    console.log("AutoLeftClick", error);
    return res.status(400).json({
      message: "Error",
      status: false,
    });
  }
});
// AutoLeftClick

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
    console.log("Join to survival", error);
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
    console.log("Check Inventory", error);
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
  } catch (error) {
    console.log("Hold Item", error);
    return res.status(400).json({
      message: "Error",
      status: false,
    });
  }
});
// Hold Item

// Hold Item And Right Click
app.post("/hold-item-right-click", async (req, res) => {
  const { name } = req.body;
  try {
    await bot.equip(bot.registry.itemsByName[name].id, "hand");
    await bot.activateItem();
    io.emit("chat-bot", `บอทคลิกขวาที่ไอเทม ${name}`);
    return res.status(200).json({
      message: "Hold Item",
      status: true,
    });
  } catch (error) {
    console.log("Hold Item And Right Click", error);
    return res.status(400).json({
      message: "Error",
      status: false,
    });
  }
});
// Hold Item And Right Click

// Drop Item
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
    console.log("Drop Item", err);
    return res.status(400).json({
      message: "Error",
      status: false,
    });
  }
});
// Drop Item

// Watch Item And break
app.post("/watch-item-and-break", async (req, res) => {
  const { name } = req.body;
  const defaultMove = new Movements(bot);
  try {
    const ids = [bot.registry.blocksByName[name].id];

    while (true) {
      const targetBlock = bot.findBlock({
        matching: ids,
        maxDistance: 3,
      });
      await bot.pathfinder.setMovements(defaultMove);
      await bot.pathfinder.setGoal(
        new GoalGetToBlock(
          targetBlock.position.x,
          targetBlock.position.y,
          targetBlock.position.z
        )
      );

      let min = 100;
      let max = 250;

      let randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

      await utils.TimeSleep(randomNumber);

      if (targetBlock) {
        const targetPosition = targetBlock.position;
        await bot.lookAt(targetPosition);
        await utils.TimeSleep(200);
        await bot.dig(targetBlock);
      } else {
        break;
      }
    }

    io.emit("chat-bot", `บอทกำลังทุบบล็อค ${name}`);
    return res.status(200).json({
      message: "Watch Item And break",
      status: true,
    });
  } catch (err) {
    console.log("Watch Item And break", err);
    return res.status(400).json({
      message: "Error",
      status: false,
    });
  }
});
// Watch Item And break

// Click To Slot
app.post("/click-slot", async (req, res) => {
  const { slot } = req.body;
  try {
    console.log(`clicked ${slot}`);
    await bot.clickWindow(slot, 0, 0);
    io.emit("chat-bot", `บอทคลิกช่องที่ ${slot}`);
    return res.status(200).json({
      message: "Click To Slot",
      status: true,
    });
  } catch (err) {
    console.log("Click To Slot", err);
    return res.status(400).json({
      message: "Error",
      status: false,
    });
  }
});
// Click To Slot

// setControlState
app.post("/control-state", async (req, res) => {
  const { control } = req.body;
  try {
    console.log(`Bot is running ${control}`);
    await bot.setControlState(control, true);
    io.emit("chat-bot", `บอทเดินค้างด้วยทิศทาง ${control}`);
    return res.status(200).json({
      message: "setControlState",
      status: true,
    });
  } catch (err) {
    console.log("setControlState", err);
    return res.status(400).json({
      message: "Error",
      status: false,
    });
  }
});
// setControlState

// clearStateControl
app.post("/control-clear", async (req, res) => {
  try {
    console.log(`Clear State Control`);
    await bot.clearControlStates();
    io.emit("chat-bot", `บอทถูกสั่งให้หยุดเดิน`);
    return res.status(200).json({
      message: "clearStateControl",
      status: true,
    });
  } catch (err) {
    console.log("clearStateControl", err);
    return res.status(400).json({
      message: "Error",
      status: false,
    });
  }
});
// clearStateControl
