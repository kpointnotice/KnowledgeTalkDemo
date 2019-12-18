function VideoService() {}

VideoService.prototype.setVideo = function (roomSort) {
    inMeeting = true;
    document.querySelector("#Sidebar").style.display = "none";

    commonService.setMainMenu();
    document.querySelector("#Mainmenu > li:nth-child(1) > a > i").style.color = "#039be5";

    let videoBox = document.getElementById('VideoBox');
    let videoAllObj = videoBox.getElementsByTagName('dl');
    let videoOnetoone = document.getElementById('VIDEOONETOONE');
    let videoOnetomany = document.getElementById('VIDEOONETOMANY');

    let insertVideoStr = '';
    let targetObj;
    let targetDisplay;

    for (let i = 0; i < videoAllObj.length; i++) {
        videoAllObj[i].style.display = 'none';
    }

    if (roomSort === 'onetoone') {
        targetDisplay = 'block';
        targetObj = videoOnetoone;
        targetDisplay = 'block';
        insertVideoStr =
            `<div id = "one-to-one-video">
            <dd class="remote-video">
                <div class="video-off" id="remote-setVideo">
                    <i class="material-icons" style="display: none;">videocam_off</i>
                    <i class="material-icons" style="display: none;">mic_off</i>
                </div>
            </dd>
            <dd class="local-video">
                <div class="video-off" id="local-setVideo">
                    <i class="material-icons" style="display: none;">videocam_off</i>
                    <i class="material-icons" style="display: none;">mic_off</i>
                </div>
            </dd>
        </div>`;
    } else if (roomSort === 'onetomany') {
        targetDisplay = 'grid';
        targetObj = videoOnetomany;
        targetDisplay = 'grid';
        // insertVideoStr = `<dd class="onetomany-video"></dd>`;
    } else if (roomSort === 'manytomany') {
        targetObj = videoManytomany;
        // let insertVideo = '';

        // //Sfu비디오개수 만큼 생성함.
        // for (let i = 0; i < 15; i++) {
        //     insertVideo += `<div class='many-video'></div>`
        //     // }

        insertVideoStr =
            //         `<dd class="manytomany-video">
            //     ${insertVideo}
            // </dd>`;
            // }
            `<dd class="manytomany-video"></dd>`;
    }
    //  else if (roomSort === 'twobytwo') {
    //     targetObj = videoTwobytwo;
    // } else if (roomSort === 'threebythree') {
    //     targetObj = videoThreebythree;
    // } else if (roomSort === 'fourbyfour') {
    //     targetObj = videoFourbyfour;
    // }
    targetObj.style.display = targetDisplay;
    targetObj.innerHTML = insertVideoStr;

    // if (janusRemoteStreams) {
    //     console.log("isjanusRemoteStreams----")
    //     for (let item in janusRemoteStreams) {
    //         videoTagClassName = "video-"+roomSort;

    //         let videoContainner = document.createElement("dd");
    //         videoContainner.classList = "multi-video";

    //         let multiVideo = document.createElement("video");
    //         multiVideo.autoplay = true;
    //         multiVideo.srcObject = janusRemoteStreams[item];
    //         multiVideo.id = "multiVideo-" + data.displayId;

    //         setupService.audioOutput ? multiVideo.setSinkId(setupService.audioOutput).then(() => {
    //             console.log(`change audio output to ${setupService.audioOutput}`);
    //         }).catch(err => {
    //             console.log(`sink err: ${err}`);
    //         }) : "";

    //         videoContainner.appendChild(multiVideo);
    //         document.querySelector("." + videoTagClassName).appendChild(videoContainner);
    //     }
    // }
}

VideoService.prototype.offMic = function () {
    let micIcon = document.getElementById("MicIcon").textContent
    let local = document.getElementById("local")
    let localState = document.getElementById("local-setVideo").getElementsByTagName("i")[1];
    if (micIcon === 'mic') {
        localState.style.display = '';
        document.getElementById("MicIcon").textContent = 'mic_off'
        let sendData = {
            signalOp: 'SetAudio',
            userId: JSON.parse(sessionStorage.getItem("userInfo")).userId,
            reqDate: commonService.getReqDate(),
            roomId: sessionStorage.getItem("roomId"),
            status: false
        }
        commonService.sendSocketMessage(sendData)
    } else {
        localState.style.display = 'none';
        document.getElementById("MicIcon").textContent = 'mic'
        let sendData = {
            signalOp: 'SetAudio',
            userId: JSON.parse(sessionStorage.getItem("userInfo")).userId,
            reqDate: commonService.getReqDate(),
            roomId: sessionStorage.getItem("roomId"),
            status: true
        }
        commonService.sendSocketMessage(sendData)
    }
}

VideoService.prototype.setOffMic = function (data) {
    let remote = document.getElementById("remote")
    let remoteState = document.getElementById("remote-setVideo").getElementsByTagName("i")[1];
    if (data.status === false) {
        remote.muted = true;
        remoteState.style.display = '';
    } else {
        remote.muted = false;
        remoteState.style.display = 'none';
    }
}



VideoService.prototype.offVideo = function () {
    let videoIcon = document.getElementById("VideoIcon").textContent
    let local = document.getElementById("local");
    let localState = document.getElementById("local-setVideo").getElementsByTagName("i")[0];
    if (videoIcon === 'videocam') {
        document.getElementById("VideoIcon").textContent = 'videocam_off';
        local.style.display = 'none';
        localState.style.display = '';
        videoService.setOffVideo;

        let sendData = {
            signalOp: 'SetVideo',
            userId: JSON.parse(sessionStorage.getItem("userInfo")).userId,
            reqDate: commonService.getReqDate(),
            roomId: sessionStorage.getItem("roomId"),
            status: false
        }
        commonService.sendSocketMessage(sendData);
    } else {
        document.getElementById("VideoIcon").textContent = 'videocam';
        local.style.display = 'block';
        localState.style.display = 'none';
        let sendData = {
            signalOp: 'SetVideo',
            userId: JSON.parse(sessionStorage.getItem("userInfo")).userId,
            reqDate: commonService.getReqDate(),
            roomId: sessionStorage.getItem("roomId"),
            status: true
        }
        commonService.sendSocketMessage(sendData);
    }
}
VideoService.prototype.setOffVideo = function (data) {
    let remote = document.getElementById("remote");
    let remoteState = document.getElementById("remote-setVideo").getElementsByTagName("i")[0];
    if (data.status === false) {
        remote.style.display = 'none';
        remoteState.style.display = '';
    } else {
        remote.style.display = 'block';
        remoteState.style.display = 'none';
    }
}



VideoService.prototype.screenSharing = async function (isDraw) {
    // 1:1인지 N:N인지 구분 필요
    if (!isDraw) {
        if (!commonService.isSharing) {
            try {
                // ScreanSharing start
                console.log("화면 공유 시작");
                // session reserve
                let useMediaSvr = sessionStorage.getItem("useMediaSvr");
                if (useMediaSvr === 'Y') {
                    multiScreenShareService.sendScreenShareSessionReserve();
                } else {
                    oneAndOneScreenShareService.sendScreenShareSessionReserve();
                }
            } catch (e) {
                console.log("화면공유 취소", e);
            }
        } else {
            this.videoArrange();
        }
    }
};

document.addEventListener("DOMContentLoaded", () => {
    let stop_sharingBtn = document.getElementsByClassName('stop-sharing')[0];
    stop_sharingBtn.addEventListener('click', function (event) {
        event.preventDefault();
        commonService.setConfirm("화면 공유", screenShareCloseMsg,
            () => {
                let screenSharingVideo = document.getElementById('ScreenSharingVideo');
                let videoBox = document.getElementById('VideoBox');
                let pensizeTool = document.getElementById('pensizeTool').getElementsByClassName('on')[0]
                let penscolorTool = document.getElementById('penscolorTool').getElementsByClassName('on')[0];

                commonFn.removeClass(penscolorTool, "on");
                commonFn.removeClass(pensizeTool, "on");

                $('#color_black').addClass('on');
                $('#pen_small').addClass('on')

                sessionStorage.setItem("color", '#000000');
                sessionStorage.setItem("pen", 7);
                let isMulti = sessionStorage.getItem('useMediaSvr');
                if (isMulti === 'N') {
                    oneAndOneScreenShareService.screenShareConferenceEnd();
                    //getVideoTracks()[0].stop(); => 화면공유를 시작하면 하단에 공유중지, 숨기기 팝업이 뜨는데 그 팝업을 없애는 역할을 한다.
                    s_stream.getVideoTracks()[0].stop();
                } else if (isMulti === 'Y') {
                    multiScreenShareService.screenShareConferenceEnd();
                    if (screenStream) {
                        screenStream.getVideoTracks()[0].stop();
                    }
                    if (janusScreenShareStream) {
                        janusScreenShareStream.getVideoTracks()[0].stop();
                    }
                }
                if (screenSharingVideo.style.display !== 'none') {
                    screenSharingVideo.style.display = 'none';
                }
                // shpark 
                if (screenSharingVideo.style.display === 'none') {
                    screenSharingVideo.style.display = 'block';
                }
                if (videoBox.classList.contains('isSharing')) {
                    videoBox.classList.remove('isSharing')
                }

                let type = 'SS_UI_CANCEL';
                let text = 'cancel';
                window.postMessage({
                    type,
                    text,
                    isMulti
                }, '*');
                let typed = 'SS_DIALOG_CANCEL';
                let textd = 'cancel';
                window.postMessage({
                    typed,
                    textd
                }, '*');
                s_stream = null;
                screenStream = null;
                commonService.isSharing = false;
                // isSharer의 기본값이 true이므로 화면공유를 중지할 때 값이 false인 경우 true로 바꿔준다.
                isSharer = true;
                document.getElementsByClassName("stop-sharing")[0].style.display = "none";
                if (document.getElementById('screen-share-video')) {
                    document.getElementById('screen-share-video').remove();
                }
                return;
            }, () => {
                commonService.setCategory("screenSharing");
                categoryData = 'screenSharing';
                return;
            });
    });
})


VideoService.prototype.setScreenVideo = function (stream) {
    let videoBox = document.getElementById('VideoBox');
    let documentBox = document.getElementById('DocumentBox');
    let screenSharingVideo = document.getElementById('ScreenSharingVideo');
    let canvasArea = document.getElementById('canvas-area');

    let isVideo = document.getElementById('screen-share-video');
    if (isSharer === true) {
        document.getElementsByClassName('stop-sharing')[0].style.display = 'block';
    }
    // shpark 
    if (isSharer === false) {
        document.getElementsByClassName('stop-sharing')[0].style.display = 'none';
    }
    if (!isVideo) {
        let video = document.createElement('video');
        video.id = 'screen-share-video';
        video.style.width = '1250px';
        video.style.height = '610px';
        let thisObj = this;
        video.autoplay = true;
        if (stream) {
            video.srcObject = stream;
        }
        canvasArea.insertAdjacentElement('beforeend', video);
    }
    screenSharingVideo.style.display = 'block';
    commonService.isSharing = true;

    this.videoArrange();

    if (documentBox.style.display === 'block') {
        documentBox.style.display = 'none';
    }

    if (videoBox.classList.contains('isDocument')) {
        videoBox.classList.remove('isDocument')
    }
    document.querySelector(".loader").style.display = "none"
};
/**
 * 1:1 혹은 N:N 화상대화 video를 초기화
 * 1:1 혹은 N:N 화면 공유 video를 초기화
 * 문서공유 관련 canvas와 file list를 초기화 (참고! 화면공유 canvas 초기화 로직은 들어 있지 않다!)
 * videoReset 함수와 통합 필요
 */
VideoService.prototype.initializeVideoBox = function () {
    let videoBox = document.getElementById('one-to-one-video');
    let screenSharingVideo = document.getElementById('ScreenSharingVideo');
    let toolbox = document.getElementsByClassName('document-icon-box')[0];

    let documentVideoBox = document.getElementsByClassName('isDocument')[0];

    commonService.isDocument = false;
    if (documentVideoBox) {
        documentVideoBox.classList.remove('isDocument');
    }

    let view = document.getElementById('view');

    if (view) {
        view.classList.remove('open');
        let fileList = document.getElementsByClassName('document-file-list')[0];

        let files = document.getElementsByClassName('tit');
        fileList.style.display = 'none';

        if (files) {
            let len = files.length;
            for (let i = 0; i < len; i++) {
                files[0].remove();
            }
        }
        /**
         * canvas를 초기화 하는 로직 , 펜의 크기 종류 초기화 
         * @type {HTMLElement}
         */
        let canvas = document.getElementById('whiteboard');
        let imgCanvas = document.getElementById('imgboard');
        const context = canvas.getContext('2d');
        const imgContext = imgCanvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        imgContext.clearRect(0, 0, imgCanvas.width, imgCanvas.height);

    }
    if (toolbox) {
        toolbox.style.display = "none";
    }
    if (videoBox) {
        videoBox.innerHTML = '';
    }

    let multivideo = document.getElementById('multiVideo');

    if (multivideo) {
        multivideo.innerHTML = '';
    }

    screenSharingVideo.style.display = 'none';
    this.videoArrange();
};

/**
 * 화면공유를 받는 피 공유자의 video를 초기화 하는 함수
 */
VideoService.prototype.initializeScreenShareRemoteVideo = function () {
    commonService.isSharing = false;
    document.getElementsByClassName("stop-sharing")[0].style.display = "none";
    let remoteVideo = document.querySelector("#screen-share-video");
    if (remoteVideo) {
        remoteVideo.remove();
    }
    this.videoArrange();
};

VideoService.prototype.videoArrange = function () {
    let videoBox = document.getElementById('VideoBox');

    if (commonService.isSharing) {
        if (!videoBox.classList.contains('isSharing')) {
            videoBox.classList.add('isSharing');
        }
    } else {
        if (videoBox.classList.contains('isSharing')) {
            videoBox.classList.remove('isSharing');
        }
    }
};

VideoService.prototype.videoList = function () {
    let videoBox = document.getElementById('VideoBox');
    if (videoBox.classList.contains('isSharing')) {
        videoBox.classList.remove('isSharing');
    }

    if (videoBox.classList.contains('isDocument')) {
        videoBox.classList.remove('isDocument');
    }
};

VideoService.prototype.videoReset = () => {
    inMeeting = false;
    document.querySelector("#Sidebar").style.display = "";
    recordService.viewChg = 0;
    recordService.status = "ready";
    exceptionService.clearExitTimer();
    chatService.uploadChatLogs(sessionStorage.getItem("maker"));
    sessionStorage.removeItem("maker");

    if (mediaRecorder) {
        recordService.stop();
    }

    if (singleConferencePeer) {
        singleConferencePeer.close();
    }
    singleConferencePeer = new RTCPeerConnection(socketService.iceServer());
    if (kurentoPeer) {
        kurentoPeer.dispose();
        kurentoPeer = null;
    }

    let RecordInfo = document.getElementById("RecordInfo");
    RecordInfo.style.display = "none";
    RecordInfo.style.color = "";
    let recording = document.getElementById("Recording");
    recording.style.display = "none";

    let toolbox = document.getElementsByClassName('document-icon-box')[0];
    toolbox.style.display = "none";

    document.getElementById("local") ? document.getElementById("local").remove() : "";
    document.getElementById("remote") ? document.getElementById("remote").remove() : "";
    document.getElementById("multiVideo") ? document.getElementById("multiVideo").remove() : "";
    document.querySelector(".onetomany-video") ? document.querySelector(".onetomany-video").remove() : "";
    document.querySelector("#one-to-one-video") ? document.querySelector("#one-to-one-video").remove() : "";

    let videoSet = document.querySelectorAll("#VideoBox > dl");
    for (let i = 0; i < videoSet.length; i++) {
        videoSet[i].style.display = "none";
    }

    document.getElementById("DocumentBox").style.display = "none";
    document.getElementById("ScreenSharingVideo").style.display = "none";
    document.querySelector(".attendant-box").innerHTML = "";

    if (commonService.isSharing) {
        //TODO 190322. 화면공유 받는 사람이 exitroom 하는데 sessionreserveend 를 발송한다. 여기가 원인인데 어느 플래그가 원인인 지 모르겠다.
        oneAndOneScreenShareService.sessionReserveEnd();
        if (sessionStorage.getItem('useMediaSvr') === 'Y') {
            if (screenStream) {
                screenStream.getVideoTracks()[0].stop();
            }
        } else if (sessionStorage.getItem('useMediaSvr') === 'N') {
            if (s_stream) {
                s_stream.getVideoTracks()[0].stop();
            }
        }

        if (isSharer === true) {
            let sendData = {
                eventOp: "ScreenShareConferenceEnd",
                reqNo: commonService.getReqNo(),
                userId: JSON.parse(sessionStorage.getItem("userInfo")).userId,
                reqDate: commonService.getReqDate(),
                roomId: sessionStorage.getItem("roomId"),
                useMediaSvr: "N"
            };

            commonService.sendSocketMessage(sendData);
        }
        // ScreenShareConferenceEnd
        videoService.initializeScreenShareRemoteVideo();

        let type = 'SS_UI_CANCEL';
        let text = 'cancel';
        window.postMessage({
            type,
            text
        }, '*');
        document.querySelector(".loader").style.display = "none"
        let typed = 'SS_DIALOG_CANCEL';
        let textd = 'cancel';
        window.postMessage({
            typed,
            textd
        }, '*');
        commonService.isSharing = false;

        s_stream = null;
        screenStream = null;
    }

    if (commonService.isDocument) {
        commonService.isDocument = false;
        documentService.EndFileShare();
    }

    if (previewStream && previewStream.getVideoTracks() && previewStream.getVideoTracks()[0]) {
        previewStream.getVideoTracks()[0].stop();
    }
    if (previewStream && previewStream.getAudioTracks() && previewStream.getAudioTracks()[0]) {
        previewStream.getAudioTracks()[0].stop();
    }
    if (localStream && localStream.getVideoTracks() && localStream.getVideoTracks()[0]) {
        localStream.getVideoTracks()[0].stop();
    }
    if (localStream && localStream.getAudioTracks() && localStream.getAudioTracks()[0]) {
        localStream.getAudioTracks()[0].stop();
    }
    sessionStorage.removeItem('roomId');
    sessionStorage.removeItem('useMediaSvr');

    //janus
    let multiVideo = document.getElementById("multiVideo-local");
    if (multiVideo) multiVideo.srcObject = null;

    if (janusLocalStreamPeer) {
        janusLocalStreamPeer.close();
        janusLocalStreamPeer = null;
    }

    for (let key in janusRemoteStreams) {
        if (janusRemoteStreams[key] && janusRemoteStreams[key].getVideoTracks() && janusRemoteStreams[key].getVideoTracks()[0]) {
            janusRemoteStreams[key].getVideoTracks()[0].stop();
            if (janusRemoteStreams[key].getAudioTracks() && janusRemoteStreams[key].getAudioTracks()[0]) {
                janusRemoteStreams[key].getAudioTracks()[0].stop();
            }

            janusRemoteStreams[key] = null;
            delete janusRemoteStreams[key];
        }
    }

    for (let key in janusRemoteStreamPeers) {
        janusRemoteStreamPeers[key].close();
        janusRemoteStreamPeers[key] = null;
        delete janusRemoteStreamPeers[key];
        // console.log('deleted janusRemoteStreamPeers. ', key)
    }
    if (janusScreenShareStreamPeer) {
        janusScreenShareStreamPeer.close();
        janusScreenShareStreamPeer = null;
    }
    if (janusScreenShareStream && janusScreenShareStream.getVideoTracks()) {
        janusScreenShareStream.getVideoTracks()[0].stop();
    }
    for (let key in graphInterval) {
        window.clearInterval(graphInterval[key]);
    }

    bitrateSeries = {};
    bitrateGraph = {};
    packetSeries = {};
    packetGraph = {};
    lastResult = {};
    graphInterval = {};

    //janus end.
    document.getElementById("TopRoomInfo").innerHTML = "";
    document.getElementById("RoomInfo").style.display = "none";
    let stopBtn = document.getElementsByClassName('stop-sharing')[0];
    if (stopBtn) {
        stopBtn.style.display = 'none';
    }
    commonService.setMainMenu();
}

let videoService = new VideoService();