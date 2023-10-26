const {
  Movements,
  goals: { GoalNear },
} = require("mineflayer-pathfinder");

const goToPlayer = (bot) => {
  const RANGE_GOAL = 1;
  const defaultMove = new Movements(bot);

  bot.on("chat", (username, message) => {
    if (username === bot.username) return;
    if (message !== "come") return;
    const target = bot.players[username]?.entity;
    if (!target) {
      bot.chat("I don't see you !");
      return;
    }
    const { x: playerX, y: playerY, z: playerZ } = target.position;

    bot.pathfinder.setMovements(defaultMove);
    bot.pathfinder.setGoal(new GoalNear(playerX, playerY, playerZ, RANGE_GOAL));
  });
};

const goToPos = async (bot) => {
  await bot.waitForChunksToLoad();
  bot.pathfinder.setGoal(new GoalNear(130, -60, 137));
};

const mineGold = (bot) => {
  bot.chat("EIEI");
};

module.exports = { goToPlayer, mineGold, goToPos };
