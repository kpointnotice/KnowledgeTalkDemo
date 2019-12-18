function SocketService() {}

// const clientIo = io.connect("https://localhost:7511/SignalServer");
const clientIo = io.connect("https://106.240.247.44:7511/SignalServer");
let localStream;
// 1:1 화상 대화를 위한 pear
let singleConferencePeer;
let remoteStream;
// 1:1 화면공유를 위한 pear
let screenPearConnection;
let isReject = false;
let inMeeting = false;
let signing = false;
// 화면공유자를 구분짓기 위한 flag
let isSharer = true;
let banDuplicateScreenShareFlag = false;
let friendListBtnDupl = false;
let signupProcBtnDupl = false;
let signupBtnDupl = false;
let setupBtnDupl = false;
let meetingStartBtnDupl = false;
let responseInviteDupl = false;
let scrollDupl = false;
let joinDupl = false;

//janus.
let janusLocalStreamPeer;
let janusScreenShareStreamPeer;
let janusScreenShareStream;
let janusRemoteStreamPeers = {};
let janusRemoteStreams = {};
let janusCandidates = [];
let janusScreenShareCandidates = [];
//janus end.
let userNumber;

let toolbar = document.querySelector(".document-icon-box");
let whiteAuth = false;
let fileing = false;

clientIo.on("disconnect", () => {
  if (inMeeting) {
    console.log("소켓 연결 종료로 인한 자동 저장");
    chatService.uploadChatLogs(sessionStorage.getItem("maker"));
    recordService.stop();
  }
  window.onbeforeunload = () => {};
  document.querySelector("html").innerHTML = "서버와 연결이 종료되었습니다.";
  // clientIo.open();
});

clientIo.on("error", err => {
  console.log("error", err);
});

// Signal Server에서 return 받는 모든 response는 이곳으로 모인다. eventOp로 결과에 대한 구분이 필요
clientIo.on("knowledgetalk", function(param) {
  // logBox("receive", param);
  let data = param;

  switch (data.eventOp || data.signalOp) {
    case "Login":
      signing = false;
      exceptionService.clearExitTimer();
      loginService.recieve(data);
      break;
    case "MemberList":
      setTimeout(() => {
        scrollDupl = false;
      }, 500)
      document.querySelector(".loader").style.display = "none";
      friendListService.recieve(data); // 생성 필요
      break;
    case "Contact":
      setTimeout(() => {
        friendListBtnDupl = false;
      }, 500)
      break;
    case "Call":
      //invite.controller에서 Call 메세지 요청
      setTimeout(() => {
        meetingStartBtnDupl = false;
      }, 1000)
      // inMeeting = true;

      if (exceptionService.timer) {
        console.error("call timer duplication exception.");
        return;
      }
      if (data.code === "570") {
        commonService.messageBox("Error", connectMServerErr, null);
        videoService.videoReset();

        //iamabook. 190207. 570 코드 전송 시 ExitRoom 전송
        let sendData = {
          eventOp: "ExitRoom",
          reqNo: commonService.getReqNo(),
          userId: JSON.parse(sessionStorage.getItem("userInfo")).userId,
          userName: JSON.parse(sessionStorage.getItem("userInfo")).userName,
          reqDate: commonService.getReqDate(),
          roomId: data.roomId
        };
        commonService.sendSocketMessage(sendData);

        return;
      }
      sessionStorage.setItem("useMediaSvr", data.useMediaSvr);
      if (data.start_time) {
        let dateFmt = new Date(data.start_time).format("yyyyMMddhhmmss");
        recordService.recordId = chatService.chatId =
          JSON.parse(sessionStorage.getItem("userInfo")).userId + "_" + dateFmt;
      }
      if (sessionStorage.getItem("useMediaSvr") === "Y") {
        connectMultiService.recieveCall(data);
        // exceptionService.setResponseTimer(40, "call");
      } else if (sessionStorage.getItem("useMediaSvr") === "N") {
        singleConferencePeer = new RTCPeerConnection(socketService.iceServer());
        connectSingleService.recieveCall(data);
        // exceptionService.setResponseTimer(40, "call");
      }

      break;
    case "Invite":
      inviteService.recieveInvite(data);
      break;
    case "Join":
      setTimeout(() => {
        responseInviteDupl = false;
      }, 1000)
      exceptionService.clearExitTimer();
      if (isReject) {
        isReject = false;
        break;
      }
      if (data.state === "notExist") {
        exceptionService.roomNotExist();
        return;
      }
      if (data.state === "reject") {
        return;
      }

      if (data.code === "561") {
        exceptionService.roomNotExist();
        return;
      }

      document.getElementById("TopRoomInfo").innerHTML =
        data.admin && data.admin.userNumber;
      document.getElementById("RoomInfo").style.display = "";
      if (data.useMediaSvr === "Y") {
        sessionStorage.setItem("useMediaSvr", "Y");
      }

      // inMeeting = true;
      if (sessionStorage.getItem("useMediaSvr") === "Y") {
        connectMultiService.recieveJoin(data);
      } else if (sessionStorage.getItem("useMediaSvr") === "N") {
        singleConferencePeer = new RTCPeerConnection(socketService.iceServer());
        connectSingleService.recieveJoin(data);
      }
      break;
    case "GuestJoin":
      exceptionService.clearExitTimer();

      setTimeout(() => {
        joinDupl = false;
      }, 1000);

      if (data.code !== "200") {
        if (data.code === "528") {
          commonService.messageBox(
            "시간초과",
            "상대방의 응답이 없습니다. 회의참여에 실패하였습니다."
          );
        } else if (data.code === "223") {
          commonService.messageBox(
            "회의참가",
            "상대방이 거절하였습니다. 회의참여에 실패하였습니다."
          );
        } else if (data.code === "224") {
          commonService.messageBox(
            "회의참가",
            "존재하지 않는 참여 코드 입니다."
          );
        } else if (data.code === "426") {
          commonService.messageBox("회의참가", "방이 존재하지 않습니다.");
        }
        break;
      }
      sessionStorage.setItem("roomId", data.roomId);
      sessionStorage.setItem("useMediaSvr", data.useMediaSvr);
      document.getElementById("TopRoomInfo").innerHTML = data.admin.userNumber;
      document.getElementById("RoomInfo").style.display = "";
      connectMultiService.recieveJoin(data);
      break;
    case "GuestConfirm":
      commonService.setConfirm(
        "회의참가",
        `${data.userId}` + joinConfirmMsg,
        () => {
          let sendData = {
            eventOp: "GuestConfirm",
            reqNo: data.reqNo,
            code: "200",
            message: "OK",
            resDate: commonService.getReqDate(),
            status: "accept"
          };

          commonService.sendSocketMessage(sendData);
          exceptionService.clearExitTimer();
        },
        () => {
          let sendData = {
            eventOp: "GuestConfirm",
            reqNo: data.reqNo,
            code: "200",
            message: "OK",
            resDate: commonService.getReqDate(),
            status: "reject"
          };

          commonService.sendSocketMessage(sendData);
          exceptionService.clearExitTimer();
        }
      );
      exceptionService.setJoinReqTimer(20, data.reqNo);
      break;
    case "Presence":
      presenceService.receive(data);
      break;
    case "SDP":
      if (
        data.sdp &&
        data.sdp.type === "answer" &&
        exceptionService.targetLength == 0
      ) {
        setupBtnDupl = false;
        exceptionService.clearExitTimer();
      }
      if (sessionStorage.getItem("useMediaSvr") === "Y") {
        connectMultiService.recieveSdp(data);
      } else if (sessionStorage.getItem("useMediaSvr") === "N") {
        connectSingleService.recieveSdp(data);
      }
      break;
    case "Candidate":
      if (sessionStorage.getItem("useMediaSvr") === "Y") {
        connectMultiService.recieveCandidate(data);
      } else if (sessionStorage.getItem("useMediaSvr") === "N") {
        connectSingleService.recieveCandidate(data);
      }
      break;
    case "SessionReserve":
      if (data.code === "440") {
        document.querySelector(".loader").style.display = "none";
        document.getElementsByClassName("document-icon-box")[0].style.display =
          "none";
        let mainMenuChild = document.querySelectorAll("#Mainmenu > li");

        // 문서공유자가 문서를 공유중인데 피공유자가 화면공유 버튼을 눌렀을 경우
        if (commonService.isDocument) {
          setTimeout(() => {
            commonService.messageBox("", preemptedDocumentShareMsg);
          }, 500);
          commonService.setCategory("document");
        } else if (commonService.isSharing) {
          // 화면공유자가 화면을 공유중인데 피공유자가 화면공유 버튼을 눌렀을 경우
          setTimeout(() => {
            commonService.messageBox("", preemptedScreenShareErr);
          }, 500);
          commonService.setCategory("screenSharing");
        } else {
          setTimeout(() => {
            commonService.messageBox("", preemptedShareErr);
          }, 500);
          commonService.setCategory("video");
        }
      } else if (data.code === "200") {
        // server가 응답할때 오타 있다. multitype (x) multiype(o), server side 수정 필요
        if (
          data.multiType === "Y" &&
          sessionStorage.getItem("lookat") != "document"
        ) {
          multiScreenShareService.init();
        } else if (
          data.multiType === "N" &&
          sessionStorage.getItem("lookat") != "document"
        ) {
          oneAndOneScreenShareService.init();
        } else if (sessionStorage.getItem("lookat") === "document") {
          documentService.UploadShare(); //파일 저장버튼 이후
        }
      }

      break;
    case "ScreenShareConferenceEnd":
      commonService.isSharing = false;
      isSharer = true;
      if (sessionStorage.getItem("useMediaSvr") === "Y") {
        if (categoryData === "document") {
          oneAndOneScreenShareService.sessionReserveEnd();
          if (screenWebRtcPeer) {
            screenWebRtcPeer.dispose();
          }
        } else {
          if (screenStream) {
            screenStream.getVideoTracks()[0].stop();
          }
          commonService.setCategory("video");
          oneAndOneScreenShareService.sessionReserveEnd();
          if (screenWebRtcPeer) {
            screenWebRtcPeer.dispose();
          }
        }
      } else if (sessionStorage.getItem("useMediaSvr") === "N") {
        if (categoryData === "document") {
          screenPearConnection.close();
          oneAndOneScreenShareService.sessionReserveEnd();
        } else {
          if (s_stream) {
            s_stream.getVideoTracks()[0].stop();
          }
          commonService.setCategory("video");
          screenPearConnection.close();
          oneAndOneScreenShareService.sessionReserveEnd();
        }
      }
      break;
    case "ScreenShareConferenceEndSvr":
      let screenSharingVideo = document.getElementById("ScreenSharingVideo");
      if (screenSharingVideo.style.display === "block") {
        screenSharingVideo.style.display = "none";
      }
      commonService.isSharing = false;
      isSharer = true;
      screenShareCanvasService.displayNoneScreenCanvas();
      videoService.initializeScreenShareRemoteVideo();
      if (sessionStorage.getItem("useMediaSvr") === "Y") {
        multiScreenShareService.endScreenShareSvr(data);
      } else if (sessionStorage.getItem("useMediaSvr") === "N") {
        oneAndOneScreenShareService.endScreenShareSvr(data);
        screenPearConnection.close();
      }
      break;
    case "SessionReserveEnd":
      break;
    case "ExitRoom":
      if (sessionStorage.getItem("useMedisaSvr") === "N") {
        singleConferencePeer.close();
      }
      videoService.initializeVideoBox();
      videoService.videoReset();
      break;
    case "FileShareStartSvr":
      commonService.setCategory("document");
      commonService.isDocument = true;
      //shareController.listUpHandler(result)  추 후에 처리할 것!
      document.querySelector(".stop-sharing").style.display = "none";
      document.getElementsByClassName("stop-document")[0].style.display =
        "none";
      commonService.sendSocketMessage({
        eventOp: "FileShareStartSvr",
        reqNo: data.reqNo,
        code: 200,
        message: "OK",
        resDate: commonFn.getReqDate(),
        userId: data.userId,
        roomId: data.roomId,
        recvUserId: JSON.parse(sessionStorage.getItem("userInfo")).userId
      });
      break;
    case "FileShareSvr":
      sharing.fileShare(data);
      fileing = true;
      let tool = document.getElementsByClassName("document-icon-box")[0];
      tool.style.display = "none";
      break;
    case "FileShareEndSvr":
      documentService.EndFileShareRes();
      fileing = false;
      commonService.isDocument = false;
      let toolbox = document.querySelector(".document-icon-box");

      if (sessionStorage.getItem("lookat") === "document") {
        toolbox.style.display = "";
        commonService.setCategory("video");
        commonService.messageBox(
          "자료공유",
          "상대방이 자료공유를 중지했습니다."
        );
      }
      break;
    case "Draw":
      if (data.type === "document") {
        whiteboard.setWhiteboard("document");
        if (sessionStorage.getItem("lookat") != "document") {
          commonService.setCategory("document");
        }
      } else if (data.type === "screenSharing") {
        whiteboard.setWhiteboard("screenSharing");
        //현재 보고있는 화면에 대한 분기 처리
        if (sessionStorage.getItem("lookat") != "screenshare") {
          commonService.setCategory("screenSharing", true);
        }
      }
      whiteboard.draw(data);
      toolbar.style.display = "none";
      break;
    case "Erase":
      whiteboard.erase(data);
      break;
    case "WriteText":
      whiteboard.write(data);
      break;
    case "Color":
      whiteboard.color = data.color;
      sessionStorage.setItem("color", data.color);
      break;
    case "EraserSize":
      if (data.eraserSize === -1) {
        whiteboard.clear("their");
      } else {
        whiteboard.eraser.size = data.eraserSize;
      }
      break;
    case "LineSize":
      sessionStorage.setItem("pen", data.lineSize);
      whiteboard.pen.thickness = data.lineSize;
      break;
    case "MultiViewChange":
      if (!inMeeting) {
        return;
      }
      sessionStorage.setItem("useMediaSvr", "Y");
      connectMultiService.viewChange(data);

      /**
       * 1:1로 화면공유 중 새로운 이용자를 초대하여 N:N으로 방이 변경 될 경우 화면공유를 종료하게 된다.
       */
      if (s_stream) {
        // 화면공유 종료 로직 시작
        // screenShareConferenceEnd 를 보낸 후 응답받은 후 SessionReserveEnd를 보내므로 여기에서 보낼 필요가 없다.
        oneAndOneScreenShareService.screenShareConferenceEnd();

        //getVideoTracks()[0].stop(); => 화면공유를 시작하면 하단에 공유중지, 숨기기 팝업이 뜨는데 그 팝업을 없애는 역할을 한다.
        s_stream.getVideoTracks()[0].stop();

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
        s_stream = null;
        commonService.isSharing = false;
        isSharer = true;
        if (document.getElementById("screen-share-video")) {
          document.getElementById("screen-share-video").remove();
        }

        let screenSharingVideo = document.getElementById("ScreenSharingVideo");
        if (screenSharingVideo.style.display !== "none") {
          screenSharingVideo.style.display = "none";
        }
        let videoBox = document.getElementById("VideoBox");
        if (videoBox.classList.contains("isSharing")) {
          videoBox.classList.remove("isSharing");
        }
        screenPearConnection.close();
        commonService.setCategory("video");
      }
      break;

    case "ScreenShareMultiSvr":
      isSharer = false;
      connectMultiService.screenShareMultiSvr(data);
      break;
    case "ConferenceHistory":
      meetingListService.setMeetingList(data.result);
      break;
    case "Chat":
      chatService.setOtherMessage(data);
      break;
    case "ModifyInfo":
      infoEditService.setUserInfo(data);
      break;
    case "SignUp":
      setTimeout(() => {
        signupProcBtnDupl = false;
      }, 1000)
      document.querySelector(".loader").style.display = "none";
      signupService.signUpResult(data);
      break;
    case "Alert":
      if (data.action === "logout") {
        commonService.messageBox(
          "Error",
          "다른 곳에서 동일한 아이디로 로그인되었습니다. 잠시 후 새로고침됩니다."
        );
        setTimeout(() => {
          window.onbeforeunload = () => {};
          location.reload();
        }, 5000);
      }
      break;
    case "SetVideo":
      videoService.setOffVideo(data);
      break;
    case "SetAudio":
      videoService.setOffMic(data);
      break;
    case "Record":
      recordService.response(data);
      break;
    default:
      console.log("unknown socket event");
      break;
  }
});

SocketService.prototype.iceServer = () => {
  let iceServers = {
    urls: JSON.parse(sessionStorage.getItem("userInfo")).config[1].turn_url,
    credential: JSON.parse(sessionStorage.getItem("userInfo")).config[1]
      .turn_credential,
    username: JSON.parse(sessionStorage.getItem("userInfo")).config[1]
      .turn_username
  };

  let iceServersObject = {
    iceServers: [iceServers]
  };

  return iceServersObject;
};

function errorCallback(e) {
  console.log("err : ", e);
}

let socketService = new SocketService();
