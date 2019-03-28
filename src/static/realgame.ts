var socket = io();

// Set tileset up - connect when done loading
var tilesetImg = new Image();
tilesetImg.src = "https://opengameart.org/sites/default/files/DungeonCrawl_ProjectUtumnoTileset.png";

// Update players' states
socket.on('state', function(players: any) {
    context.clearRect(0, 0, 800, 600);
    context.fillStyle = 'green';
    for (var id in players) {
        var player = players[id];
        context.drawImage(tilesetImg, 0, 64, 32, 32, player.x, player.y, 32, 32);
    }
});