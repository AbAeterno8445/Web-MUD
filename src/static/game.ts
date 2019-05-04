import { MapManager } from './mapManager';
import { EntityManager } from './entityManager';

var socket = io();

var attack: boolean = false;
var movement: any = {
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
      case 17: // ctrl - attack
      attack = true;
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
  case 17: // ctrl - attack
  attack = false;
  break;
}
});

socket.emit('newpl');

setInterval(function() {
  for (var d in movement) {
    if (movement[d]) {
      if (attack) {
        socket.emit('attack', {dir: d});
      } else {
        socket.emit('movement', {dir: d});
      }
      break;
    }
  }
}, 1000 / 60);

const mapCanvas = <HTMLCanvasElement> document.getElementById('cv_maplayer');
const entityCanvas = <HTMLCanvasElement> document.getElementById('cv_entitylayer');
var mapManager: MapManager = new MapManager(mapCanvas, 800, 600);
var entityManager: EntityManager = new EntityManager(entityCanvas, 800, 600);

// Receive map data from server
socket.on('mapdata', function(mapdata: any) {
  mapManager.mapTiles = mapdata.tiles;
  mapManager.loadTiles(mapdata.tileData);
  mapManager.drawScene(entityManager.mainPlayer);
});

// Change entity tile
socket.on('setentitytile', function(data: any) {
  entityManager.setEntityTile(data.id, data.tile);
  entityManager.drawEntities(mapManager);
});

// Creates an entity
socket.on('newentity', function(data: any) {
  entityManager.newEntity(data);
  entityManager.drawEntities(mapManager);
});

// Set an entity's data
socket.on('setentitydata', function(data: any) {
  entityManager.setEntityData(data.id, data.entData);
  if (data.id === -1) {
    mapManager.drawScene(entityManager.mainPlayer);
  }
  entityManager.drawEntities(mapManager);
});

// Moves an entity, id -1 is current player
socket.on('mventity', function(data: any) {
  entityManager.moveEntity(data.id, data.x, data.y);
  if (data.id === -1) {
    mapManager.drawScene(entityManager.mainPlayer);
    entityManager.drawEntities(mapManager);
  }
});

// Removes an entity
socket.on('delentity', function(data: any) {
  entityManager.removeEntity(data.id);
  entityManager.drawEntities(mapManager);
});