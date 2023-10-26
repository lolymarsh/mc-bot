const {
  Movements,
  goals: { GoalNear },
} = require("mineflayer-pathfinder");

let FarmPumpkininterval;
const FarmPumpkin = (bot, enable) => {
  if (enable) {
    FarmPumpkininterval = setInterval(async () => {
      await bot.waitForChunksToLoad();
      const name = "pumpkin";
      const ids = [bot.registry.blocksByName[name].id];

      const startTime = performance.now();
      const blocks = bot.findBlocks({
        matching: ids,
        maxDistance: 10,
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

      bot.chat(`I found ${blocks.length} ${name} blocks in ${time} ms`);
    }, 10000);
  } else {
    clearInterval(FarmPumpkininterval);
  }
};

module.exports = { FarmPumpkin };
