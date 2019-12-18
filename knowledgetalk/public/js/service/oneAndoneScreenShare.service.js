function OneAndoneScreenShareService(){}

/**
 * 전역 변수 s_stream 선언 이유 :
 * 화면공유 중에 자료공유 기능을 사용하다가, 다시 화면공유 기능을 선택할 시에 화면이 전환되지 않는 이슈가 있음
 * 이슈 원인 : 화면공유 버튼 클릭시 OneAndoneScreenShareService.prototype.init 함수가 실행되고  chrome으로 post 메세지를 보내면서 확장 프로그램을 실행하고 이후 화면 공유 비디오 등을 생성하게 되는데,
 *            자료공유 이후 다시 화면 공유 버튼을 클릭 할 경우 다시 post 메세지를 보내더라도 이미 확장프로그램이 실행되어 있는 상황이라 화면 공유 비디오를 생성하지 않게 된다.
 *
 * 해결 : 최초 화면 공유시 생성되는 stream을 s_stream에 할당한 후 이후 위 상황시 s_stream의 데이터 유무로 분기를 태워 비디오를 보이도록 변경
 *        => 분기태우는 위치 : CommonService.prototype.setCategory 함수
 *
 * 위와 같은 경우로 N:N의 경우는 kurento.utils 내부에 screenStreem이라는 변수가 전역변수로 이미 사용되고 있는 중이라 screenStream 의 변수를 이용하여 해결했다.
 */
let s_stream;

window.addEventListener( 'message', chromeMessageHandler );
/**
 * init함수는 window.postMessage를 통하여, 추가한 확장프로그램을 실행하게 하여 화면 공유 탭을 띄우게 되고 그 후 화면 공유 workflow를 시작한다.
 * 호출위치 : video.service의 screenSharing() 함수에서 호출
 */
OneAndoneScreenShareService.prototype.init = () => {

    if(banDuplicateScreenShareFlag) {
        return;
    }
    banDuplicateScreenShareFlag = true;
    screenPearConnection = new RTCPeerConnection(socketService.iceServer());
    // let type = 'SS_UI_REQUEST';
    // let text = 'start';
    // let isMulti = false;
    // let isRecoding = false;
    // window.postMessage({
    //     type,
    //     text,
    //     isMulti,
    //     isRecoding
    // }, '*');




    document.querySelector(".loader").style.display="none";
    screenShareCanvasService.displayInlineBlockScreenCanvas();
    /**
     * N:N인지 1:1인지 체크해야함.
     */
    oneAndOneScreenShareService.sendScreenOfferSdp();
};

/**
 * 화면공유 시작을 위해 Signal Server로 SessionReserve 요청을 보내는 함수
 * Call 위치는 init() 함수가 실행되면 윈도우 객체로 message를 보내는데 chromeMessageHandler(chromeMessageHandler.js)가 event를 catch하여
 * 해당함수를 실행, 그후 Offer 객체를 생성하고 SDP를 전송한다.
 */
OneAndoneScreenShareService.prototype.sendScreenShareSessionReserve = function() {
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

    // sendCandidate();
};

/**
 * getUserMedia를 통해서 넘겨받는 local stream을, video 태그를 생성하여 local 화면에 뿌려주고,
 * Offer를 생성한 후 SDP를 localDescription에 저장, 그후 Offer SDP를 대상에게 보내는 함수
 * @param streamId
 */
OneAndoneScreenShareService.prototype.sendScreenOfferSdp = function() {
// OneAndoneScreenShareService.prototype.sendScreenOfferSdp = function(streamId) {

    // let constraints = {
    //     audio: {
    //         mandatory: {
    //             chromeMediaSource: 'desktop',
    //             chromeMediaSourceId: streamId,
    //             minFrameRate: 1,
    //             maxFrameRate: 10
    //         }
    //     },
    //     video: {
    //         mandatory: {
    //             chromeMediaSource: 'desktop',
    //             chromeMediaSourceId: streamId,
    //             minFrameRate: 1,
    //             maxFrameRate: 10
    //         }
    //     }
    // };


    // navigator.getUserMedia(constraints, (stream) => {
    //     s_stream = stream;
    //
    //     document.querySelector(".loader").style.display = 'none';
    //     videoService.setScreenVideo(stream);
    //     screenPearConnection.addStream(stream);
    //
    //     screenPearConnection.createOffer((offerSdp) => {
    //         // offer 생성 후 local에 sdp 저장
    //         screenPearConnection.setLocalDescription(new RTCSessionDescription(offerSdp))
    //         const videoMediaStreamId = stream ? stream.id : "";
    //         const videoTrackId = stream ? stream.getVideoTracks()[0] : "";
    //         let sendData = {
    //             eventOp: "SDP",
    //             reqNo: commonService.getReqNo(),
    //             userId: JSON.parse(sessionStorage.getItem("userInfo")).userId,
    //             reqDate: commonService.getReqDate(),
    //             sdp: offerSdp,
    //             roomId: sessionStorage.getItem("roomId"),
    //             videoMediaStreamId : videoMediaStreamId,
    //             videoTrackId : videoTrackId,
    //             usage: "screen"
    //         };
    //         commonService.sendSocketMessage(sendData);
    //         oneAndOneScreenShareService.sendScreenCandidate();
    //     }, (err) => {
    //         console.log(err);
    //     });
    //
    //     /**
    //      * 크롬에서 제공해주는 공유중지 버튼을 클릭했을 때 실행.
    //      */
    //     stream.getVideoTracks()[0].onended = () => {
    //         oneAndOneScreenShareService.screenShareConferenceEnd();
    //
    //         // ScreenShareConferenceEnd
    //         videoService.initializeScreenShareRemoteVideo();
    //
    //         let type = 'SS_UI_CANCEL';
    //         let text = 'cancel';
    //         let isMulti = false;
    //         window.postMessage({
    //             type,
    //             text,
    //             isMulti
    //         }, '*');
    //         document.querySelector(".loader").style.display="none"
    //         commonService.isSharing = false;
    //         s_stream = null;
    //     }
    //
    //
    // }, (err) => {
    //     console.log(err);
    // })

    // constraints.video.mandatory.chromeMediaSourceId = streamId;

    navigator.mediaDevices.getDisplayMedia({ video: true }).then((stream) => {
        s_stream = stream;
        document.querySelector(".loader").style.display = 'none';
        videoService.setScreenVideo(stream);
        screenPearConnection.addStream(stream);
        screenPearConnection.createOffer((offerSdp) => {
            // offer 생성 후 local에 sdp 저장
            screenPearConnection.setLocalDescription(new RTCSessionDescription(offerSdp))
            const videoMediaStreamId = stream ? stream.id : "";
            const videoTrackId = stream ? stream.getVideoTracks()[0] : "";
            let sendData = {
                eventOp: "SDP",
                reqNo: commonService.getReqNo(),
                userId: JSON.parse(sessionStorage.getItem("userInfo")).userId,
                reqDate: commonService.getReqDate(),
                sdp: offerSdp,
                roomId: sessionStorage.getItem("roomId"),
                videoMediaStreamId : videoMediaStreamId,
                videoTrackId : videoTrackId,
                usage: "screen"
            };
            commonService.sendSocketMessage(sendData);
            oneAndOneScreenShareService.sendScreenCandidate();
        }, (err) => {
            console.log(err);
        });

        stream.getVideoTracks()[0].onended = () => {
            oneAndOneScreenShareService.screenShareConferenceEnd();

            // ScreenShareConferenceEnd
            videoService.initializeScreenShareRemoteVideo();

            let type = 'SS_UI_CANCEL';
            let text = 'cancel';
            let isMulti = false;
            window.postMessage({
                type,
                text,
                isMulti
            }, '*');
            document.querySelector(".loader").style.display="none"
            commonService.isSharing = false;
            s_stream = null;
        }
    }).catch(err => {
        console.log("cancel ui", err);
        if (err) {
            document.querySelector(".loader").style.display="none"
            let toolbox = document.getElementsByClassName('document-icon-box')[0];
            toolbox.style.display="none";
            oneAndOneScreenShareService.sessionReserveEnd();
            // if(s_stream || screenStream) {
                commonService.setCategory('video');
            // }
        }
    })

};
/**
 * Answer를 통하여 전달받은 SDP를 RemoteDescription에 저장후 그에 대한 응답(별도로 reponse하는 함수를 생성해 두었다. 여기서는 그 함수를 Call함)을 보내는 함수
 * @param data
 */
OneAndoneScreenShareService.prototype.screenShareConferenceEnd = function () {
    let sendData = {
        eventOp: "ScreenShareConferenceEnd",
        reqNo: commonService.getReqNo(),
        userId: JSON.parse(sessionStorage.getItem("userInfo")).userId,
        reqDate: commonService.getReqDate(),
        roomId: sessionStorage.getItem("roomId"),
        useMediaSvr : "N"
    };
    commonService.sendSocketMessage(sendData);
};

OneAndoneScreenShareService.prototype.setScreenRemoteSdpObj = function (data) {
    // 받은 answer sdp를 remote에 저장
    screenPearConnection.setRemoteDescription(new RTCSessionDescription(data.sdp))
        .then(() => {
            oneAndOneScreenShareService.respScreenSdp(data.reqNo);
        });
};

/**
 * Offer를 전달 받은 후 Stream을 연 후 Offer에 있는 sdp를 RemoteDescription에 저장하고 Answer 객체를 생성하여 Offer를 보낸 측에 Answer측의 SDP를 전달하는 함수
 * @param data(sdp)
 * @returns {Promise<void>}
 */
OneAndoneScreenShareService.prototype.createScreenShareAnswerObj = async function (data) {
    try {
        // 받은 offer sdp를 remote에 저장
        screenShareCanvasService.displayInlineBlockScreenCanvas();
        screenPearConnection.onaddstream = function (e) {
            if (e.stream) {
                s_stream = e.stream;
                videoService.setScreenVideo(s_stream);
            }
        };
        screenPearConnection.setRemoteDescription(new RTCSessionDescription(data.sdp))
            .then(async () => {
                let sdp = await screenPearConnection.createAnswer();
                // answer 생성 후 local에 저장
                screenPearConnection.setLocalDescription(new RTCSessionDescription(sdp))
                    .then(function() {
                        let sendData = {
                            eventOp : "SDP",
                            reqNo : commonService.getReqNo(),
                            userId : JSON.parse(sessionStorage.getItem("userInfo")).userId,
                            reqDate : commonService.getReqDate(),
                            sdp : sdp,
                            roomId : sessionStorage.getItem("roomId"),
                            usage : "screen"
                        };

                        commonService.sendSocketMessage(sendData);
                        oneAndOneScreenShareService.sendScreenCandidate();
                    });
            }).catch(e => {
            console.log(e)
        });
    } catch (e) {
        console.log(e)
    }

};

/**
 * Candidata를 전송하는 함수
 */
OneAndoneScreenShareService.prototype.sendScreenCandidate = function() {
    screenPearConnection.onicecandidate = function (e) {
        if(e.candidate) {
            let sendData = {
                eventOp : "Candidate",
                reqNo : commonService.getReqNo(),
                userId : JSON.parse(sessionStorage.getItem("userInfo")).userId,
                reqDate : commonService.getReqDate(),
                candidate : e.candidate,
                roomId : sessionStorage.getItem("roomId"),
                usage : "screen"
            };
            commonService.sendSocketMessage(sendData);
        } else {
            console.log("candidate is null");
        }
    };
};

OneAndoneScreenShareService.prototype.respScreenSdp = function(reqNo) {
    let sendData = {
        eventOp : "SDP",
        reqNo,
        code : "200",
        resDate : commonService.getReqDate(),
        roomId : sessionStorage.getItem("roomId"),
        usage : "screen"
    };
    commonService.sendSocketMessage(sendData);
    //commonFn.setWhiteBoardLayout();
};

OneAndoneScreenShareService.prototype.sessionReserveEnd = function() {
    let sendData = {
        eventOp: "SessionReserveEnd",
        reqNo: commonService.getReqNo(),
        userId: JSON.parse(sessionStorage.getItem("userInfo")).userId,
        reqDate: commonService.getReqDate(),
        roomId: sessionStorage.getItem("roomId")
    };
    banDuplicateScreenShareFlag = false;
    commonService.sendSocketMessage(sendData);
};

OneAndoneScreenShareService.prototype.endScreenShareSvr = function(data) {
    isSharer = true;
    s_stream = null;
    let sendData = {
        eventOp	:'ScreenShareConferenceEndSvr',
        reqNo: data.reqNo,
        reqDate: commonService.getReqDate(),
        code: 200,
        message: "OK"
    };
    commonService.sendSocketMessage(sendData);
    commonService.setCategory('video');
    commonService.messageBox(
      "화면공유",
      "상대방이 화면공유를 중지했습니다."
    );
};

OneAndoneScreenShareService.prototype.sendScreenCandidateResp = function(reqNo) {
    let sendData = {
        eventOp : "Candidate",
        reqNo,
        code : "200",
        resDate : commonService.getReqDate(),
        roomId : sessionStorage.getItem("roomId"),
        usage : "screen"
    };
    commonService.sendSocketMessage(sendData);
};

const oneAndOneScreenShareService = new OneAndoneScreenShareService();