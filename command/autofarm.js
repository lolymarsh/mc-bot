const {
  Movements,
  goals: { GoalNear },
} = require("mineflayer-pathfinder");

const itemByName = (nameitem) => {
  const items = bot.inventory.items();
  const result = items.map((item) => ({
    name: item.name,
    displayName: item.displayName,
    stackSize: item.stackSize,
    slot: item.slot,
  }));
  return result.filter((item) => item.name === nameitem)[0];
};

let FarmPumpkininterval;
let FarmWheatinterval;
const FarmPumpkin = (bot, enable, io) => {
  if (enable) {
    FarmPumpkininterval = setInterval(async () => {
      const finditem = itemByName("diamond_axe");
      if (finditem) {
        await bot.equip(bot.registry.itemsByName.diamond_axe.id, "hand");
      } else {
        console.log("ไม่พบขวานเพรช");
      }
      await bot.waitForChunksToLoad();
      const name = "pumpkin";
      const ids = [bot.registry.blocksByName[name].id];

      const startTime = performance.now();
      const blocks = bot.findBlocks({
        matching: ids,
        maxDistance: 20,
        count: 1000,
      });
      const time = (performance.now() - startTime).toFixed(2);

      if (blocks.length > 0) {
        async function processBlocks() {
          for (const block of blocks) {
            await new Promise((resolve) => setTimeout(resolve, 500));
            bot.pathfinder.setGoal(new GoalNear(block.x, block.y, block.z));
          }
        }

        processBlocks();
      }

      if (blocks.length === 0) {
        bot.pathfinder.setGoal(new GoalNear(130, -60, 137));
      }

      io.emit(
        "chat-farm-pumpkin",
        `${blocks.length} ${name} ในเวลา ${time} มิลลิวินาที`
      );

      console.log(`${blocks.length} ${name} ในเวลา ${time} มิลลิวินาที`);
    }, 10000);
  } else {
    clearInterval(FarmPumpkininterval);
  }
};

module.exports = { FarmPumpkin };
