function ConnectJanusService() {}

const pc_constraints = {
  "optional": [{"DtlsSrtpKeyAgreement": true}]
};

let janusRemoteCandidates = {};

ConnectJanusService.prototype.createSDPOffer = async (width, height, framerate) => {
  videoService.setVideo("onetomany");
  let multiVideoBox = document.querySelector("#VIDEOONETOMANY");
  let offerOptions = {
    offerToReceiveAudio: true,
    offerToReceiveVideo: true
  };
  try{
    localStream = await navigator.mediaDevices.getUserMedia({ video : {width:width, height:height, frameRate: { ideal: framerate, max: framerate } }, audio: true});
    // let stream = await navigator.mediaDevices.getUserMedia({ video : {width:300, height:300}, audio:true}); // TEST
  } catch(e){
    console.log("e :::", e);
    alert('getusermedia 호출하는중 에러발생');

    return 0;
  }

  streamSize = Object.keys(janusRemoteStreams).length;
  let videoTagClassName;
  if (streamSize > 0 && streamSize <= 3) {
    videoTagClassName = "video-twobytwo";
  } else if (streamSize > 3 && streamSize <= 8) {
    videoTagClassName = "video-threebythree";
  } else if (streamSize > 8) {
    videoTagClassName = "video-fourbyfour";
  }

  let videoContainner = document.createElement("dd");
  videoContainner.classList = "multi-video";

  const graphcontainer = 
  `<div class="graph-box">
    <div class="graph-container" id="bitrateGraph-local">
      <span class="bit-caption">Bitrate</span>
      <canvas id="bitrateCanvas-local"></canvas>
    </div>
    <div class="graph-container" id="packetGraph-local">
      <span class="packet-caption">Packets sent per second</span>
      <canvas id="packetCanvas-local"></canvas>
    </div>
  </div>`;
  videoContainner.insertAdjacentHTML('beforeend', graphcontainer);

  let multiVideo = document.getElementById("multiVideo-local");
  if (!multiVideo) {
    let multiVideoTitle = document.createElement("p");
    multiVideoTitle.innerHTML = `local`;
    multiVideo = document.createElement("video");
    multiVideo.autoplay = true;
    multiVideo.muted = true;
    multiVideo.id = "multiVideo-local";
    setupService.audioOutput ? multiVideo.setSinkId(setupService.audioOutput).then(() => {
      console.log(`change audio output to ${setupService.audioOutput}`);
    }).catch(err => {
      console.log(`sink err: ${err}`);
    }) : "";
    videoContainner.appendChild(multiVideoTitle);
    videoContainner.appendChild(multiVideo);
    multiVideoBox.classList = videoTagClassName;
    multiVideoBox.appendChild(videoContainner);
  }
  multiVideo.srcObject = localStream;

  try {
    janusLocalStreamPeer = new RTCPeerConnection(socketService.iceServer(), pc_constraints);
    internalGraph("local", janusLocalStreamPeer);

    localStream.getTracks().forEach(track => {
      janusLocalStreamPeer.addTrack(track, localStream);
    });
  } catch (e) {
    console.log("e :::", e);
    alert('peerconnection 생성 에러');
  }

  try{
    let sdp = await janusLocalStreamPeer.createOffer(offerOptions);
    await janusLocalStreamPeer.setLocalDescription(sdp);

    janusLocalStreamPeer.onicegatheringstatechange = async () => {
      switch(janusLocalStreamPeer.iceGatheringState) {
        case "gathering":
          break;
        case "complete":
          let sdp = await janusLocalStreamPeer.createOffer(offerOptions);
          let sdpData = {
            eventOp: "SDP",
            reqNo: commonService.getReqNo(),
            userId: JSON.parse(sessionStorage.getItem("userInfo")).userId,
            reqDate: commonService.getReqDate(),
            sdp,
            roomId: sessionStorage.getItem("roomId"),
            useMediaSvr: "Y",
            usage: "cam",
            isSfu: true
          };
          commonService.sendSocketMessage(sdpData);
          break;
      }
    };

  }catch(err){
    if (err instanceof SyntaxError) {
      console.error(" there was a syntaxError it and try again : " + err.message);
    } else {
      throw err;
    }
  }

};

ConnectJanusService.prototype.createSDPAnswer = async (data) => {
  let multiVideoBox = document.querySelector("#VIDEOONETOMANY");
  return new Promise(async (resolve, reject) => {
    try{
      let displayId = data.displayId;
      janusRemoteStreamPeers[displayId] = new RTCPeerConnection(socketService.iceServer(), pc_constraints);

      janusRemoteStreamPeers[displayId].onconnectionstatechange = e => {
        let state = e.currentTarget.connectionState;
        let peerState = document.getElementById(`${displayId}-peer-state`);
        switch (state) {
          case "connecting":
            peerState.style.backgroundColor = "#999";
            peerState.innerText = `연결 중`;
            break;
          case "connected":
            peerState.style.backgroundColor = "#35a5d1";
            peerState.innerText = `연결됨`;
            break;
          default:
            peerState.style.backgroundColor = "#d80101";
            peerState.innerText = `${state}`;
            break;
        }
      }

      janusRemoteStreamPeers[displayId].onaddstream = function(e){

        janusRemoteStreams[displayId] = e.stream;
        streamSize = Object.keys(janusRemoteStreams).length;
        let videoTagClassName;
        if (streamSize > 0 && streamSize <= 3) {
          videoTagClassName = "video-twobytwo";
        } else if (streamSize > 3 && streamSize <= 8) {
          videoTagClassName = "video-threebythree";
        } else if (streamSize > 8) {
          videoTagClassName = "video-fourbyfour";
        }
        
        let videoContainner = document.createElement("dd");
        videoContainner.classList = "multi-video";

        const graphcontainer = 
        `<div class="graph-box">
          <div class="graph-container" id="bitrateGraph-${data.displayId}">
            <span class="bit-caption">Bitrate</span>
            <canvas id="bitrateCanvas-${data.displayId}"></canvas>
          </div>
          <div class="graph-container" id="packetGraph-${data.displayId}">
            <span class="packet-caption">Packets sent per second</span>
            <canvas id="packetCanvas-${data.displayId}"></canvas>
          </div>
        </div>`;
        videoContainner.insertAdjacentHTML('beforeend', graphcontainer);

        let multiVideoTitle = document.createElement("p");
        multiVideoTitle.innerHTML = `${displayId} <span class "peer-state" id="${displayId}-peer-state">생성</span>`;
        let multiVideo = document.createElement("video");
        multiVideo.autoplay = true;
        multiVideo.srcObject = e.stream;
        multiVideo.id = "multiVideo-" + data.displayId;

        setupService.audioOutput ? multiVideo.setSinkId(setupService.audioOutput).then(() => {
          console.log(`change audio output to ${setupService.audioOutput}`);
        }).catch(err => {
          console.log(`sink err: ${err}`);
        }) : "";
        
        videoContainner.appendChild(multiVideoTitle);
        videoContainner.appendChild(multiVideo);
        multiVideoBox.classList = videoTagClassName;
        multiVideoBox.appendChild(videoContainner);
        internalRemoteGraph(displayId, janusRemoteStreamPeers[displayId]);
      };


      await janusRemoteStreamPeers[displayId].setRemoteDescription(data.sdp);
      let answerSdp = await janusRemoteStreamPeers[displayId].createAnswer();
      await janusRemoteStreamPeers[displayId].setLocalDescription(answerSdp);


      janusRemoteStreamPeers[displayId].onicegatheringstatechange = e => {
        if (janusRemoteStreamPeers[displayId].iceGatheringState === 'complete') {
          let sdpData = {
            eventOp: "SDP",
            reqNo: commonService.getReqNo(),
            userId: JSON.parse(sessionStorage.getItem("userInfo")).userId,
            reqDate: commonService.getReqDate(),
            sdp: janusRemoteStreamPeers[displayId].localDescription,
            roomId: sessionStorage.getItem("roomId"),
            useMediaSvr: "Y",
            usage: "cam",
            isSfu: true,
            pluginId: data.pluginId
          };
    
          commonService.sendSocketMessage(sdpData);
        }
      }

      janusRemoteStreamPeers[displayId].oniceconnectionstatechange = (e) => {
        if((janusRemoteStreamPeers[displayId] && janusRemoteStreamPeers[displayId].iceConnectionState === 'disconnected') ||
            (janusRemoteStreamPeers[displayId] && janusRemoteStreamPeers[displayId].iceConnectionState === 'failed') ||
            (janusRemoteStreamPeers[displayId] && janusRemoteStreamPeers[displayId].iceConnectionState === 'closed')) {

          //TODO remote video object 제거

          janusRemoteStreamPeers[displayId].close();
          janusRemoteStreamPeers[displayId] = null;
          delete janusRemoteStreamPeers[displayId];

          let multiVideo = null;
          if(data.displayId.indexOf('screenshare-') > -1) {
            multiVideo = document.getElementById(displayId);
          } else {
            multiVideo = document.getElementById("multiVideo-" + displayId);
          }
          multiVideo ? multiVideo.srcObject = null : "";
        }
      };

      $.notify(data.displayId + presenseJoinMsg, {
        style: "invite",
        position: "right bottom"
      });
        
      let attendant_list = document.querySelectorAll(".attendant-box > a");
      for (let i=0; i<attendant_list.length; i++) {
          if (attendant_list[i].getAttribute("data-tooltip") === displayId) {
              return;
          }
      }
      let attendant_box = document.querySelector(".attendant-box");
      attendant_box.innerHTML += `<a class="tooltipped" data-position="left" data-tooltip="${displayId}"><i class="material-icons">person</i></a>`;

      let elems         = document.querySelectorAll('.tooltipped');
      let instances     = M.Tooltip.init(elems);
    } catch (e) {
      console.log(e);
    }

  });
};

ConnectJanusService.prototype.createScreenShareSdpOffer = async () => {
  try{
    let constraint = { video : true , audio : false };
    document.querySelector(".loader").style.display="";
    try {
      janusScreenShareStream = await navigator.mediaDevices.getDisplayMedia(constraint);
    } catch (err) {
      oneAndOneScreenShareService.sessionReserveEnd();
      document.querySelector(".loader").style.display = "none";
      commonService.setCategory('video');
      return;
    }

    janusScreenShareStreamPeer = new RTCPeerConnection(socketService.iceServer(), pc_constraints);

    janusScreenShareStream.getTracks().forEach(track => {
      janusScreenShareStreamPeer.addTrack(track, janusScreenShareStream);

      track.onended = () => {
        commonService.setCategory('video');
        multiScreenShareService.screenShareConferenceEnd();
        videoService.initializeScreenShareRemoteVideo();
      }
    });
    let sdp = await janusScreenShareStreamPeer.createOffer();
    await janusScreenShareStreamPeer.setLocalDescription(sdp);

    janusScreenShareStreamPeer.onicegatheringstatechange = async (ev) => {
      let connection = ev.target;

      switch(connection.iceGatheringState) {
        case "gathering":
          break;
        case "complete":
          let sdp = await janusScreenShareStreamPeer.createOffer();

          let sendData = {
            eventOp 	: 'SDP',
            reqNo : commonService.getReqNo(),
            userId : JSON.parse(sessionStorage.getItem("userInfo")).userId,
            type : 'maker',
            roomId : sessionStorage.getItem("roomId"),
            reqDate : commonService.getReqDate(),
            isHWAccelation: false,
            isRTPShare: false,
            useMediaSvr : 'Y',
            usage : 'screen',
            sdp : sdp,
            isSfu : true
          };

          commonService.sendSocketMessage(sendData);
          break;
      }
    };

    janusScreenShareStreamPeer.oniceconnectionstatechange = (e) => {
      if((janusScreenShareStreamPeer && janusScreenShareStreamPeer.iceConnectionState === 'disconnected') ||
          (janusScreenShareStreamPeer && janusScreenShareStreamPeer.iceConnectionState === 'failed') ||
          (janusScreenShareStreamPeer && janusScreenShareStreamPeer.iceConnectionState === 'closed')) {

          janusScreenShareStreamPeer.close();
          janusScreenShareStreamPeer = null;

          if(janusScreenShareStream) {
              janusScreenShareStream.getVideoTracks()[0].stop();
              janusScreenShareStream = null;
          }

          videoService.initializeScreenShareRemoteVideo();
      } else if((janusScreenShareStreamPeer && janusScreenShareStreamPeer.iceConnectionState === 'connected')) {
        videoService.setScreenVideo(janusScreenShareStream);
        // videoService.setScreenVideo();
      }
    };
  } catch (e) {
    console.log(e);
    oneAndOneScreenShareService.sessionReserveEnd();
  }
};

// ConnectJanusService.prototype.sendScreenShareCandidate = async (data) => {
//   return new Promise((resolve, reject) => {
//     while (janusScreenShareCandidates.length > 0) {
//       let each_candidate = janusScreenShareCandidates.shift();
//       let sendData = {
//         eventOp   : 'Candidate',
//         reqNo : commonService.getReqNo(),
//         reqDate : commonService.getReqDate(),
//         userId : JSON.parse(sessionStorage.getItem("userInfo")).userId,
//         roomId : sessionStorage.getItem("roomId"),
//         useMediaSvr : 'Y',
//         usage : 'screen',
//         candidate : each_candidate,
//         isSfu : true
//       };
//       commonService.sendSocketMessage(sendData);
//     }
//     resolve();
//   })
// };

ConnectJanusService.prototype.createScreenShareSdpAnswer = async (data) => {
    try {
        janusScreenShareStreamPeer = new RTCPeerConnection(socketService.iceServer(), pc_constraints);

        janusScreenShareStreamPeer.onaddstream = (e) => {
            videoService.setScreenVideo(e.stream);
        };

        // janusScreenShareStreamPeer.onicecandidate = (e) => {
        //   if (e.candidate) {
        //     // janusScreenShareCandidates.push(e.candidate);
        //     let sendData = {
        //         eventOp   : 'Candidate',
        //         reqNo : commonService.getReqNo(),
        //         reqDate : commonService.getReqDate(),
        //         userId : JSON.parse(sessionStorage.getItem("userInfo")).userId,
        //         roomId : sessionStorage.getItem("roomId"),
        //         useMediaSvr : 'Y',
        //         usage : 'screen',
        //         candidate : e.candidate,
        //         isSfu : true
        //     };
        //     commonService.sendSocketMessage(sendData);
        //   }
        // };

        await janusScreenShareStreamPeer.setRemoteDescription(new RTCSessionDescription(data.sdp));
        let answerSdp = await janusScreenShareStreamPeer.createAnswer();
        await janusScreenShareStreamPeer.setLocalDescription(answerSdp);

        // let sendData = {
        //     eventOp 	: 'SDP',
        //     reqNo : commonService.getReqNo(),
        //     userId : JSON.parse(sessionStorage.getItem("userInfo")).userId,
        //     type : 'user',
        //     roomId : sessionStorage.getItem("roomId"),
        //     reqDate : commonService.getReqDate(),
        //     isHWAccelation: false,
        //     isRTPShare: false,
        //     useMediaSvr : 'Y',
        //     usage : 'screen',
        //     sdp : answerSdp,
        //     isSfu : true
        // };

        // commonService.sendSocketMessage(sendData);

        janusScreenShareStreamPeer.onicegatheringstatechange = async (ev) => {
          let connection = ev.target;
    
          switch(connection.iceGatheringState) {
            case "gathering":
              break;
            case "complete":    
              let sendData = {
                eventOp 	: 'SDP',
                reqNo : commonService.getReqNo(),
                userId : JSON.parse(sessionStorage.getItem("userInfo")).userId,
                type : 'user',
                roomId : sessionStorage.getItem("roomId"),
                reqDate : commonService.getReqDate(),
                isHWAccelation: false,
                isRTPShare: false,
                useMediaSvr : 'Y',
                usage : 'screen',
                sdp : connection.localDescription,
                isSfu : true
              };
    
              commonService.sendSocketMessage(sendData);
              break;
          }
        };




      janusScreenShareStreamPeer.oniceconnectionstatechange = (e) => {
        if((janusScreenShareStreamPeer && janusScreenShareStreamPeer.iceConnectionState === 'disconnected') ||
            (janusScreenShareStreamPeer && janusScreenShareStreamPeer.iceConnectionState === 'failed') ||
            (janusScreenShareStreamPeer && janusScreenShareStreamPeer.iceConnectionState === 'closed')) {

          //TODO remote video object 제거

          janusScreenShareStreamPeer.close();
          janusScreenShareStreamPeer = null;

          videoService.initializeScreenShareRemoteVideo();
        }
      };
    } catch (e) {
        console.log(e);
    }
};

let connectJanusService = new ConnectJanusService();
