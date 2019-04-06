var socket = io();

var movement = {
    up: false,
    down: false,
    left: false,
    right: false
}
document.addEventListener('keydown', function(event) {
    switch (event.keyCode) {
        case 65: // A
        movement.left = true;
        break;
        case 87: // W
        movement.up = true;
        break;
        case 68: // D
        movement.right = true;
        break;
        case 83: // S
        movement.down = true;
        break;
    }
});
document.addEventListener('keyup', function(event) {
switch (event.keyCode) {
    case 65: // A
    movement.left = false;
    break;
    case 87: // W
    movement.up = false;
    break;
    case 68: // D
    movement.right = false;
    break;
    case 83: // S
    movement.down = false;
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

socket.on('state', function(players: any) {
  context.clearRect(0, 0, 800, 600);
  for (var id in players) {
    var player = players[id];
    context.drawImage(playerImg, (player.tileID % 64) * 32, Math.floor(player.tileID / 64) * 32, 32, 32, player.drawX, player.drawY, 32, 32);
  }
});