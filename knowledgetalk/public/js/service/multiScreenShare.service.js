function MultiScreenShareService() {}

let screenWebRtcPeer;
MultiScreenShareService.prototype.init = () => {
    document.querySelector(".loader").style.display=""
    if(banDuplicateScreenShareFlag) {
        return;
    }
    banDuplicateScreenShareFlag = true;

    // let type = 'SS_UI_REQUEST';
    // let text = 'start';
    // let isMulti = true;
    // let isRecoding = false;
    // window.postMessage({
    //     type,
    //     text,
    //     isMulti,
    //     isRecoding
    // }, '*');
    //TODO janus
    if(sessionStorage.getItem("isSfu") === 'true') {
        connectJanusService.createScreenShareSdpOffer()
    } else {
        multiScreenShareService.kurentoPeerConnect();
    }



};

MultiScreenShareService.prototype.endScreenShareSvr = function() {
    isSharer = true;
    screenStream = null;
    if(sessionStorage.getItem("isSfu") === 'true') {
        if(janusScreenShareStreamPeer !== null) {
            janusScreenShareStreamPeer.close();
            janusScreenShareStreamPeer = null;
        }
    } else if(screenWebRtcPeer) {
        screenWebRtcPeer.dispose();
    }
    let sendData = {
        eventOp	:'ScreenShareConferenceEndSvr',
        reqNo: commonService.getReqNo(),
        code : '200',
        resDate: commonService.getReqDate(),
        roomId: sessionStorage.getItem("roomId"),
    };

    commonService.setCategory('video');
    commonService.sendSocketMessage(sendData);
    commonService.messageBox(
      "화면공유",
      "상대방이 화면공유를 중지했습니다."
    );
};

MultiScreenShareService.prototype.sendScreenShareSessionReserve = () => {
    setTimeout(function () {
        let sendData = {
            eventOp : "SessionReserve",
            reqNo : commonService.getReqNo(),
            userId : JSON.parse(sessionStorage.getItem("userInfo")).userId,
            reqDate : commonService.getReqDate(),
            roomId : sessionStorage.getItem("roomId")
        };

        commonService.sendSocketMessage(sendData);
    }, 500);
};

MultiScreenShareService.prototype.screenShareConferenceEnd  = function() {
    let sendData = {
        eventOp: "ScreenShareConferenceEnd",
        reqNo: commonService.getReqNo(),
        userId: JSON.parse(sessionStorage.getItem("userInfo")).userId,
        reqDate: commonService.getReqDate(),
        roomId: sessionStorage.getItem("roomId"),
        useMediaSvr : "Y"
    };

    commonService.sendSocketMessage(sendData);
};

MultiScreenShareService.prototype.screenOnIceCandidate  = function(candidate) {
     if(!candidate.candidate) {
         return;
     }
    let sendData = {
        eventOp   : 'Candidate',
        reqNo : commonService.getReqNo(),
        reqDate : commonService.getReqDate(),
        userId : JSON.parse(sessionStorage.getItem("userInfo")).userId,
        roomId : sessionStorage.getItem("roomId"),
        useMediaSvr : 'Y',
        usage : 'screen',
        candidate : candidate,
        isHWAccelation: false,
        isRTPShare: false,
    };
    commonService.sendSocketMessage(sendData);
};

/**
 * kurento peer를 생성한 후 SDP를 바로 전송한다. 별도 SDP offer를 생성하는 함수는 존재하지 않는다.
 * @param streamId
 */
MultiScreenShareService.prototype.kurentoPeerConnect = () => {
// MultiScreenShareService.prototype.kurentoPeerConnect = (streamId) => {

        let screenVideo = document.getElementById("ScreenSharingVideo");

    //     let constraints = {
    //     audio: false,
    //     video: {
    //         mandatory: {
    //             chromeMediaSource: 'desktop',
    //             chromeMediaSourceId: streamId,
    //             /* maxWidth: 1280,
    //              maxHeight: 720,*/
    //             minFrameRate: 1,
    //             maxFrameRate: 10
    //             //maxWidth: window.screen.width,
    //             //maxHeight: window.screen.height
    //         }
    //     }
    // };

        // navigator.getDisplayMedia({video: true}, stream => {
            let options = {
                localVideo  : screenVideo,
                //remoteVideo : undefined,
                onicecandidate : multiScreenShareService.screenOnIceCandidate
            };

            screenWebRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options, function(error) {
                if(error) return errorCallback(error);
                this.generateOffer(multiScreenShareService.screenOnOfferConference);
            });
        // })

};

MultiScreenShareService.prototype.sendRemoteUserSdp = function() {
    isSharer = false;
    videoService.setScreenVideo();
    let screenVideo = document.getElementById("screen-share-video");
    let options = {
        remoteVideo    : screenVideo,
        onicecandidate : multiScreenShareService.screenOnIceCandidate
    };

    screenWebRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options, function(error) {
        if(error) return errorCallback(error);
        this.generateOffer(multiScreenShareService.screenOnOfferViewer);
    });
}

MultiScreenShareService.prototype.screenOnOfferConference = function(error, offerSdp){

    if (error) return errorCallback(error);
    let sendsdp = {
        type : "offer" ,
        sdp : offerSdp
    };

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
        sdp : sendsdp
    };

    commonService.sendSocketMessage(sendData);
};

MultiScreenShareService.prototype.screenOnOfferViewer = function(error, offerSdp){
    if (error) return errorCallback(error);

    let viewersdp ={
        type : "offer",
        sdp : offerSdp
    };

    let sendData = {
        eventOp 	: 'SDP',
        reqNo : commonService.getReqNo(),
        userId : JSON.parse(sessionStorage.getItem("userInfo")).userId,
        type : 'user',
        roomId : sessionStorage.getItem("roomId"),
        reqDate : commonService.getReqDate(),
        useMediaSvr : 'Y',
        isRTPShare: false,
        usage : 'screen',
        sdp : viewersdp
    };
    commonService.sendSocketMessage(sendData);
};

MultiScreenShareService.prototype.responseSdp = function(data) {
    if(screenWebRtcPeer) {
        screenWebRtcPeer.processAnswer(data.sdp.sdp);
    }
};

MultiScreenShareService.prototype.SCR_VIEW_Response = function(data){
    screenWebRtcPeer.processAnswer(data.sdp.sdp);
    document.querySelector(".loader").style.display="none";
};

let multiScreenShareService= new MultiScreenShareService();