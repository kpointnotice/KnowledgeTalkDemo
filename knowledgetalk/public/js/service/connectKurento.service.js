function ConnectKurentoService() {}

ConnectKurentoService.prototype.kurentoPeerConnect = () => {
  let mediaConstraints = setupService.settingOption;
  // let mediaConstraints = {
  //   audio: undefined,
  //   video: {
  //     width: 1280,
  //     height: 720,
  //     framerate: 15
  //   }
  // };

  videoService.setVideo("manytomany");
  videoTagClassName = "manytomany-video";
  let multiVideo = document.createElement("video");
  multiVideo.autoplay = true;
  multiVideo.id = "multiVideo";
  multiVideo.style.width = "100%";
  multiVideo.style.height = "100%";
  setupService.audioOutput ? multiVideo.setSinkId(setupService.audioOutput).then(() => {
    console.log(`change audio output to ${setupService.audioOutput}`);
  }).catch(err => {
    console.log(`sink err: ${err}`);
  }) : "";
  document.querySelector("." + videoTagClassName).appendChild(multiVideo);

  let options = {
    localVideo: undefined,
    remoteVideo: multiVideo,
    mediaConstraints,
    //icecandidate 이벤트 등록 : icecandidate가 생성되면 자동으로 실행되는 코드
    onicecandidate: onIceCandidateHandler
  };

  function onIceCandidateHandler(candidate) {
    if (!candidate) return;

    let iceData = {
      eventOp: "Candidate",
      reqNo: commonService.getReqNo(),
      reqDate: commonService.getReqDate(),
      userId: JSON.parse(sessionStorage.getItem("userInfo")).userId,
      roomId: sessionStorage.getItem("roomId"),
      candidate,
      useMediaSvr: "Y",
      usage: "cam"
    };

    commonService.sendSocketMessage(iceData);
  }

  return kurentoUtils.WebRtcPeer.WebRtcPeerSendrecv(options, function(error) {
    this.generateOffer((error, sdpOffer) => {
      let sdp = {
        type: "offer",
        sdp: sdpOffer
      };

      let sdpData = {
        eventOp: "SDP",
        reqNo: commonService.getReqNo(),
        userId: JSON.parse(sessionStorage.getItem("userInfo")).userId,
        reqDate: commonService.getReqDate(),
        sdp,
        roomId: sessionStorage.getItem("roomId"),
        useMediaSvr: "Y",
        usage: "cam"
      };

      try {
        commonService.sendSocketMessage(sdpData);
      } catch (err) {
        if (err instanceof SyntaxError) {
          console.error(" there was a syntaxError it and try again : " + err.message);
        } else {
          throw err;
        }
      }
    });
  });
};

// function kurentoPeerConnect() {
//     let mediaConstraints = {
//       audio: undefined,
//       video: {
//         width: 1280,
//         height: 720,
//         framerate: 15
//       }
//     };

//     videoService.setVideo("manytomany");
//     videoTagClassName = "manytomany-video";
//     let multiVideo = document.createElement("video");
//     multiVideo.autoplay = true;
//     multiVideo.id = "multiVideo";
//     multiVideo.style.width = "1855px";
//     multiVideo.style.height = "909px";
//     document.querySelector("."+videoTagClassName).appendChild(multiVideo);

//     let options = {
//       localVideo: undefined,
//       remoteVideo: multiVideo,
//       mediaConstraints,
//       //icecandidate 이벤트 등록 : icecandidate가 생성되면 자동으로 실행되는 코드
//       onicecandidate: onIceCandidateHandler
//     };

//     function onIceCandidateHandler(e) {
//       if (!e.candidate) return;

//       let iceData = {
//         eventOp: "Candidate",
//         reqNo: commonService.getReqNo(),
//         reqDate: commonService.getReqDate(),
//         userId: JSON.parse(sessionStorage.getItem("userInfo")).userId,
//         roomId: sessionStorage.getItem("roomId"),
//         candidate: e,
//         useMediaSvr: "Y",
//         usage: "cam"
//       };
//       console.log("kurentoPeerConnect 에서 candidate 전송 ::: ");
//       commonService.sendSocketMessage(iceData);
//     }

//     return kurentoUtils.WebRtcPeer.WebRtcPeerSendrecv(options, function(error) {
//       this.generateOffer(function(error, sdpOffer) {

//         let sdp = {
//           type: "offer",
//           sdp: sdpOffer
//         };

//         let sdpData = {
//           eventOp: "SDP",
//           reqNo: commonService.getReqNo(),
//           userId: JSON.parse(sessionStorage.getItem("userInfo")).userId,
//           reqDate: commonService.getReqDate(),
//           sdp,
//           roomId: sessionStorage.getItem("roomId"),
//           useMediaSvr: "Y",
//           usage: "cam"
//         };

//         try {
//           commonService.sendSocketMessage(sdpData);
//         } catch (err) {
//           if (err instanceof SyntaxError) {
//             alert(" there was a syntaxError it and try again : " + err.message);
//           } else {
//             throw err;
//           }
//         }
//       });
//     });
//   }

let connectKurentoService = new ConnectKurentoService();
