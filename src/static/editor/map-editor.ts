import { EditorRenderer } from "./editorRenderer";
import { EditorMap } from "./editorMap";
import { dngnTiles } from "./../../consts/dngnTiles";

const mapCanvas = <HTMLCanvasElement> document.getElementById("cv_maplayer");
var renderer = new EditorRenderer(mapCanvas, 800, 600);
var testMap = new EditorMap();

var cameraX = 0;
var cameraY = 0;
var cameraSpeed = 20;

// Map loader
document.getElementById('inpFile').addEventListener('change', loadMapFile, false);
function loadMapFile(evt: any) {
    var files = evt.target.files;
    var file = files[0];
    var reader = new FileReader();
    reader.onload = function(event: any) {
        var mapData = event.target.result;
        testMap.loadFromJSON(mapData);
        renderer.mapTiles = testMap.mapTiles;
        renderer.drawScene(cameraX, cameraY);
    }
    reader.readAsText(file);
}

// Map movement
var movement: any = {
    n: false,
    e: false,
    s: false,
    w: false,
};
document.addEventListener('keydown', function(event) {
    switch (event.keyCode) {
        case 37: // left arrow
        case 65: // a key
        movement.w = true;
        break;
        case 38: // up arrow
        case 87: // w key
        movement.n = true;
        break;
        case 39: // right arrow
        case 68: // d key
        movement.e = true;
        break;
        case 40: // down arrow
        case 83: // s key
        movement.s = true;
        break;
    }
});
document.addEventListener('keyup', function(event) {
    switch (event.keyCode) {
        case 37: // left arrow
        case 65: // a key
        movement.w = false;
        break;
        case 38: // up arrow
        case 87: // w key
        movement.n = false;
        break;
        case 39: // right arrow
        case 68: // d key
        movement.e = false;
        break;
        case 40: // down arrow
        case 83: // s key
        movement.s = false;
        break;
    }
});

setInterval(function() {
    var moved = movement.n || movement.s || movement.e || movement.w;
    if (moved) {
        if (movement.n) {
            cameraY += cameraSpeed;
        } else if (movement.s) {
            cameraY -= cameraSpeed;
        }
        if (movement.w) {
            cameraX += cameraSpeed;
        } else if (movement.e) {
            cameraX -= cameraSpeed;
        }
        renderer.drawScene(cameraX, cameraY);
    }
}, 20);

// Tile palette
var selectedTile = null;

var tilePaletteDiv = <HTMLDivElement> document.getElementById("tile-palette-div");
for (var tile in dngnTiles) {
    // Palette tile images creation
    var tileImg: HTMLImageElement = new Image();
    tileImg.setAttribute('tileID', tile);
    tileImg.className = "palette-tile";
    tileImg.src = "assets/sprites/" + dngnTiles[tile];

    // Set selected tile on click
    tileImg.onclick = function(obj) {
        var targetImg = <HTMLImageElement>obj.srcElement;
        selectedTile = targetImg.getAttribute('tileID');
    }

    tilePaletteDiv.appendChild(tileImg);
}