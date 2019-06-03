const mapCanvas = <HTMLCanvasElement> document.getElementById("cv_maplayer");
mapCanvas.width = mapCanvas.clientWidth;
mapCanvas.height = mapCanvas.clientHeight;
const mapCanvasContext = mapCanvas.getContext('2d');

mapCanvasContext.beginPath();
mapCanvasContext.rect(20, 20, 150, 100);
mapCanvasContext.fillStyle = "red";
mapCanvasContext.fill();