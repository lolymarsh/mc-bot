const {
  Movements,
  goals: { GoalNear },
} = require("mineflayer-pathfinder");

const goToPlayer = async (bot, username) => {
  const RANGE_GOAL = 1;
  const defaultMove = new Movements(bot);

  if (username === bot.username) return;
  const target = bot.players[username]?.entity;
  if (!target) {
    console.log("I don't see you !");
    return;
  }
  const { x: playerX, y: playerY, z: playerZ } = target.position;

  await bot.pathfinder.setMovements(defaultMove);
  await bot.pathfinder.setGoal(
    new GoalNear(playerX, playerY, playerZ, RANGE_GOAL)
  );
};

const goToPos = async (bot) => {
  await bot.waitForChunksToLoad();
  await bot.pathfinder.setGoal(new GoalNear(130, -60, 137));
};

module.exports = { goToPlayer, goToPos };
