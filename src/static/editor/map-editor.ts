import { EditorRenderer } from "./editorRenderer";
import { EditorMap } from "./editorMap";
import { dngnTiles } from "./../../consts/dngnTiles";
import { Tile } from "./../../tile";

const mapCanvas = <HTMLCanvasElement> document.getElementById("cv_maplayer");
var renderer = new EditorRenderer(mapCanvas, 800, 600);
var mainMap = new EditorMap();

var cameraSpeed = 20;

// Map loader
document.getElementById('inpFile').addEventListener('change', loadMapFile, false);
function loadMapFile(evt: any) {
    var files = evt.target.files;
    var file = files[0];
    var reader = new FileReader();
    reader.onload = function(event: any) {
        var mapData = event.target.result;
        mainMap.loadFromJSON(mapData);
        renderer.map = mainMap;
        renderer.drawScene();
    }
    reader.readAsText(file);
}

// Document key presses
var keysHeld: any = {
    up: false,
    right: false,
    down: false,
    left: false,
    ctrl: false,
    shift: false,
};
document.addEventListener('keydown', function(event) {
    switch (event.keyCode) {
        case 37: // left arrow
        case 65: // a key
        keysHeld.left = true;
        break;
        case 38: // up arrow
        case 87: // w key
        keysHeld.up = true;
        break;
        case 39: // right arrow
        case 68: // d key
        keysHeld.right = true;
        break;
        case 40: // down arrow
        case 83: // s key
        keysHeld.down = true;
        break;
        case 16: // shift (TEST - flood fill)
        keysHeld.shift = true;
        break;
        case 17: // ctrl (pick tile)
        keysHeld.ctrl = true;
        break;
    }
});
document.addEventListener('keyup', function(event) {
    switch (event.keyCode) {
        case 37: // left arrow
        case 65: // a key
        keysHeld.left = false;
        break;
        case 38: // up arrow
        case 87: // w key
        keysHeld.up = false;
        break;
        case 39: // right arrow
        case 68: // d key
        keysHeld.right = false;
        break;
        case 40: // down arrow
        case 83: // s key
        keysHeld.down = false;
        break;
        case 16: // shift (TEST - flood fill)
        keysHeld.shift = false;
        break;
        case 17: // ctrl (pick tile)
        keysHeld.ctrl = false;
        break;
    }
});

setInterval(function() {
    var moved = keysHeld.up || keysHeld.down || keysHeld.left || keysHeld.right;
    if (moved) {
        if (keysHeld.up) {
            renderer.cameraY += cameraSpeed;
        } else if (keysHeld.down) {
            renderer.cameraY -= cameraSpeed;
        }
        if (keysHeld.left) {
            renderer.cameraX += cameraSpeed;
        } else if (keysHeld.right) {
            renderer.cameraX -= cameraSpeed;
        }
    }
}, 20);

// Tile palette
var selectedTile: string = null;
// Tile selection
function selectTile(tileID: string) {
    // De-select previous tile image
    var selTileImg = <HTMLImageElement> document.getElementById(selectedTile);
    if (selTileImg) {
        selTileImg.style.backgroundColor = "transparent";
    }

    selectedTile = tileID;
    // Select new tile image
    selTileImg = <HTMLImageElement> document.getElementById(selectedTile);
    if (selTileImg) {
        selTileImg.style.backgroundColor = "#2e9afe";
        // Set preview
        var previewImg = <HTMLImageElement> document.getElementById('tile-preview-img');
        previewImg.src = selTileImg.src;
    }
}

var tilePaletteDiv = <HTMLDivElement> document.getElementById("tile-palette-div");
for (var tile in dngnTiles) {
    // Palette tile images creation
    var tileImg: HTMLImageElement = new Image();
    tileImg.setAttribute('tileID', tile);
    tileImg.className = "palette-tile";
    tileImg.id = tile;
    tileImg.src = "assets/sprites/" + dngnTiles[tile];

    // Set selected tile on click
    tileImg.onclick = function(obj) {
        var targetImg = <HTMLImageElement>obj.srcElement;
        var newTile = targetImg.id;
        if (newTile) {
            selectTile(newTile);
        }
    }

    tilePaletteDiv.appendChild(tileImg);
}

// Canvas clicking
var mouseDown = 0;
document.body.onmousedown = function() { 
  mouseDown = 1;
}
document.body.onmouseup = function() {
  mouseDown = 0;
}
// Click and hold functionalities
mapCanvas.addEventListener('mousedown', canvasClick, false);
mapCanvas.addEventListener('mousemove', canvasClick, false);

var mouseLastTileX = 0;
var mouseLastTileY = 0;
function canvasClick(event: any): void {
    if (!mouseDown && event.type != "mousedown") return;
    
    const cvRect = mapCanvas.getBoundingClientRect();
    var clickX = event.clientX - cvRect.left - renderer.cameraX;
    var clickY = event.clientY - cvRect.top - renderer.cameraY;

    var tileX = Math.floor(clickX / 32);
    var tileY = Math.floor(clickY / 32);

    if (keysHeld.ctrl) {
        // Pick tile
        var pickedTile = mainMap.getTileAt(tileX, tileY);
        if (pickedTile) {
            selectTile(pickedTile.tileID);
        }
    } else {
        // Replace tile with selected
        // Return if mouse didn't move
        if (tileX == mouseLastTileX && tileY == mouseLastTileY) {
            return;
        }
        mouseLastTileX = tileX;
        mouseLastTileY = tileY;

        if (mainMap.loaded) {
            var newTile = new Tile(tileX, tileY, selectedTile);
            if (keysHeld.shift) {
                // TEST - flood fill
                mainMap.floodFillAt(tileX, tileY, newTile);
            } else {
                mainMap.replaceTile(tileX, tileY, newTile);
            }
            renderer.drawScene();
        }
    }
};