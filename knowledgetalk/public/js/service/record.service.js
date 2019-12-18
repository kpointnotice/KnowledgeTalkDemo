function RecordService() {
  this.recordId = null;
  this.videoIndex = 1;
  this.status = "ready";
  this.videoSeekHelper = false;
  this.videoCount = 0;
  this.recUrl = "";
  this.videoId = "";
}

let jsonText;

RecordService.prototype.getDisplay = () => {
  if (!mediaRecorder) {
    navigator.mediaDevices
      .getDisplayMedia({ video: true })
      .then(stream => {
        // let audioResult;
        // let audioContext = new AudioContext();

        // if (sessionStorage.getItem("useMediaSvr") === "N") {
        //   let audioTracks = [
        //     localStream.getAudioTracks()[0],
        //     remoteStream.getAudioTracks()[0]
        //   ];
        //   let audioSources = audioTracks.map(track =>
        //     audioContext.createMediaStreamSource(new MediaStream([track]))
        //   );
        //   let streamDest = audioContext.createMediaStreamDestination();

        //   audioSources.forEach(stream => stream.connect(streamDest));
        //   audioResult = streamDest.stream.getAudioTracks()[0];
        // } else if (sessionStorage.getItem("useMediaSvr") === "Y") {
        //   audioResult = kurentoPeer.getRemoteStream().getAudioTracks()[0];
        // }

        recordStream = stream;
        // recordStream.addTrack(audioResult);

        recordService.start(recordStream);

        recordStream.getVideoTracks()[0].onended = () => {
          recordService.stop();
          document.querySelector("#RecordInfo > span > i").style.color = "";
          recordService.status = "stop";

          let sendData = {
            eventOp: "Record",
            reqNo: commonService.getReqNo(),
            reqDate: commonService.getReqDate(),
            roomId: sessionStorage.getItem("roomId"),
            userId: JSON.parse(sessionStorage.getItem("userInfo")).userId,
            status: "stop"
          };
        
          commonService.sendSocketMessage(sendData);
        }
      })
      .catch(err => {
        console.log(err);
      });
  }
};

RecordService.prototype.start = stream => {
  recordStream = stream;
  document.querySelector("#RecordInfo > span > i").style.color = "red";
  // mediaRecorder = new MediaRecorder(stream, {mimeType : 'video/webm;codecs=h264,pcm'});

  // mediaRecorder.ignoreMutedMedia = true;

  // mediaRecorder.ondataavailable = event => {
  //   if (event.data && event.data.size > 0) {
  //     recChunks.push(event.data);
  //   }
  // };

  // mediaRecorder.onstop = event => {
  //   let blob = new Blob(recChunks);
  //   recordService.upload(blob);
  //   recChunks.length = 0;
  // };

  mediaRecorder = new MediaStreamRecorder(stream);
  mediaRecorder.mimeType = "video/mp4";
  mediaRecorder.ondataavailable = blob => {
    recordService.upload(blob);
  };

  mediaRecorder.start(5*60000);

  let sendData = {
    eventOp: "Record",
    reqNo: commonService.getReqNo(),
    reqDate: commonService.getReqDate(),
    roomId: sessionStorage.getItem("roomId"),
    userId: JSON.parse(sessionStorage.getItem("userInfo")).userId
  };
  sendData.status = recordService.status === "stop" ? "restart" : "start";

  commonService.sendSocketMessage(sendData);
};

RecordService.prototype.stop = () => {
  document.querySelector("#RecordInfo > span > i").style.color = "";
  if (mediaRecorder) {
    mediaRecorder.stop();
  }
  mediaRecorder = null;

  if (recordStream && recordStream.getVideoTracks().length > 0) {
    recordStream.getVideoTracks()[0].stop();
  }
  recordStream = null;
};

RecordService.prototype.upload = blob => {
  if (recordService.recordId) {
    let blobData = new FormData();
    blobData.append("record", blob);

    let request = new XMLHttpRequest();
    let url = `/record/${recordService.recordId}`;
    request.open("POST", url);
    request.send(blobData);
    request.onreadystatechange = () => {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          // console.log(request.responseText);
        } else {
          console.log("request error !");
        }
      }
    };
  } else {
    console.log("record upload error (not recordId)");
  }
};

RecordService.prototype.setRecordVideo = obj => {
  event.preventDefault();

  commonService.setCategory("recordVideo");

  let request = new XMLHttpRequest();
  recordService.recUrl = `/record/${obj.getAttribute("recid")}/`;
  request.open("GET", recordService.recUrl);
  request.send();
  request.onreadystatechange = () => {
    if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
      let videoList = document.getElementById("videoList");

      let resData = JSON.parse(request.response);
      recordService.videoCount = resData.length;
      recordService.videoId = obj.getAttribute("recid");
      let videoString = "";

      for (let i = 1; i <= recordService.videoCount; i++) {
        videoString += `<li id="rec${i}" onclick="recordService.selectedItem(${i})">${i}번 영상</li>`;
      }
      videoList.innerHTML = videoString;

      recordService.selectedItem(1);
    } else {
      let videoList = document.getElementById("videoList");
      videoList.innerHTML = "<li>파일이 존재하지 않습니다</li>";
    }
  };
};

RecordService.prototype.selectedItem = (index) => {
  recordService.videoIndex = index;

  let recVideo = document.getElementById("recordVideoSet");

  let list = document.querySelectorAll("#videoList > li");
  for(let i=0; i<list.length; i++) {
    list[i].style.color = (i+1) == index ? "royalblue" : "";
  }

  recVideo.src = `${recordService.recUrl}${recordService.videoId}.${index}.mp4`;
  recVideo.load();
  recVideo.videoSeekHelper = true;
  recVideo.currentTime = 20000;

  recVideo.onloadeddata = e => {
    recVideo.play();
  }

  recVideo.onended = event => {
    if (recVideo.videoSeekHelper) {
      recVideo.videoSeekHelper = false;
      recVideo.currentTime = 0;
      recVideo.play();
      return 0;
    }
    recordService.videoIndex++;

    if (recordService.videoIndex <= recordService.videoCount) {
      recVideo.src = recordService.recUrl + recordService.videoId + `.${recordService.videoIndex}.mp4`;
      recVideo.load();
      recVideo.videoSeekHelper = true;
      recVideo.currentTime = 20000;
      recordService.selectedItem(recordService.videoIndex);
    } else {
      commonService.messageBox(
        "회의영상",
        "회의 녹화 영상이 종료되었습니다."
      );
    }
  };
}

RecordService.prototype.response = data => {
  if (data.code === "200") {
    console.log("record start ok");
  } else {
    console.log("record start error");
    recordService.stop();
  }
};

let recordService = new RecordService();
