import { MapManager } from './mapManager';
import { ClientEntity } from './clientEntity';
import { EntityManager } from './entityManager';

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

socket.emit('newpl');

setInterval(function() {
  socket.emit('movement', movement);
}, 1000 / 60);

const tileSheetImg = new Image();
tileSheetImg.src = "https://opengameart.org/sites/default/files/DungeonCrawl_ProjectUtumnoTileset.png";

const mapCanvas = <HTMLCanvasElement> document.getElementById('cv_maplayer');
const entityCanvas = <HTMLCanvasElement> document.getElementById('cv_entitylayer');
var mapManager: MapManager = new MapManager(tileSheetImg, mapCanvas, 800, 600);
var entityManager: EntityManager = new EntityManager(tileSheetImg, entityCanvas, 800, 600);

// Receive map data from server
socket.on('mapdata', function(mapdata: any) {
  mapManager.mapTiles = mapdata["tiles"];
  mapManager.drawScene(entityManager.mainPlayer.posX, entityManager.mainPlayer.posY);
});

// Change entity tile
socket.on('setentitytile', function(data: any) {
  entityManager.setEntityTile(data.id, data.tile);
});

// Creates an entity
socket.on('newentity', function(data: any) {
  entityManager.newEntity(data);
});

// Set an entity's data
socket.on('setentitydata', function(data: any) {
  entityManager.setEntityData(data.id, data.entData);
});

// Moves an entity, id -1 is current player
socket.on('mventity', function(data: any) {
  entityManager.moveEntity(data.id, data.x, data.y);
  if (data.id === -1) {
    mapManager.drawScene(entityManager.mainPlayer.posX, entityManager.mainPlayer.posY);
  }
});

// Player disconnection - remove its entity
socket.on('playerDisconnect', function(data: any) {
  entityManager.removeEntity(data.id);
});