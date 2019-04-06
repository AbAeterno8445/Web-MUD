var socket = io();

var movement = {
    n: false,
    ne: false,
    e: false,
    se: false,
    s: false,
    sw: false,
    w: false,
    nw: false
}
document.addEventListener('keydown', function(event) {
    // Numbers based on numpad
    switch (event.keyCode) {
      case 104: // num 8 - north
      movement.n = true;
      break;
      case 105: // num 9 - northeast
      movement.ne = true;
      break;
      case 102: // num 6 - east
      movement.e = true;
      break;
      case 99: // num 3 - southeast
      movement.se = true;
      break;
      case 98: // num 2 - south
      movement.s = true;
      break;
      case 97: // num 1 - southwest
      movement.sw = true;
      break;
      case 100: // num 4 - west
      movement.w = true;
      break;
      case 103: // num 7 - northwest
      movement.nw = true;
      break;
    }
});
document.addEventListener('keyup', function(event) {
switch (event.keyCode) {
  case 104: // num 8 - north
  movement.n = false;
  break;
  case 105: // num 9 - northeast
  movement.ne = false;
  break;
  case 102: // num 6 - east
  movement.e = false;
  break;
  case 99: // num 3 - southeast
  movement.se = false;
  break;
  case 98: // num 2 - south
  movement.s = false;
  break;
  case 97: // num 1 - southwest
  movement.sw = false;
  break;
  case 100: // num 4 - west
  movement.w = false;
  break;
  case 103: // num 7 - northwest
  movement.nw = false;
  break;
}
});

socket.emit('new player');
setInterval(function() {
  socket.emit('movement', movement);
}, 1000 / 60);

const canvas = <HTMLCanvasElement> document.getElementById('canvas');
canvas.width = 800;
canvas.height = 600;
const context = canvas.getContext('2d');

const playerImg = new Image();
playerImg.src = "https://opengameart.org/sites/default/files/DungeonCrawl_ProjectUtumnoTileset.png";

var map: any = undefined;
socket.on('mapdata', function(mapdata: any) {
  map = mapdata;
});

socket.on('state', function(players: any) {
  context.clearRect(0, 0, 800, 600);
  // Draw map
  if (map) {
    map["tiles"].forEach(function(row: any, i: number) {
      row.forEach(function(tile: any, j: number) {
        context.drawImage(playerImg, (tile._tileID % 64) * 32, Math.floor(tile._tileID / 64) * 32, 32, 32, j * 32, i * 32, 32, 32);
      });
    });
  }
  // Draw players
  for (var id in players) {
    var player = players[id];
    context.drawImage(playerImg, (player.tileID % 64) * 32, Math.floor(player.tileID / 64) * 32, 32, 32, player.drawX, player.drawY, 32, 32);
  }
});