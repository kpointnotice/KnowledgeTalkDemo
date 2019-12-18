function ExceptionService() {
  this.timer;
  this.targetLength;
  this.respCount = 0;
}

ExceptionService.prototype.setExitTimer = sec => {
  let elem = document.querySelector("#TOTimer .bar");
  let textElem = document.querySelector("#TOTimer .stateText");
  let count = 0;
  document.getElementById("TOTimer").style.display = "";

  elem.style.width = "100%";
  textElem.innerHTML = "서버 요청 중입니다. (" + sec + "초)";
  clearInterval(exceptionService.timer);
  exceptionService.timer = setInterval(frame, 1000);

  function frame() {
    if (count >= sec) {
      clearInterval(exceptionService.timer);
      exceptionService.timer = null;
      document.getElementById("TOTimer").style.display = "none";
      commonService.messageBox(
        "네트워크 오류",
        serverNotResMeetingCloseMsg
      );

      let sendData = {
        eventOp: "ExitRoom",
        reqNo: commonService.getReqNo(),
        userId: JSON.parse(sessionStorage.getItem("userInfo")).userId,
        userName: JSON.parse(sessionStorage.getItem("userInfo")).userName,
        reqDate: commonService.getReqDate(),
        roomId: sessionStorage.getItem("roomId")
      };

      commonService.sendSocketMessage(sendData);
    } else {
      count++;
      elem.style.width = (sec - count) * (100 / sec) + "%";
      textElem.innerHTML = "서버 요청 중입니다. (" + (sec - count) + "초)";
    }
  }
};

ExceptionService.prototype.setResponseTimer = (sec, type) => {
  exceptionService.respCount = 0;
  let elem = document.querySelector("#TOTimer .bar");
  let textElem = document.querySelector("#TOTimer .stateText");
  let count = 0;
  document.getElementById("TOTimer").style.display = "";

  elem.style.width = "100%";
  textElem.innerHTML = type === "call" ?
    exceptionService.targetLength +
    "명의 상대방의 응답을 기다리는 중입니다. (" +
    sec +
    "초)" : "방장의 응답을 기다리는 중입니다 (" + sec + "초)";
  clearInterval(exceptionService.timer);
  exceptionService.timer = setInterval(frame, 1000);

  function frame() {
    if (count >= sec) {
      clearInterval(exceptionService.timer);
      exceptionService.timer = null;
      document.getElementById("TOTimer").style.display = "none";
      commonService.messageBox(
        "시간 초과",
          clientNotResMsg
      );
    } else {
      count++;
      elem.style.width = (sec - count) * (100 / sec) + "%";
      textElem.innerHTML = type === "call" ?
        exceptionService.targetLength -
        exceptionService.respCount +
        "명의 상대방의 응답을 기다리는 중입니다. (" +
        (sec - count) +
        "초)" : "방장의 응답을 기다리는 중입니다 (" + (sec - count) + "초)";
    }
  }
};

ExceptionService.prototype.setRequestTimer = sec => {
  let textElem = document.getElementById("InviteCount");
  let count = 0;
  textElem.innerHTML = "(" + sec + "초)";
  clearInterval(exceptionService.timer);
  exceptionService.timer = setInterval(frame, 1000);

  function frame() {
    if (count >= sec) {
      clearInterval(exceptionService.timer);
      exceptionService.timer = null;
      exceptionService.targetLength = 0;
      exceptionService.respCount = 0;
      commonService.closePopup("inviteMessageBox");

      commonService.messageBox(
        "시간 초과",
        resDelayRejectMsg
      );
      responseInviteDupl = false;

      let sendData = {
        eventOp: "Join",
        reqNo: commonService.getReqNo(),
        userId: JSON.parse(sessionStorage.getItem("userInfo")).userId,
        reqDate: commonService.getReqDate(),
        roomId: sessionStorage.getItem("roomId"),
        status: "reject"
      };

      commonService.sendSocketMessage(sendData);
    } else {
      count++;
      textElem.innerHTML = "(" + (sec - count) + "초)";
    }
  }
};

ExceptionService.prototype.setJoinReqTimer = (sec, reqNo) => {
  let textElem = document.getElementById("Count");
  let count = 0;
  textElem.innerHTML = "(" + sec + "초)";
  clearInterval(exceptionService.timer);
  exceptionService.timer = setInterval(frame, 1000);

  function frame() {
    if (count >= sec) {
      clearInterval(exceptionService.timer);
      exceptionService.timer = null;
      exceptionService.targetLength = 0;
      exceptionService.respCount = 0;
      commonService.closePopup("confirmBox");

      commonService.messageBox(
        "시간 초과",
        "응답 시간이 초과되어 자동으로 거절합니다."
      );
      responseInviteDupl = false;

      let sendData = {
        eventOp: "GuestConfirm",
        reqNo,
        code: "200",
        message: "OK",
        resDate: commonService.getReqDate(),
        status: "reject"
      };

      commonService.sendSocketMessage(sendData);
    } else {
      count++;
      textElem.innerHTML = "(" + (sec - count) + "초)";
    }
  }
};

ExceptionService.prototype.setLogoutTimer = sec => {
  let elem = document.querySelector("#TOTimer .bar");
  let textElem = document.querySelector("#TOTimer .stateText");
  let count = 0;
  document.getElementById("TOTimer").style.display = "";

  elem.style.width = "100%";
  textElem.innerHTML = "로그인 중입니다. (" + sec + "초)";
  clearInterval(exceptionService.timer);
  exceptionService.timer = setInterval(frame, 1000);

  function frame() {
    if (count >= sec) {
      clearInterval(exceptionService.timer);
      document.getElementById("TOTimer").style.display = "none";
      commonService.messageBox(
        "네트워크 오류",
        serverProblemRefreshMsg
      );

      setTimeout(() => {
        location.reload();
      }, 5000);
    } else {
      count++;
      elem.style.width = (sec - count) * (100 / sec) + "%";
      textElem.innerHTML = "로그인 중입니다. (" + (sec - count) + "초)";
    }
  }
};

ExceptionService.prototype.roomNotExist = sec => {
  commonService.messageBox("참여 오류", noRoomMsg);
  videoService.videoReset();
};
 
ExceptionService.prototype.clearExitTimer = () => {
  let countElem = document.getElementById("Count");
  countElem.innerHTML = "";
  document.getElementById("TOTimer").style.display = "none";
  clearInterval(exceptionService.timer);
  exceptionService.timer = null;
  exceptionService.targetLength = 0;
  exceptionService.respCount = 0;
};

let exceptionService = new ExceptionService();
