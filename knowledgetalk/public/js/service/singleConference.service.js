function SingleConferenceService() {}

SingleConferenceService.prototype.createCamAnswerObj = function(data) {
    try {
        // 받은 offer sdp를 remote에 저장
        singleConferencePeer.setRemoteDescription(data.sdp)
            .then(async () => {
                let sdp = await singleConferencePeer.createAnswer();
                // 생성한 answer sdp를 local에 저장
                singleConferencePeer.setLocalDescription(sdp);

                singleConferencePeer.onicegatheringstatechange = e => {
                    if (singleConferencePeer.iceGatheringState === 'complete') {
                        let sendData = {
                            eventOp: "SDP",
                            reqNo: commonService.getReqNo(),
                            userId: JSON.parse(sessionStorage.getItem("userInfo")).userId,
                            reqDate: commonService.getReqDate(),
                            sdp: singleConferencePeer.localDescription,
                            roomId: sessionStorage.getItem("roomId"),
                            usage: "cam"
                        };
                
                        commonService.sendSocketMessage(sendData);
                    }
                }
            });
    } catch (e) {
        console.log(e)
    }
};

SingleConferenceService.prototype.setRemoteSdpObj = function(data) {
    singleConferencePeer.setRemoteDescription(data.sdp)
        .then(() => {
            singleConferenceService.respCamSdp(data.reqNo);
        });
};

SingleConferenceService.prototype.respCamSdp = function(reqNo) {
    let sendData = {
        eventOp : "SDP",
        reqNo,
        code : "200",
        resDate : commonService.getReqDate(),
        roomId : sessionStorage.getItem("roomId"),
        usage : "cam"
    };
    commonService.sendSocketMessage(sendData);
};

SingleConferenceService.prototype.sendCandidateResp = function(reqNo) {
    let sendData = {
        eventOp : "Candidate",
        reqNo,
        code : "200",
        resDate : commonService.getReqDate(),
        roomId : sessionStorage.getItem("roomId"),
        usage : "cam"
    };
    commonService.sendSocketMessage(sendData);
};

SingleConferenceService.prototype.sendCandidate = function() {
    // singleConferencePeer.onicecandidate = function (e) {
    //     if(e.candidate ) {
    //         let sendData = {
    //             eventOp : "Candidate",
    //             reqNo : commonService.getReqNo(),
    //             userId : JSON.parse(sessionStorage.getItem("userInfo")).userId,
    //             reqDate : commonService.getReqDate(),
    //             candidate : e.candidate,
    //             roomId : sessionStorage.getItem("roomId"),
    //             usage : "cam"
    //         };
    //         commonService.sendSocketMessage(sendData);
    //     } else {
    //         console.log("candidate is null");
    //     }
    // };

    singleConferencePeer.onaddstream = function (e) {
        if (e.stream) {
            let remoteVideo = document.getElementById("remote") ? document.getElementById("remote") : document.createElement("video");
            remoteVideo.autoplay = true;
            remoteVideo.id = 'remote';
            setupService.audioOutput ? remoteVideo.setSinkId(setupService.audioOutput).then(() => {
                console.log(`change audio output to ${setupService.audioOutput}`);
              }).catch(err => {
                console.log(`sink err: ${err}`);
              }) : "";
            document.getElementsByClassName("remote-video")[0].appendChild(remoteVideo);
            let remote = document.getElementById('remote');
            remote.srcObject = e.stream;
            remoteStream = e.stream;

            let localVideo = document.querySelector("#local");
            localVideo.insertAdjacentHTML("afterend",
                `<a class='video-icon' style='z-index:1' onClick='videoService.offVideo()'><i class='material-icons' id='VideoIcon'>videocam</i></a>
                <a class='mic-icon' style='z-index:1'  onClick='videoService.offMic()' ><i class='material-icons' id ='MicIcon'>mic</i></a>`);
        }
    }
};

SingleConferenceService.prototype.createCamOfferObj = function() {
    try {
        navigator.getUserMedia(setupService.settingOption, singleConferenceService.successOfferCallback, errorCallback);

    } catch (e) {
        console.log(e)
    }
};

SingleConferenceService.prototype.successAnswerCallback = function(stream) {
    singleConferenceService.sendCandidate();
    localStream = stream;
    videoService.setVideo("onetoone");
    let localVideo = document.createElement("video");
    localVideo.autoplay = true;
    localVideo.id = 'local';
    localVideo.muted = true;
    setupService.audioOutput ? localVideo.setSinkId(setupService.audioOutput).then(() => {
        console.log(`change audio output to ${setupService.audioOutput}`);
      }).catch(err => {
        console.log(`sink err: ${err}`);
      }) : "";

    document.getElementsByClassName("local-video")[0].appendChild(localVideo);
    let local = document.getElementById('local');
    local.srcObject = stream;
    singleConferencePeer.addStream(localStream);
};

SingleConferenceService.prototype.successOfferCallback = function(stream) {
    singleConferenceService.sendCandidate();
    localStream = stream;
    videoService.setVideo("onetoone");
    let localVideo = document.createElement("video");
    localVideo.autoplay = true;
    localVideo.id = 'local';
    localVideo.muted = true;

    setupService.audioOutput ? localVideo.setSinkId(setupService.audioOutput).then(() => {
        console.log(`change audio output to ${setupService.audioOutput}`);
      }).catch(err => {
        console.log(`sink err: ${err}`);
      }) : "";
    document.getElementsByClassName("local-video")[0].appendChild(localVideo);
    let local = document.getElementById('local');
    local.srcObject = stream;
    singleConferencePeer.addStream(localStream);

    singleConferencePeer.createOffer().then(sdp => {
        //생성한 Offer를 local에 저장
        singleConferencePeer.setLocalDescription(sdp);

        singleConferencePeer.onicegatheringstatechange = e => {
            if (singleConferencePeer.iceGatheringState === 'complete') {
                let sendData = {
                    eventOp: "SDP",
                    reqNo: commonService.getReqNo(),
                    userId: JSON.parse(sessionStorage.getItem("userInfo")).userId,
                    reqDate: commonService.getReqDate(),
                    sdp: singleConferencePeer.localDescription,
                    roomId: sessionStorage.getItem("roomId"),
                    usage: "cam"
                };
        
                commonService.sendSocketMessage(sendData);
            }
        }
    })
};

let singleConferenceService = new SingleConferenceService();