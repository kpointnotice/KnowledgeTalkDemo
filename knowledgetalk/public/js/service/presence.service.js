function PresenceService() {
  this.toastMsg;
  this.quitMsg;
}

PresenceService.prototype.receive = function(data) {
  let attendant_list = document.querySelectorAll(".attendant-box > a");
  if (data.action === "reject") {
    if (!inMeeting) {
      return;
    }
    exceptionService.respCount++;
    if (exceptionService.respCount === exceptionService.targetLength) {
      exceptionService.clearExitTimer();
    }
    if (data.userCount <= 1) {
      commonService.messageBox("회의 거절", presenseRejectAllMsg);
      let sendData = {
        eventOp: "ExitRoom",
        reqNo: commonService.getReqNo(),
        userId: JSON.parse(sessionStorage.getItem("userInfo")).userId,
        userName: JSON.parse(sessionStorage.getItem("userInfo")).userName,
        reqDate: commonService.getReqDate(),
        roomId: sessionStorage.getItem("roomId")
      };
      commonService.sendSocketMessage(sendData);
      videoService.videoReset();
    } else {
      $.notify(data.userId + presenseRejectMsg, {
        style: "quit",
        position: "right bottom"
      });
    }
  } else if (data.action === "end") {
    if (!inMeeting) {
      return;
    }

    switch (commonService.isPopup) {
      case "Invite":
      case "MeetingList":
      case "Join":
      case "Setting":
      case "Login":
      case "Signup":
      case "FriendList":
      case "InviteList":
      case "InfoEdit":
      case "inviteMessageBox":
      case "confirmBox":
        commonService.closePopup(commonService.isPopup);
        break;
      default:
        break;
    }
    commonService.messageBox("회의 종료", presenseCloseMsg);
    sessionStorage.removeItem("roomId");
    documentService.EndFileShareRes();
    let videoBox = document.getElementById("VideoBox");
    if (videoBox.classList.contains("isDocument")) {
      videoBox.classList.remove("isDocument");
    }
    fileing = false;
    commonService.isDocument = false;
    if (s_stream) {
      s_stream.getVideoTracks()[0].stop();
      s_stream = null;
    }

    // $.notify(data.userId + presenseJoinMsg, { className: "info", position: "right bottom"} );
    
    // for (let i=0; i<attendant_list.length; i++) {
    //     if (attendant_list[i].getAttribute("data-tooltip") === data.userId) {
    //         return;
    //     }
    // }
    // let attendant_box = document.querySelector(".attendant-box");
    // attendant_box.innerHTML += `<a class="tooltipped" data-position="left" data-tooltip="${data.userId}"><i class="material-icons">person</i></a>`;

    // let elems         = document.querySelectorAll('.tooltipped');
    // let instances     = M.Tooltip.init(elems);
    if (screenStream) {
      screenStream.getVideoTracks()[0].stop();
      screenStream = null;
    }

    document.querySelector(".loader").style.display = "none";
    if (sessionStorage.getItem("useMediaSvr") === "N") {
      singleConferencePeer.close();
    }
    videoService.videoReset();
  } else if (data.action === "exit") {
    if (!inMeeting) {
      return;
    }
    if (data.userCount <= 1) {
      //message -> string.js
      commonService.messageBox("exit", data.userId + presenseExitAllMsg);

      /**
       * 모든 사람이 퇴실 한 경우 회의를 종료하게 되므로 ExitRoom 메세지를 Signal server로 전송 한 후 video를 reset 한다.
       */
      sessionStorage.removeItem("maker");
      let sendData = {
        eventOp: "ExitRoom",
        reqNo: commonService.getReqNo(),
        userId: JSON.parse(sessionStorage.getItem("userInfo")).userId,
        userName: JSON.parse(sessionStorage.getItem("userInfo")).userName,
        reqDate: commonService.getReqDate(),
        roomId: sessionStorage.getItem("roomId")
      };
      commonService.sendSocketMessage(sendData);

      if (s_stream) {
        s_stream.getVideoTracks()[0].stop();
        s_stream = null;
      }

      if (screenStream) {
        screenStream.getVideoTracks()[0].stop();
        screenStream = null;
      }

      let type = "SS_UI_CANCEL";
      let text = "cancel";
      window.postMessage(
        {
          type,
          text
        },
        "*"
      );
      document.querySelector(".loader").style.display = "none";

      /**
       * videoReset 함수 내부에 1:1, N:N pearConnection을 닫는 로직이 있어 별도로 선언 할 필요가 없다.
       * 화면 공유에 대한 pearConnection은 화면 공유자는 eventOp로 ScreenShareConferenceEnd 를 받을 경우 닫게 되고
       * 피 공유자는 eventOp로 ScreenSharConferenceEndSvr 을 받을 경우 닫히게 되어 별도 선언이 필요치 않다.
       *
       * 추가 로직이 필요할 것으로 예상 -  videoReset 함수에 N:N 화면공유의 경우 화면공유 중지 eventOp와 sessionReserveEnd eventOp가 없다.
       *                                현재는 여기저기 분산되어서 해결되고 있으나 하나의 함수에서 하기 위해서는 videoReset 함수에 추가하는 방법도 고려해 볼 만 할것으로 예상된다.
       *                                그러나 videoReset 함수에 통합할 경우 전반적 로직 수정이 불가피 하다.
       */
      videoService.videoReset();
    } else {
      //message -> string.js
      $.notify(data.userId + presenseExitMsg, {
        style: "quit",
        position: "right bottom"
      });
      document.getElementById("multiVideo-"+data.userId.trim()).parentElement.remove();

      for (let i = 0; i < attendant_list.length; i++) {
        if (attendant_list[i].getAttribute("data-tooltip") === data.userId) {
          attendant_list[i].remove();
        }
      }

      let multiVideoBox = document.querySelector("#VIDEOONETOMANY");
      if (data.userCount <= 4) {
        videoTagClassName = "video-twobytwo";
      } else if (data.userCount > 4 && data.userCount <= 9) {
        videoTagClassName = "video-threebythree";
      } else if (data.userCount > 9) {
        videoTagClassName = "video-fourbyfour";
      }
      multiVideoBox.classList = videoTagClassName;
    }
  } else if (data.action === "join") {
    if (!inMeeting) {
      return;
    }
    exceptionService.respCount++;
    if (exceptionService.respCount === exceptionService.targetLength) {
      exceptionService.clearExitTimer();
    }
  } else if (data.action === "record") {
    let RecordInfo = document.getElementById("RecordInfo");
    if (RecordInfo.style.display === "none") {
        let recording = document.getElementById("Recording");
        recording.style.display = "";

        let toastMsg = document.getElementById("recordToast");
        clearTimeout(presenceService.toastMsg);
        toastMsg.className = "toastMsg show";
        presenceService.toastMsg = setTimeout(() => { toastMsg.className = "toastMsg"; }, 3000);
    }
  } else if (data.action === "stop") {
    let RecordInfo = document.getElementById("RecordInfo");
    if (RecordInfo.style.display === "none") {
        let recording = document.getElementById("Recording");
        recording.style.display = "none";

        let toastMsg = document.getElementById("recEndToast");
        clearTimeout(presenceService.toastMsg);
        toastMsg.className = "toastMsg show";
        presenceService.toastMsg = setTimeout(() => { toastMsg.className = "toastMsg"; }, 3000);
    }
  }
};

let presenceService = new PresenceService();
