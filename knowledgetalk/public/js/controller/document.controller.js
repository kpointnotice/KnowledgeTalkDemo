const fileShareBtn = document.getElementById('file-share-btn');
const target = document.querySelector('#imgList');
const fileInput = document.getElementById('file-input');

document.addEventListener("DOMContentLoaded", function () {

    fileShareBtn.addEventListener('click', () => {
        fileInput.value = '';
        fileInput.click();
    });

    fileInput.addEventListener("change", () => {

        let sendDataSessionReserve = {
            eventOp: "SessionReserve",
            reqNo: commonService.getReqNo(),
            userId: JSON.parse(sessionStorage.getItem("userInfo")).userId,
            reqDate: commonService.getReqDate(),
            roomId: sessionStorage.getItem("roomId")
        };

        commonService.sendSocketMessage(sendDataSessionReserve);

        let sdd = document.querySelector('.canvas-wrap');
        sdd.style.width = "calc(100% - 120px)"
    });

});