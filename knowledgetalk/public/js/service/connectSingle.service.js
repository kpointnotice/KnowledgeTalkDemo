function ConnectSingleService() { }

ConnectSingleService.prototype.recieveCall = function (data) {
    if (data.code != 200) {
        console.log("Call err : ", data)
    } else {
        sessionStorage.setItem("roomId", data.roomId);
        navigator.getUserMedia(setupService.settingOption, singleConferenceService.successAnswerCallback, errorCallback);
    }
    chatService.resetMessage();
};

ConnectSingleService.prototype.recieveJoin = function (data) {
    if (data.memberList.length > 1) {
        singleConferenceService.createCamOfferObj();

        let myId = JSON.parse(sessionStorage.getItem("userInfo")).userId;
        let attendant_box = document.querySelector(".attendant-box");
        let attendant_list = `<a class="tooltipped" data-position="left" data-tooltip="${myId}"><i class="material-icons">person</i></a>`;
        for (let i = 0; i < data.memberList.length; i++) {
            if (data.memberList[i] != myId)
                attendant_list += `<a class="tooltipped" data-position="left" data-tooltip="${data.memberList[i]}"><i class="material-icons">person</i></a>`;
        }
        attendant_box.innerHTML = attendant_list

        let elems = document.querySelectorAll('.tooltipped');
        let instances = M.Tooltip.init(elems);
    }
    chatService.resetMessage();
};

ConnectSingleService.prototype.recieveSdp = function (data) {
    if (data.sdp) {
        if (data.sdp.type === 'offer' && data.usage === 'cam') {
            singleConferenceService.respCamSdp(data.reqNo);
            singleConferenceService.createCamAnswerObj(data);
        } else if (data.sdp.type === 'answer' && data.usage === 'cam') {
            singleConferenceService.setRemoteSdpObj(data);
        } else if (data.sdp.type === 'offer' && data.usage === 'screen') {
            screenPearConnection = new RTCPeerConnection(socketService.iceServer());
            document.querySelector('.stop-sharing').style.display = 'none'
            /**
             * 화면공유를 받는 피 공유자의 로직으로 isSharer의 값이 false가 된다(기본값은 true 이다.)
             */

            isSharer = false;
            commonService.isSharing = true;
            commonService.isDocument = false;
            commonService.setCategory('screenSharing');
            screenShareCanvasService.displayInlineBlockScreenCanvas();
            oneAndOneScreenShareService.respScreenSdp(data.reqNo);
            oneAndOneScreenShareService.createScreenShareAnswerObj(data);
            whiteboard.setWhiteboard('screenSharing')
        } else if (data.sdp.type === 'answer' && data.usage === 'screen') {
            /**
             * 화면공유를 하는 공유자의 로직으로 isSharer의 기본 값이 true 이므로 별도의 값 변경이 필요가 없다.
             */
            oneAndOneScreenShareService.setScreenRemoteSdpObj(data);
            oneAndOneScreenShareService.sendScreenCandidate();

            // x 버튼 지우기
        }
    } else {
        console.log("무시")
    }
};

ConnectSingleService.prototype.recieveCandidate = function (data) {
    if (data.candidate && data.usage === "cam") {
        singleConferencePeer.addIceCandidate(new RTCIceCandidate(data.candidate));
        singleConferenceService.sendCandidateResp(data.reqNo);
    } else if (data.candidate && data.usage === "screen") {
        screenPearConnection.addIceCandidate(new RTCIceCandidate(data.candidate));

        oneAndOneScreenShareService.sendScreenCandidateResp(data.reqNo);
    } else {
        console.log("no candidate data");
    }
}

let connectSingleService = new ConnectSingleService();

