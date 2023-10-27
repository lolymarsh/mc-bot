const {
  Movements,
  goals: { GoalNear },
} = require("mineflayer-pathfinder");
const { Vec3 } = require("vec3");

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

// const FarmWheat = (bot, enable, io) => {
//   if (enable) {
//     FarmWheatinterval = setInterval(async () => {
//       await bot.waitForChunksToLoad();
//       const name = "wheat";
//       const ids = [bot.registry.blocksByName[name].id];

//       const startTime = performance.now();
//       const blocks = bot.findBlocks({
//         matching: ids,
//         maxDistance: 6,
//         count: 1000,
//         matching: (block) => {
//           return (
//             block &&
//             block.type === bot.registry.blocksByName.wheat.id &&
//             block.metadata === 7
//           );
//         },
//       });
//       const time = (performance.now() - startTime).toFixed(2);

//       if (blocks.length > 0) {
//         async function processBlocks() {
//           for (const block of blocks) {
//             await new Promise((resolve) => setTimeout(resolve, 500));
//             await bot.pathfinder.setGoal(
//               new GoalNear(block.x, block.y, block.z)
//             );
//           }
//         }

//         await processBlocks();
//       }

//       if (blocks.length === 0) {
//         bot.pathfinder.setGoal(new GoalNear(130, -60, 137));
//       }

//       io.emit(
//         "chat-farm-wheat",
//         `${blocks.length} ${name} ในเวลา ${time} มิลลิวินาที`
//       );

//       console.log(`${blocks.length} ${name} ในเวลา ${time} มิลลิวินาที`);
//     }, 10000);
//   } else {
//     clearInterval(FarmWheatinterval);
//   }
// };

const FarmWheat = (bot, enable, io) => {
  if (enable) {
    FarmWheatinterval = setInterval(async () => {
      try {
        await bot.waitForChunksToLoad();
        const name = "wheat";
        const ids = [bot.registry.blocksByName[name].id];
        const startTime = performance.now();
        const blocks = bot.findBlocks({
          matching: ids,
          maxDistance: 6,
          count: 1000,
          matching: (block) => {
            return (
              block &&
              block.type === bot.registry.blocksByName.wheat.id &&
              block.metadata === 7
            );
          },
        });

        const time = (performance.now() - startTime).toFixed(2);

        if (blocks.length > 0) {
          async function processBlocks() {
            for (const block of blocks) {
              console.log(block);
              await new Promise((resolve) => setTimeout(resolve, 500));
              await bot.pathfinder.setGoal(
                new GoalNear(block.x, block.y, block.z)
              );

              io.emit(
                "chat-farm-wheat",
                `${blocks.length} ${name} ในเวลา ${time} มิลลิวินาที`
              );

              console.log(
                `${blocks.length} ${name} ในเวลา ${time} มิลลิวินาที`
              );

              const toHarvest = await bot.findBlock({
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
              if (toHarvest && bot.canDigBlock(toHarvest)) {
                await bot.dig(toHarvest);
              }

              const toSow = await bot.findBlock({
                point: bot.entity.position,
                matching: bot.registry.blocksByName.farmland.id,
                maxDistance: 6,
                useExtraInfo: (block) => {
                  const blockAbove = bot.blockAt(
                    block.position.offset(0, 1, 0)
                  );
                  return !blockAbove || blockAbove.type === 0;
                },
              });
              if (toSow) {
                await bot.equip(
                  bot.registry.itemsByName.wheat_seeds.id,
                  "hand"
                );
                await bot.placeBlock(toSow, new Vec3(0, 1, 0));
              }
            }
          }

          await processBlocks();
        }

        if (blocks.length === 0) {
          bot.pathfinder.setGoal(new GoalNear(130, -60, 137));
        }
      } catch (error) {
        console.log(error);
      }
    }, 5000);
  } else {
    clearInterval(FarmWheatinterval);
  }
};

module.exports = { FarmPumpkin, FarmWheat };
