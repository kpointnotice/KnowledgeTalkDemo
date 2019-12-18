let mediaRecorder = null;
let recordStream;
let recChunks = [];

document.addEventListener("DOMContentLoaded", () => {
  let recordBtn = document.getElementById("RecordInfo");
  let recordClose = document.getElementById("RecordVideoClose");
  let recordRetry = document.getElementById("RecordVideoRetry");

  recordBtn.addEventListener("click", recordService.getDisplay);
  
  recordClose.addEventListener("click", () => {
    let recordVideo = document.getElementById("recordVideoSet");
    commonService.closePopup("RecordVideo");
  });

});
