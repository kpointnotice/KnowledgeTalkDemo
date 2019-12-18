function SetupService() {}

let previewStream = null;

SetupService.prototype.gotDevices = function(deviceInfos) {
  const audioInputSelect = document.querySelector("#audioSource");
  const audioOutputSelect = document.querySelector("#audioOutput");
  const videoSelect = document.querySelector("#videoSource");
  
  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    const option = document.createElement("option");
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === "audioinput") {
      option.text =
        deviceInfo.label || `microphone ${audioInputSelect.length + 1}`;
      audioInputSelect.appendChild(option);
    } else if (deviceInfo.kind === "audiooutput") {
      option.text =
        deviceInfo.label || `speaker ${audioOutputSelect.length + 1}`;
      audioOutputSelect.appendChild(option);
    } else if (deviceInfo.kind === "videoinput") {
      option.text = deviceInfo.label || `camera ${videoSelect.length + 1}`;
      videoSelect.appendChild(option);
    } else {
      console.log("Some other kind of source/device: ", deviceInfo);
    }
  }
};

SetupService.prototype.optionSelect = function(){
  const audioInputSelect = document.querySelector("#audioSource");
  const audioOutputSelect = document.querySelector("#audioOutput");
  const videoSelect = document.querySelector("#videoSource");
  let videoId = setupService.settingOption.video.deviceId
  let inputId = setupService.settingOption.audio.deviceId

  if(!videoId){
    videoSelect.childNodes[0].selected = true;
  }else{
    for(let i=0; i<videoSelect.childNodes.length; i++){
      if(videoSelect.childNodes[i].value === videoId.exact){
       videoSelect.childNodes[i].selected = true;
      }
    }
  }

  if(!inputId){
    audioInputSelect.childNodes[0].selected = true;
  }else{
    for(let i=0; i<audioInputSelect.childNodes.length; i++){
      if(audioInputSelect.childNodes[i].value === inputId.exact){
        audioInputSelect.childNodes[i].selected = true;
      }
    }
  }

  if(!setupService.audioOutput){
    audioOutputSelect.childNodes[0].selected = true;
  }else{
    for(let i=0; i<audioOutputSelect.childNodes.length; i++){
      if(audioOutputSelect.childNodes[i].value === setupService.audioOutput){
        audioOutputSelect.childNodes[i].selected = true;
      }
    }
  }
}

SetupService.prototype.handleError = function(error) {
  console.log("navigator.getUserMedia error: ", error);
};

SetupService.prototype.setting = function(check) {
  const audioInputSelect = document.querySelector("#audioSource");
  const audioOutputSelect = document.querySelector("#audioOutput");
  const videoSelect = document.querySelector("#videoSource");
  let videoSet = document.querySelectorAll("video");
  let settingOption;
  let audioSource = audioInputSelect.value;
  let videoSource = videoSelect.value;

  
  settingOption = {
        audio: audioSource ? { deviceId: { exact: audioSource } } : false,
        video: videoSource ? { deviceId: { exact: videoSource } } : false
  }
  if (inMeeting) {
    for (let i=0; i<videoSet.length; i++) {
      videoSet[i].setSinkId(audioOutputSelect.value);
    }

    if (sessionStorage.getItem("useMediaSvr") === "N") {
      navigator.mediaDevices.getUserMedia(settingOption).then(stream => {
        previewStream = stream;
        let local = document.getElementById('local');
        local.srcObject = previewStream;
        singleConferencePeer.addStream(previewStream);
    
        singleConferencePeer.createOffer().then(sdp => {
            //생성한 Offer를 local에 저장
            singleConferencePeer.setLocalDescription(new RTCSessionDescription(sdp));
            let sendData = {
                eventOp : "SDP",
                reqNo : commonService.getReqNo(),
                userId : JSON.parse(sessionStorage.getItem("userInfo")).userId,
                reqDate : commonService.getReqDate(),
                sdp : sdp,
                roomId : sessionStorage.getItem("roomId"),
                usage : "cam"
            };
    
            commonService.sendSocketMessage(sendData);
          });
      }).catch(err => console.log(err));
    } else {
      setupBtnDupl = false;  
    }
  }

  if (previewStream) {
    previewStream.getVideoTracks()[0].stop();
    previewStream.getAudioTracks()[0].stop();
  }
  
  let previewVideo = document.querySelector("#previewVideo");
  if (previewVideo) {
    previewVideo.remove();
  }

  setupService.settingOption = settingOption;
  setupService.audioOutput = audioOutputSelect.value;
  commonService.closePopup("Setting");
  setupBtnDupl = false;
  return;
};

SetupService.prototype.preview = () => {
  let previewVideo = document.querySelector("#previewVideo");
  let audioSource = document.querySelector("#audioSource").value;
  let videoSource = document.querySelector("#videoSource").value;
  let settingOption = {
    audio: audioSource ? { deviceId: { exact: audioSource } } : false,
    video: videoSource ? { deviceId: { exact: videoSource } } : false
  }

  navigator.mediaDevices.getUserMedia(settingOption)
    .then(stream => {
        previewVideo.srcObject = stream;
        previewVideo.autoplay = true;
    })
    .catch(err => {
        if (previewVideo) {
            previewVideo.remove();
        }
        console.log(err)
    });
}

SetupService.prototype.settingOption = { video: true, audio: true };
SetupService.prototype.audioOutput = false;


let setupService = new SetupService();

document.addEventListener("DOMContentLoaded", function() {
  navigator.mediaDevices
  .enumerateDevices()
  .then(setupService.gotDevices)
  .catch(setupService.handleError);
});