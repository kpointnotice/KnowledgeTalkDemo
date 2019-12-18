function ScreenShareCanvasService(){}

/**
 * 화면공유 기능의 canvas를 초기화및 display를 none 하는 함수
 */
ScreenShareCanvasService.prototype.displayNoneScreenCanvas= function() {
    let screenCanvas = document.getElementById('ScreenWhiteboard');
    const context = screenCanvas.getContext('2d');
    context.clearRect(0, 0, screenCanvas.width, screenCanvas.height);
    screenCanvas.style.display = 'none';
};

ScreenShareCanvasService.prototype.displayInlineBlockScreenCanvas= function() {
    let screenCanvas = document.getElementById('ScreenWhiteboard');
    screenCanvas.style.display = 'inline-block';
};

let screenShareCanvasService = new ScreenShareCanvasService();