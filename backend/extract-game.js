const fs = require("fs");

const data = JSON.parse(
  fs.readFileSync("games-response.json", "utf8")
);

const games = data.games || [];

const game = games.find(
  (item) => item.gameName === "Coin Dash"
);

if (!game) {
  console.log("Coin Dash not found.");
  process.exit(1);
}

const jsFile = game.files.find(
  (file) => file.path === "game.js"
);

if (!jsFile) {
  console.log("game.js not found.");
  process.exit(1);
}

fs.writeFileSync("coin-dash-game.js", jsFile.content);

console.log("Saved Coin Dash JavaScript to coin-dash-game.js");