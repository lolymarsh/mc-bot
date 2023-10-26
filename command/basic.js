const {
  Movements,
  goals: { GoalNear },
} = require("mineflayer-pathfinder");

const CommandTodo = (bot, message) => {
  bot.chat(message);
};

const PositionToWalk = (bot, pos) => {
  const defaultMove = new Movements(bot);
  bot.pathfinder.setMovements(defaultMove);
  bot.pathfinder.setGoal(new GoalNear(pos.x_pos, pos.y_pos, pos.z_pos));
};

module.exports = { CommandTodo, PositionToWalk };
