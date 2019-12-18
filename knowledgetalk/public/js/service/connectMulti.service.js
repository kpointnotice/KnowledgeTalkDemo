function ConnectMultiService() {}

let kurentoPeer;

ConnectMultiService.prototype.recieveCall = function (data) {
  if (data.code != 200) {
    console.log("Call err : ", data);
  } else if (data.status === "accept") {
    sessionStorage.setItem("roomId", data.roomId);
    console.log('data.isSfu', typeof data.isSfu);
    if (data.isSfu === true) {
      sessionStorage.setItem("isSfu", data.isSfu);
      connectJanusService.createSDPOffer(
        data.videoWidth,
        data.videoHeight,
        data.videoFramerate
      );
      chatService.resetMessage();
      return false;
    } else {
      kurentoPeer = connectKurentoService.kurentoPeerConnect();
    }

    chatService.resetMessage();
  }
};

ConnectMultiService.prototype.recieveJoin = function (data) {
  if (data.code !== "200") {
    console.log("Join err : ", data);
  } else if (data.memberList) {
    let myId = JSON.parse(sessionStorage.getItem("userInfo")).userId;
    let attendant_box = document.querySelector(".attendant-box");
    let attendant_list = `<a class="tooltipped" data-position="left" data-tooltip="${myId}"><i class="material-icons">person</i></a>`;
    for (let i = 0; i < data.memberList.length; i++) {
      if (data.memberList[i] != myId)
        attendant_list += `<a class="tooltipped" data-position="left" data-tooltip="${
          data.memberList[i]
        }"><i class="material-icons">person</i></a>`;
    }
    attendant_box.innerHTML = attendant_list;

    let elems = document.querySelectorAll(".tooltipped");
    let instances = M.Tooltip.init(elems);

    if (sessionStorage.getItem("isSfu") === "true" || data.isSfu === true) {
      sessionStorage.setItem("isSfu", "true");
      connectJanusService.createSDPOffer(
        data.videoWidth,
        data.videoHeight,
        data.videoFramerate
      );
    } else {
      kurentoPeer = connectKurentoService.kurentoPeerConnect();
    }
    chatService.resetMessage();
  }
};

ConnectMultiService.prototype.recieveSdp = async function (data) {
  if (data.sdp) {
    if (data.sdp.type === "offer" && data.usage === "cam") {
      if (data.isSfu === true) {
        connectJanusService.createSDPAnswer(data);
      }
    } else if (data.sdp.type === "answer" && data.usage === "cam") {
      //janus.
      if (data.isSfu === true) {
        janusLocalStreamPeer.setRemoteDescription(
          new RTCSessionDescription(data.sdp)
        );
      } else {
        kurentoPeer.processAnswer(data.sdp.sdp);
      }
      //janus end.

      let sdpData = {
        eventOp: "SDP",
        reqNo: data.reqNo,
        code: "200",
        resDate: commonService.getReqDate(),
        roomId: sessionStorage.getItem("roomId"),
        usage: "cam"
      };

      commonService.sendSocketMessage(sdpData);
    } else if (data.sdp.type === "offer" && data.usage === "screen") {
      if (data.isSfu === true) {
        let sendData = {
          eventOp: "SDP",
          reqNo: data.reqNo,
          code: "200",
          resDate: commonService.getReqDate(),
          roomId: sessionStorage.getItem("roomId"),
          usage: "screen"
        };
        commonService.sendSocketMessage(sendData);
        isSharer = false;
        connectJanusService.createScreenShareSdpAnswer(data);
        return false;
      }
      multiScreenShareService.respScreenSdp(data.reqNo);
    } else if (data.sdp.type === "answer" && data.usage === "screen") {
      if (data.useMediaSvr === "Y") {
        if (data.type === "maker") {
          if (data.sdp) {
            if (sessionStorage.getItem("isSfu") === "true") {
              // connectJanusService.sendScreenShareCandidate();
              // janusScreenShareStream.setRemoteDescription(data.sdp);
              janusScreenShareStreamPeer.setRemoteDescription(
                new RTCSessionDescription(data.sdp)
              );
              // janusScreenShareStreamPeer.addIceCandidate();
            } else multiScreenShareService.responseSdp(data);
          }
        } else {
          if (data.sdp) {
            /**
             * N:N에서 화면공유를 받는 피 공유자의 로직
             * @type {boolean}
             */
            isSharer = false;
            commonService.isSharing = true;
            commonService.setCategory("screenSharing");
            multiScreenShareService.SCR_VIEW_Response(data);
            // document.getElementsByClassName("stop-sharing")[0].style.display = 'none';
          }
        }
      }
    }
  }
  //commonFn.setWhiteBoardLayout()
};

ConnectMultiService.prototype.recieveCandidate = function (data) {
  if (!data.candidate) return;

  if (data.usage === "cam") {
    kurentoPeer.addIceCandidate(data.candidate);

    let iceReceiveData = {
      eventOp: "Candidate",
      reqNo: data.reqNo,
      code: "200",
      resDate: commonService.getReqDate(),
      roomId: sessionStorage.getItem("roomId"),
      usage: "cam"
    };

    commonService.sendSocketMessage(iceReceiveData);
  } else if (data.usage === "screen") {
    if (data.candidate) {
      screenWebRtcPeer.addIceCandidate(data.candidate);
    }
    let iceReceiveData = {
      eventOp: "Candidate",
      reqNo: data.reqNo,
      code: "200",
      resDate: commonService.getReqDate(),
      roomId: sessionStorage.getItem("roomId"),
      usage: "screen"
    };

    commonService.sendSocketMessage(iceReceiveData);
  }
};

ConnectMultiService.prototype.viewChange = data => {
  let sendData = {
    eventOp: "MultiViewChange",
    reqNo: commonService.getReqNo(),
    resDate: commonService.getReqDate(),
    code: 200,
    message: "OK"
  };
  commonService.sendSocketMessage(sendData);

  if (singleConferencePeer) {
    singleConferencePeer.close();
    singleConferencePeer = null;
  }

  if (
    localStream &&
    localStream.getVideoTracks() &&
    localStream.getVideoTracks()[0]
  ) {
    localStream.getVideoTracks()[0].stop();
  }
  if (
    localStream &&
    localStream.getAudioTracks() &&
    localStream.getAudioTracks()[0]
  ) {
    localStream.getAudioTracks()[0].stop();
  }
  if (document.getElementById("local")) {
    document.getElementById("local").remove();
  }
  if (document.getElementById("remote")) {
    document.getElementById("remote").remove();
  }
  if (data.isSfu === true) {
    connectJanusService.createSDPOffer(
      data.videoWidth,
      data.videoHeight,
      data.videoFramerate
    );
  } else {
    kurentoPeer = connectKurentoService.kurentoPeerConnect();
  }
};

ConnectMultiService.prototype.screenShareMultiSvr = data => {
  sessionStorage.setItem("roomId", data.roomId);

  if (data.type === "common") {} else if (data.type === "local") {} else {
    console.error("-- ScreenShareMultiSvr (Server -> Web) please check data.type --");
  }

  let sendData = {
    eventOp: "ScreenShareMultiSvr",
    reqNo: commonService.getReqNo(),
    code: "200",
    resDate: commonService.getReqDate(),
    roomId: data.roomId
  };
  commonService.sendSocketMessage(sendData);
  // multiScreenShareService.sendRemoteUserSdp();
};

let connectMultiService = new ConnectMultiService();