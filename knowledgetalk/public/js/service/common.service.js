let categoryData;

function CommonService() {
    this.userInfo = {
        userId: '',
        userName: '',
        userImg: 'test.png'
    };

    this.inputObj; //에러체크후 포커스 이동
    this.isSharing; //화면공유인지? 아닌지?
    this.isDocument; //문서공유인지? 아닌지?
    this.isPopup;
    this.confirmYCb;
    this.confirmNCb;
    this.toastMsg;
    writeAuth = false;
    writeAuthScreen = false;
    // this.roomSort;
}

//카테고리별 팝업창 보여주기
CommonService.prototype.setCategory = function (data, isDraw) {
    categoryData = data;

    let documentBox = document.getElementById('DocumentBox');
    let videoBox = document.getElementById('VideoBox');
    let screenSharingVideo = document.getElementById('ScreenSharingVideo');
    let mainMenuChild = document.querySelectorAll("#Mainmenu > li")
    let toolbox = document.querySelector('.document-icon-box');

    commonService.closeMessageBox();

    switch (commonService.isPopup) {
        case "inviteMessageBox":
            let joinReject = {
                eventOp: "Join",
                reqNo: commonService.getReqNo(),
                userId: JSON.parse(sessionStorage.getItem("userInfo")).userId,
                reqDate: commonService.getReqDate(),
                roomId: sessionStorage.getItem("roomId"),
                status: "reject"
            };
            commonService.sendSocketMessage(joinReject);
            commonService.closePopup(commonService.isPopup, true);
            break;
        case "confirmBox":
            commonService.confirmNCb();
        case "Invite":
        case "Join":
        case "MeetingList":
        case "Setting":
        case "Login":
        case "Signup":
        case "FriendList":
        case "InviteList":
        case "InfoEdit":
            commonService.closePopup(commonService.isPopup, true);
            break;
        default:
            break;
    }

    if (data !== 'login') {
        let mainMenuChild = document.querySelectorAll("#Mainmenu > li")

        for (let i = 3; i < mainMenuChild.length; i++) {
            let targetObj = mainMenuChild[i].getElementsByTagName("i");

            if (i === 6 && !inMeeting) {
                targetObj[0].style.color = "#CCC";
            } else if (i === 4 && inMeeting) {
                targetObj[0].style.color = "#CCC";
            } else {
                targetObj[0].style.color = "";
            }
        }
    }

    let category = '';
    switch (data) {
        case 'video':
            for (let i = 0; i < 3; i++) {
                mainMenuChild[i].getElementsByTagName("i")[0].style.color = i == 0 ? "#039be5" : "";
            }
            break;
        case 'document':
            for (let i = 0; i < 3; i++) {
                mainMenuChild[i].getElementsByTagName("i")[0].style.color = i == 1 ? "#039be5" : "";
            }
            break;
        case 'screenSharing':
            for (let i = 0; i < 3; i++) {
                mainMenuChild[i].getElementsByTagName("i")[0].style.color = i == 2 ? "#039be5" : "";
            }
            break;
        case 'invite':
            mainMenuChild[3].getElementsByTagName("i")[0].style.color = "#039be5";
            commonService.isPopup = category = 'Invite';
            break;
        case 'join':
            mainMenuChild[4].getElementsByTagName("i")[0].style.color = "#039be5";
            commonService.isPopup = category = 'Join';
            break;
        case 'meetingList':
            // mainMenuChild[4].getElementsByTagName("i")[0].style.color = "#039be5";
            commonService.isPopup = category = 'MeetingList';
            break;
        case 'setup':
            mainMenuChild[5].getElementsByTagName("i")[0].style.color = "#039be5";
            commonService.isPopup = category = 'Setting';
            break;
        case 'login':
            commonService.isPopup = category = 'Login';
            break;
        case 'signup':
            commonService.isPopup = category = 'Signup';
            commonService.resetMainMenu();
            break;
        case 'friend':
            commonService.isPopup = category = 'FriendList';
            document.querySelector("#SearchTab > a:nth-child(1)").click();
            break;
        case 'inviteList':
            commonService.isPopup = category = 'InviteList';
            break;
        case 'infoEdit':
            commonService.isPopup = category = 'InfoEdit';
            break;
        case 'receiveInvite':
            commonService.isPopup = category = 'inviteMessageBox';
            break;
        case 'recordVideo':
            commonService.isPopup = category = 'RecordVideo';
            break;
        case 'exit':
            // alert('종료');
            commonService.setConfirm("회의 종료", conferenceCloseMsg, () => {
                let sendData = {
                    eventOp: "ExitRoom",
                    reqNo: commonService.getReqNo(),
                    userId: JSON.parse(sessionStorage.getItem("userInfo")).userId,
                    userName: JSON.parse(sessionStorage.getItem("userInfo")).userName,
                    reqDate: commonService.getReqDate(),
                    roomId: sessionStorage.getItem('roomId')
                };
                commonService.sendSocketMessage(sendData);
                videoService.videoReset();
            });
            break;
        default:
            break;
    }

    if (data === 'video') {
        sessionStorage.setItem("lookat", "video");
        videoService.videoList();
        toolbox.style.display = "none";
        documentBox.style.display = 'none'
        screenSharingVideo.style.display = 'none';
        /**
         * 화면공유중 video 탭을 눌렀다가 다시 화면공유로 넘어올 경우 이미 draw했던 canvas를 초기화 할 지 안할지 구분하기 위해 if문이 들어감
         */
        if (commonService.isSharing === false) {
            screenShareCanvasService.displayNoneScreenCanvas();
        }
    }

    if (data === 'screenSharing') {
        /**
         * 문서공유중 화면공유로 전환 할 경우, 문서공유를 종료해야 한다.(SessionReserve 때문, 문서공유를 종료하지 않을시 SessionReserve 요청시 440 응답이 떨어진다.)
         * writeAuth === true : 문서공유자, false : 피공유자
         */
        if (writeAuth) {
            document.querySelector(".loader").style.display = "";
            commonService.setConfirm("자료공유", documentShareCloseMsg,
                () => {
                    document.getElementById('imgList').innerHTML = '';
                    documentService.EndFileShare();
                    sessionStorage.setItem("lookat", "screenshare");
                    document.getElementById('file-share-btn').style.display = 'none';
                    if (sessionStorage.getItem('useMediaSvr') === 'N') {
                        if (!s_stream) {
                            videoService.screenSharing();
                            whiteboard.setWhiteboard(data);
                            let screentool = document.querySelector('.screen-video')
                            //screentool.style.width = "97%"
                            toolbox.style.display = "";
                            document.getElementById('file-share-btn').style.display = 'none';
                        } else {
                            videoService.setScreenVideo(s_stream);
                        }
                    } else {
                        if (!screenStream) {
                            videoService.screenSharing();
                            whiteboard.setWhiteboard(data);
                            let screentool = document.querySelector('.screen-video')
                            //screentool.style.width = "97%"
                            toolbox.style.display = "";
                            document.getElementById('file-share-btn').style.display = 'none';
                        } else {
                            videoService.setScreenVideo(screenStream);
                        }
                    }
                }, () => {
                    console.log("취소");
                    commonService.setCategory("document");
                    // dim.style.display = "none";
                    document.querySelector(".loader").style.display = "none"
                });
        } else {
            sessionStorage.setItem("lookat", "screenshare");
            sessionStorage.setItem("color", '#000000');
            sessionStorage.setItem("pen", '7');
            whiteboard.color = '#000000';
            whiteboard.pen.thickness = 7;
            document.getElementById('file-share-btn').style.display = 'none';
            if (sessionStorage.getItem('useMediaSvr') === 'N') {
                if (!s_stream) {
                    videoService.screenSharing(isDraw);
                    whiteboard.setWhiteboard(data);
                    let screentool = document.querySelector('.screen-video')
                    //screentool.style.width = "97%"
                    toolbox.style.display = "none";
                    document.getElementById('file-share-btn').style.display = 'none';
                } else {
                    videoService.setScreenVideo(s_stream);
                }
            } else {
                if (!screenStream) {
                    videoService.screenSharing(isDraw);
                    whiteboard.setWhiteboard(data);
                    let screentool = document.querySelector('.screen-video')
                    //screentool.style.width = "97%"
                    toolbox.style.display = "";
                    document.getElementById('file-share-btn').style.display = 'none';
                } else {
                    videoService.setScreenVideo(screenStream);
                }
            }

        }
        // shpark - add 
        if (commonService.isSharing === true) {
            screenSharingVideo.style.display = 'block';
        }

        if (isSharer === true) {
            toolbox.style.display = "inline-block";
        } else {
            toolbox.style.display = 'none';
        }
        screenShareCanvasService.displayInlineBlockScreenCanvas();
        whiteboard.setWhiteboard('screenSharing');
    }

    if (data === 'document') {
        /**
         * 화면공유 중 문서공유를 할 경우 허가되는 사용자는 화면공유를 시작한 사람만 가능하도록 설정했다.
         * 이경우 문서공유를 하기 위해서는 화면공유를 중지한 후(SessionReserveEnd) 문서공유를 해야 한다.
         * isSharer의 값은 true(공유자), isSharing의 값도 true(화면공유 사용중) 일 경우이다. 즉 문서공유를 하기 위해서는 화면 공유를 중지해야 한다.
         * 반대로 isSharer의 값이 false이고 isSharing의 값이 true라면 화면공유 중이지만 화면공유를 시작한 사람이 아니므로 문서공유를 할 수 없다.
         * 만약 isSharing의 값이 false라면 회면공유 중이 아니므로 바로 문서공유가 가능하다.
         */
        if (isSharer === true && commonService.isSharing === true) {
            whiteboard.clear();
            document.getElementById('imgList').style.display = 'none';
            document.querySelector(".stop-document").style.display ='none';
            commonService.setConfirm("화면 공유", screenShareCloseMsg,
                () => {
                    sessionStorage.setItem("lookat", "document");
                    documentService.setDocument();
                    whiteboard.setWhiteboard(data);
                    sessionStorage.getItem("color");
                    sessionStorage.getItem("pen");
                    if (fileing === false) {
                        setTimeout(() => {
                            toolbox.style.display = "";
                        }, 100);
                    }
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

                    documentBox.style.display = 'block';
                    document.getElementById('file-share-btn').style.display = 'inline-block';
                    if (screenSharingVideo.style.display !== 'none') {
                        screenSharingVideo.style.display = 'none';
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
                    document.querySelector(".loader").style.display = "none"
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

                    if (document.getElementById('screen-share-video')) {
                        document.getElementById('screen-share-video').remove();
                    }
                    return;
                }, () => {
                    commonService.setCategory("screenSharing");
                    categoryData = 'screenSharing';
                    return;
                });
        } else if (isSharer === false && commonService.isSharing === true) {
            setTimeout(() => {
                commonService.messageBox('', screenSharingErr)
            }, 500);
            // mainMenuChild[2].getElementsByTagName("i")[0].style.color = "#039be5";
            // mainMenuChild[1].getElementsByTagName("i")[0].style.color = "" ;
            commonService.setCategory("screenSharing");
            categoryData = 'screenSharing';
            // videoService.setScreenVideo();
            return;
        } else {
            sessionStorage.setItem("lookat", "document");
            documentService.setDocument();
            whiteboard.setWhiteboard(data);
            sessionStorage.setItem("color", '#000000');
            sessionStorage.setItem("pen", '7');
            whiteboard.color = '#000000';
            whiteboard.pen.thickness = 7

            if (fileing === false) {
                toolbox.style.display = "";
            }
            documentBox.style.display = 'block';
            document.getElementById('file-share-btn').style.display = 'inline-block';

            if (screenSharingVideo.style.display === 'block') {
                screenSharingVideo.style.display = 'none';
            }
            if (videoBox.classList.contains('isSharing')) {
                videoBox.classList.remove('isSharing')
            }
        }

    }

    // if (data === 'invite' && inMeeting) {
    //     commonService.messageBox(
    //         "서버 공사 중",
    //         "현재 MCU에서 SFU로 변경 중으로 5월 초 까지 다자간 서비스 사용이 제한됩니다.",
    //         null);
    //     mainMenuChild[3].getElementsByTagName("i")[0].style.color = "";
    // }

    // if (data === 'join') {
    //     commonService.messageBox(
    //         "서버 공사 중",
    //         "현재 MCU에서 SFU로 변경 중으로 5월 초 까지 다자간 서비스 사용이 제한됩니다.",
    //         null);
    //     mainMenuChild[4].getElementsByTagName("i")[0].style.color = "";
    // }

    //비디오, 화면공유가 아닐경우에는 팝업창을 띄움.
    if (data !== 'video' && data !== 'screenSharing' && data !== 'document' && data !== 'exit') {
        let targetObj = document.getElementById(category);
        let dim = targetObj.parentNode.parentNode.getElementsByClassName('dim')[0];
        let popup = targetObj.parentNode.parentNode;

        let animateObj = targetObj.parentNode;

        targetObj.style.display = 'block';
        dim.style.display = 'block';
        popup.style.display = 'block';

        if (data === "login") {
            document.getElementById("LoginId").focus();
        }

        if (data === 'invite') {
            inviteService.getFriendList();
        }

        if (data === 'meetingList') {
            meetingListService.getMeetingList();
        }

        if (data === "setup") {
            let audioInputSelect = document.querySelector("#audioSource");
            let videoSelect = document.querySelector("#videoSource");
            if (sessionStorage.getItem("useMediaSvr") === "Y") {
                audioInputSelect.disabled = true;
                videoSelect.disabled = true;
            } else {
                audioInputSelect.disabled = false;
                videoSelect.disabled = false;
            }
            setupService.optionSelect()

            let preview = document.querySelector(".camera-view");
            let previewVideo = document.createElement("video");
            preview.appendChild(previewVideo);

            navigator.mediaDevices.getUserMedia(setupService.settingOption)
                .then(stream => {
                    previewStream = stream;
                    previewVideo.style.width = "300px";
                    previewVideo.style.height = "240px";
                    previewVideo.srcObject = stream;
                    previewVideo.autoplay = true;
                    previewVideo.id = "previewVideo";
                })
                .catch(err => {
                    if (previewVideo) {
                        previewVideo.remove();
                    }
                    console.log(err)
                });
        }

        if (!animateObj.classList.contains('fadeIn')) {
            animateObj.classList.add('fadeIn');
            dim.classList.add('fadeIn');
            //에니메이션이 끝났을 경우 현상태를 유지함.
            animateObj.addEventListener('animationend', function () {
                popup.style.display = 'block';
                dim.style.display = 'block';
                targetObj.style.display = 'block';
            });
        }
    }
}

CommonService.prototype.setConfirm = (title, msg, callbackY, callbackN) => {
    document.getElementById('MessagePopup').style.display = 'none';

    switch (commonService.isPopup) {
        case "inviteMessageBox":
            let joinReject = {
                eventOp: "Join",
                reqNo: commonService.getReqNo(),
                userId: JSON.parse(sessionStorage.getItem("userInfo")).userId,
                reqDate: commonService.getReqDate(),
                roomId: sessionStorage.getItem("roomId"),
                status: "reject"
            };
            commonService.sendSocketMessage(joinReject);
            commonService.closePopup(commonService.isPopup, true);
            break;
        case "confirmBox":
            commonService.confirmNCb();
        case "Invite":
        case "MeetingList":
        case "Setting":
        case "Login":
        case "Signup":
        case "FriendList":
        case "InviteList":
        case "InfoEdit":
            commonService.closePopup(commonService.isPopup, true);
            break;
        default:
            break;
    }

    document.querySelector("#confirmOk").removeEventListener("click", commonService.confirmYCb);
    document.querySelector("#confirmOk").addEventListener("click", callbackY);
    document.querySelector("#confirmCancel").removeEventListener("click", commonService.confirmNCb);
    document.querySelector("#confirmCancel").addEventListener("click", callbackN);
    commonService.confirmYCb = callbackY;
    commonService.confirmNCb = callbackN
    commonService.isPopup = 'confirmBox';

    document.querySelector("#confirmBox > .popup-title").innerText = title;
    document.querySelector("#confirmBox > .popup-content > p").innerText = msg;

    let targetObj = document.getElementById('confirmBox');
    let dim = targetObj.parentNode.parentNode.querySelector(".dim");
    let popup = targetObj.parentNode.parentNode;

    popup.style.display = 'block';
    dim.style.display = 'block';
    targetObj.style.display = 'block';
}

CommonService.prototype.setMainMenu = () => {
    let mainMenuChild = document.querySelectorAll("#Mainmenu > li")

    for (let i = 0; i < mainMenuChild.length; i++) {
        let targetObj = mainMenuChild[i].getElementsByTagName("i");

        if ((i < 3 || i === 6) && !inMeeting) {
            targetObj[0].style.color = "#CCC";
        } else if (i === 4 && inMeeting) {
            targetObj[0].style.color = "#CCC";
        } else {
            targetObj[0].style.color = "";
        }
    }
}

CommonService.prototype.resetMainMenu = () => {
    let mainMenuChild = document.querySelectorAll("#Mainmenu > li")

    for (let i = 0; i < mainMenuChild.length; i++) {
        let targetObj = mainMenuChild[i].getElementsByTagName("i");

        targetObj[0].style.color = "#CCC";
    }
}

/**
 * input박스의 validate값을 체크
 */
CommonService.prototype.inputValidate = function (obj, msg) {

    if (obj.value === undefined || obj.value === null || obj.value === '') {
        if (!obj.classList.contains('error')) {
            obj.classList.add('error');
        }

        //에러메세지가 있는 경우 키보드를 업했을경우
        //값이 있는경우 error클래스 삭제,
        //값이 없는경우 error클래스 추가
        obj.addEventListener('keyup', function () {
            if (obj.value !== '' && obj.value !== undefined) {
                this.classList.remove('error');
            } else {
                this.classList.add('error');
            }
        });

        return false;
    } else {
        return true;
    }
}

/**
 * 에러메세지를 보여줌.
 */
CommonService.prototype.messageBox = function (title = '에러메세지', msg = '에레메세지 내용', obj) {
    commonService.closeMessageBox();

    let messagePopup = document.getElementById('MessagePopup');
    let messageBox = document.getElementById('MessageBox');
    let messageTitle = document.getElementById('MessageTitle');
    let messageContent = document.getElementById('MessageContent');
    let messageDim = document.getElementById('MessageDim');

    commonService.inputObj = obj;
    messageTitle.innerHTML = title;
    messageContent.innerHTML = msg;

    messagePopup.style.display = 'block';

    if (!messageBox.classList.contains('openMessage')) {
        if (messageBox.classList.contains('closeMessage')) {
            messageBox.classList.remove('closeMessage');
            messageDim.classList.remove('fadeOut');
        }
        messageBox.classList.add('openMessage');
        messageDim.classList.add('fadeIn');
    };

    messageDim.addEventListener('animationend', function () {
        messagePopup.style.display = 'block';
    })

};

CommonService.prototype.closeMessageBox = function () {

    let messageBox = document.getElementById('MessageBox');
    let messagePopup = document.getElementById('MessagePopup');
    let messageDim = document.getElementById('MessageDim');

    if (messageBox.classList.contains('openMessage')) {
        messageBox.classList.remove('openMessage');
        messageDim.classList.remove('fadeIn');
    }

    messageBox.classList.add('closeMessage');
    messageDim.classList.add('fadeOut');

    messageDim.addEventListener('animationend', function () {
        messagePopup.style.display = 'none';
    })

    if (commonService.inputObj !== null && typeof (commonService.inputObj) != 'undefined') {
        commonService.inputObj.focus();
    }

}

/**
 * 열려져 있는 팝업창을 닫음.
 */
CommonService.prototype.closePopup = function (obj, noAni) {
    commonService.isPopup = "";
    let mainMenuChild = document.querySelectorAll("#Mainmenu > li")
    let priviewVideo = document.getElementById("previewVideo");
    let recordVideo = document.getElementById("recordVideoSet");

    if (priviewVideo) {
        priviewVideo.remove();
    }
    recordVideo.src = "";
    recordVideo.onended = null;

    for (let i = 3; i < mainMenuChild.length; i++) {
        let targetObj = mainMenuChild[i].getElementsByTagName("i");

        if (sessionStorage.getItem("userInfo")) {
            if (i === 6 && !inMeeting) {
                targetObj[0].style.color = "#CCC";
            } else if (i === 4 && inMeeting) {
                targetObj[0].style.color = "#CCC";
            } else {
                targetObj[0].style.color = "";
            }
        }
    }

    let closeObj = document.getElementById(obj);
    let animateObj = closeObj.parentNode;
    let dim = closeObj.parentNode.parentNode.getElementsByClassName('dim')[0];
    let popup = closeObj.parentNode.parentNode;

    if (noAni) {
        popup.style.display = 'none';
        dim.style.display = 'none';
        closeObj.style.display = 'none';

        if (!closeObj.parentNode.classList.contains('fadeOut')) {
            animateObj.classList.remove('fadeIn');
            dim.classList.remove('fadeIn');
        }
    } else {
        if (!closeObj.parentNode.classList.contains('fadeOut')) {
            animateObj.classList.remove('fadeIn');
            dim.classList.remove('fadeIn');
            animateObj.classList.add('fadeOut');
            dim.classList.add('fadeOut');
        }

        //에니메이션이 끝났을 경우 해당 이벤트 발생.
        animateObj.addEventListener('animationend', function () {
            popup.style.display = 'none';
            dim.style.display = 'none';
            closeObj.style.display = 'none';
            this.classList.remove('fadeOut');
            dim.classList.remove('fadeOut');
        });
    }
}

/**
 * 좌측사이드바 열기
 */
CommonService.prototype.openSidebar = function () {
    let sidebar = document.getElementById('Sidebar');
    // let sidebarDim = document.getElementById('SidebarDim');
    let sidebarBtn = document.getElementById('SidebarBtn');

    sidebarBtn.children[0].style.display = 'none';
    sidebarBtn.children[1].style.display = '';

    if (sidebar.classList.contains('leftSidebarClose')) {
        sidebar.classList.remove('leftSidebarClose');
    }

    if (!sidebar.classList.contains('leftSidebarOpen')) {
        // sidebarDim.style.display = 'block';
        sidebar.classList.add('leftSidebarOpen');
    }
}


CommonService.prototype.closeSidebar = function () {
    let sidebar = document.getElementById('Sidebar');
    // let sidebarDim = document.getElementById('SidebarDim');
    let sidebarBtn = document.getElementById('SidebarBtn');

    sidebarBtn.children[0].style.display = '';
    sidebarBtn.children[1].style.display = 'none';

    if (sidebar.classList.contains('leftSidebarOpen')) {
        sidebar.classList.remove('leftSidebarOpen');
    }

    if (!sidebar.classList.contains('leftSidebarClose')) {
        // sidebarDim.style.display = 'none';
        sidebar.classList.add('leftSidebarClose');
    }
}

/**
 * 소켓으로 메세지보내는 부분
 */
CommonService.prototype.sendSocketMessage = function (param) {
    switch (param.eventOp) {
        case "Call":
            exceptionService.targetLength = param.targetId.length;
            break;
        case "Join":
            // if (exceptionService.timer) {
            //     clearInterval(exceptionService.timer);
            // }
            // exceptionService.setExitTimer(15);
            break;
        case "SDP":
            if (param.sdp && param.sdp.type === "offer") {
                // if (exceptionService.targetLength == 0 && exceptionService.timer) {
                //     clearInterval(exceptionService.timer);
                // } else if (exceptionService.targetLength == 0) {
                //     exceptionService.setExitTimer(45)
                // }
            } else if (param.sdp && param.sdp.type === "answer") {
                commonFn.setWhiteBoardLayout();
            }
            break;
        case "GuestJoin":
            if (exceptionService.timer) {
                clearInterval(exceptionService.timer);
            }
            if (exceptionService.targetLength == 0) {
                exceptionService.setResponseTimer(30, "join");
            }
            break;
        case "ExitRoom":
            if (param.roomId === "" || param.roomId === null || typeof param.roomId === "undefined" || !param.roomId) {
                return false;
            }
            // case "Candidate":
            //     exceptionService.clearExitTimer(candidateTimer);
            //     candidateTimer = null;
            //     candidateTimer = exceptionService.setExitTimer(30);
            //     break;
    }
    // logBox('send', param);
    // console.log(":::: socket으로 메세지를 보냄 :::", param);
    clientIo.emit('knowledgetalk', param);
};

CommonService.prototype.remoteWhiteboardSetCenter = function () {
    document.querySelector(".document-canvas").style.left = "4%"
    document.querySelector(".picture").style.left = "4%"
}
CommonService.prototype.remoteWhiteboardSetRight = function () {
    document.querySelector(".document-canvas").style.left = "10%"
    document.querySelector(".picture").style.left = "10%"
}
/**
 * 채팅에서 시간을 가져오는 함수
 */
CommonService.prototype.getDate = function () {
    let currentTime;
    let now = new Date();
    //let years = now.getFullYear();
    let months = now.getMonth() + 1;
    let days = now.getDate();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    let apm;

    if (months < 10) {
        months = "0" + months;
    }

    if (days < 10) {
        days = "0" + days;
    }

    if (hours < 12) {
        apm = "오전";
    } else {
        apm = "오후";
        if (hours >= 12) {
            hours = hours - 12;
        }
    }

    if (hours < 10) {
        hours = "0" + hours;
    }

    if (minutes < 10) {
        minutes = "0" + minutes;
    }
    currentTime = months + "." + days + " ( " + apm + " " + hours + ":" + minutes + " )";
    return currentTime;
}

/**
 * 현재시간을 가져오는 함수 ("yyyyMMddHHmmssms")
 */
CommonService.prototype.getReqDate = function () {

    let reqDate = new Date().format('yyyyMMddHHmmssms');
    return reqDate;
};

/**
 * reqNo(7자리 숫자)값을 String 형태로 return 하는 함수
 * @returns {string}
 */
CommonService.prototype.getReqNo = function () {
    let reqNo = "";

    function randomRange(n1, n2) {
        return Math.floor((Math.random() * (n2 - n1 + 1)) + n1);
    }

    for (let i = 0; i < 7; i++) {
        reqNo += randomRange(0, 9).toString();
    }
    return reqNo;
};

/**
 * pw 암호화(SHA256)
 */
CommonService.prototype.SHA256 = function (s) {
    var chrsz = 8;
    var hexcase = 0;

    function safe_add(x, y) {
        var lsw = (x & 0xFFFF) + (y & 0xFFFF);
        var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
        return (msw << 16) | (lsw & 0xFFFF);
    }

    function S(X, n) {
        return (X >>> n) | (X << (32 - n));
    }

    function R(X, n) {
        return (X >>> n);
    }

    function Ch(x, y, z) {
        return ((x & y) ^ ((~x) & z));
    }

    function Maj(x, y, z) {
        return ((x & y) ^ (x & z) ^ (y & z));
    }

    function Sigma0256(x) {
        return (S(x, 2) ^ S(x, 13) ^ S(x, 22));
    }

    function Sigma1256(x) {
        return (S(x, 6) ^ S(x, 11) ^ S(x, 25));
    }

    function Gamma0256(x) {
        return (S(x, 7) ^ S(x, 18) ^ R(x, 3));
    }

    function Gamma1256(x) {
        return (S(x, 17) ^ S(x, 19) ^ R(x, 10));
    }

    function core_sha256(m, l) {

        var K = new Array(0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5, 0x3956C25B, 0x59F111F1,
            0x923F82A4, 0xAB1C5ED5, 0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3,
            0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174, 0xE49B69C1, 0xEFBE4786,
            0xFC19DC6, 0x240CA1CC, 0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA,
            0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7, 0xC6E00BF3, 0xD5A79147,
            0x6CA6351, 0x14292967, 0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13,
            0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85, 0xA2BFE8A1, 0xA81A664B,
            0xC24B8B70, 0xC76C51A3, 0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070,
            0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5, 0x391C0CB3, 0x4ED8AA4A,
            0x5B9CCA4F, 0x682E6FF3, 0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208,
            0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2);

        var HASH = new Array(0x6A09E667, 0xBB67AE85, 0x3C6EF372, 0xA54FF53A, 0x510E527F, 0x9B05688C, 0x1F83D9AB, 0x5BE0CD19);

        var W = new Array(64);
        var a, b, c, d, e, f, g, h, i, j;
        var T1, T2;

        m[l >> 5] |= 0x80 << (24 - l % 32);
        m[((l + 64 >> 9) << 4) + 15] = l;

        for (var i = 0; i < m.length; i += 16) {
            a = HASH[0];
            b = HASH[1];
            c = HASH[2];
            d = HASH[3];
            e = HASH[4];
            f = HASH[5];
            g = HASH[6];
            h = HASH[7];

            for (var j = 0; j < 64; j++) {
                if (j < 16) W[j] = m[j + i];
                else W[j] = safe_add(safe_add(safe_add(Gamma1256(W[j - 2]), W[j - 7]), Gamma0256(W[j - 15])), W[j - 16]);

                T1 = safe_add(safe_add(safe_add(safe_add(h, Sigma1256(e)), Ch(e, f, g)), K[j]), W[j]);
                T2 = safe_add(Sigma0256(a), Maj(a, b, c));

                h = g;
                g = f;
                f = e;
                e = safe_add(d, T1);
                d = c;
                c = b;
                b = a;
                a = safe_add(T1, T2);
            }

            HASH[0] = safe_add(a, HASH[0]);
            HASH[1] = safe_add(b, HASH[1]);
            HASH[2] = safe_add(c, HASH[2]);
            HASH[3] = safe_add(d, HASH[3]);
            HASH[4] = safe_add(e, HASH[4]);
            HASH[5] = safe_add(f, HASH[5]);
            HASH[6] = safe_add(g, HASH[6]);
            HASH[7] = safe_add(h, HASH[7]);
        }
        return HASH;
    }

    function str2binb(str) {
        var bin = Array();
        var mask = (1 << chrsz) - 1;
        for (var i = 0; i < str.length * chrsz; i += chrsz) {
            bin[i >> 5] |= (str.charCodeAt(i / chrsz) & mask) << (24 - i % 32);
        }
        return bin;
    }

    function Utf8Encode(string) {
        string = string.replace(/\r\n/g, "\n");
        var utftext = "";

        for (var n = 0; n < string.length; n++) {

            var c = string.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if ((c > 127) && (c < 2048)) {
                utftext += String.fromCharCode((c >> 6) | 192);
                utftext += String.fromCharCode((c & 63) | 128);
            } else {
                utftext += String.fromCharCode((c >> 12) | 224);
                utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                utftext += String.fromCharCode((c & 63) | 128);
            }

        }

        return utftext;
    }

    function binb2hex(binarray) {
        var hex_tab = hexcase ? "0123456789ABCDEF" : "0123456789abcdef";
        var str = "";
        for (var i = 0; i < binarray.length * 4; i++) {
            str += hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8 + 4)) & 0xF) +
                hex_tab.charAt((binarray[i >> 2] >> ((3 - i % 4) * 8)) & 0xF);
        }
        return str;
    }

    s = Utf8Encode(s);
    return binb2hex(core_sha256(str2binb(s), s.length * chrsz));
}


/**
 * Date 함수에 prototype으로 format 추가
 * @param f
 * @returns {*}
 */
Date.prototype.format = function (f) {
    if (!this.valueOf()) return " ";

    var weekName = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
    var d = this;
    return f.replace(/(yyyy|yy|MM|dd|E|hh|mm|ss|a\/p|ms)/gi, function ($1) {
        switch ($1) {
            case "yyyy":
                return d.getFullYear();
            case "yy":
                return (d.getFullYear() % 1000).zf(2);
            case "MM":
                return (d.getMonth() + 1).zf(2);
            case "dd":
                return d.getDate().zf(2);
            case "E":
                return weekName[d.getDay()];
            case "HH":
                return d.getHours().zf(2);
            case "hh":
                return ((h = d.getHours() % 12) ? h : 12).zf(2);
            case "mm":
                return d.getMinutes().zf(2);
            case "ss":
                return d.getSeconds().zf(2);
            case "a/p":
                return d.getHours() < 12 ? "오전" : "오후";
            case "ms":
                return d.getMilliseconds();
            default:
                return $1;
        }
    });
};


String.prototype.string = function (len) {
    var s = '',
        i = 0;
    while (i++ < len) {
        s += this;
    }
    return s;
};
String.prototype.zf = function (len) {
    return "0".string(len - this.length) + this;
};
Number.prototype.zf = function (len) {
    return this.toString().zf(len);
};


const commonService = new CommonService();

let reqNo = -1;
var consultingTime;

function CommonFn() {}


//요청번호를 Random으로 생성
CommonFn.prototype.getReqNo = function () {

    /*//7자리 랜덤수를 만들기 위한 설정, 8자리인 경우 100000000
    const numLength   = 7;
    const multiNumber = 10000000;

    let result = Math.floor(Math.random() * multiNumber).toString();

    //자리수가 7자리보다 작은경우 뒷자리릉 0으로 채움.
    if(result.length < numLength){
        let zero = "";
        for(let i=0; i<(numLength - result.length); i++){
            zero += '0';
        }
        result += zero;
    }*/

    reqNo += 2;

    if (!reqNo) {
        reqNo = 0;
    }

    //클라이언트에서 요청은 홀수로 처리..짝수값이 나왔을 경우 홀수로 변경
    if (Number(reqNo) % 2 == 0) {
        ++reqNo;
    }

    return reqNo.toString();
};

//요청한 날짜를 반환.
CommonFn.prototype.getReqDate = function () {
    const today = new Date();
    const ss = today.getSeconds();
    const mi = today.getMinutes();
    const hh = today.getHours();
    const dd = today.getDate();
    const mm = today.getMonth() + 1;
    const yyyy = today.getFullYear();
    return this.addZero(yyyy) + '' + this.addZero(mm) + '' + this.addZero(dd) + '' + this.addZero(hh) + '' + this.addZero(mi) + '' + this.addZero(ss);
};

//요청한 날짜를 반환.
CommonFn.prototype.getTodayDate = function () {
    const today = new Date();
    const dd = today.getDate();
    const mm = today.getMonth() + 1;
    const yyyy = today.getFullYear();
    return this.addZero(yyyy) + '. ' + this.addZero(mm) + '. ' + this.addZero(dd);
};

//10보다 작은 숫자는 앞에 0을 붙여서 리턴
CommonFn.prototype.addZero = function (num) {
    let value = num;

    if (num < 10) {
        value = '0' + num;
    }

    return value;
}


CommonFn.prototype.startConsultingTime = function () {
    let TodayTime = document.querySelector('#meetTime');
    let TodayTime2 = document.querySelector('#meetTime2');
    let timeObj = this;
    let yy = 0;
    let mm = 0;
    let ss = 0;
    let todayTime = '- - : - -';
    if (!consultingTime) {
        consultingTime = setInterval(function () {
            ss++;
            if (ss >= 60) {
                ss = 0;
                mm++;
            }
            if (mm >= 60) {
                mm = 0;
                yy++;
            }
            todayTime = timeObj.addZero(yy) + " : " + timeObj.addZero(mm) + " : " + timeObj.addZero(ss);
            TodayTime.innerText = todayTime;
            TodayTime2.innerText = todayTime;
        }, 1000)
    }
}

CommonFn.prototype.date = function (date, param) {
    const _date = new Date(date);
    const yyyy = this.addZero(_date.getFullYear()),
        mm = this.addZero(_date.getMonth() + 1),
        dd = this.addZero(_date.getDate()),
        hh = this.addZero(_date.getHours()),
        mi = this.addZero(_date.getMinutes()),
        ss = this.addZero(_date.getSeconds())

    let result = '';

    switch (param) {
        case 'date':
            result = yyyy + '.' + mm + '.' + dd;
            break;
        case 'hhmm':
            result = hh + ':' + mi;
            break;
        case 'hhmmss':
            result = hh + ':' + mi + ':' + ss;
            break;
        default:
            result = yyyy + '.' + mm + '.' + dd + ' / ' + hh + ':' + mi;
    }

    return result;
}


CommonFn.prototype.whiteBoardButtonClick = function (people) {
    setWhiteBoardLayout(people);

    if (people === 'shareowner') {
        screen_unshareButton.style.display = 'inline-block';
        screen_reset.style.display = 'inline-block';
        btn.classList.add('gray');
    } else {
        screen_unshareButton.style.display = 'none';
        screen_reset.style.display = 'none';
        invite.style.display = 'none';
        exit2.style.display = 'none';
        btn.classList.remove('gray');
    }
}


CommonFn.prototype.setLocalWhiteBoardLayout = function () {

    // service.style.display = 'block';
    article.classList.add('whiteboard');

    friend_list.classList.remove('on');
    id_list.classList.remove('on');
    meet_room.classList.remove('on');
    local_room.classList.add('on');

    list.style.display = 'none';
    meet.style.display = 'none';
    white.style.display = 'none';
    fdlist.style.display = 'none';

    meet_button.style.display = 'block';
    invite.style.display = 'none';
    exit2.style.display = 'none';
    shareDropDown.style.display = 'none';

    local_view.style.display = 'block';
    view2.style.height = '-webkit-fill-available';
    shareView2.style.display = 'block';
    aside.style.display = 'block';
    local_exit.style.display = 'block';
    white_exit.style.display = 'none';
    white_invite.style.display = 'none';


    info.style.display = 'none';
    editor.style.display = 'none';

}

CommonFn.prototype.whiteBoardShareExit = function () {
    //shareEventExit();
    this.resetWhiteBoard();
}

CommonFn.prototype.resetWhiteBoard = function () {
    screen_unshareButton.style.display = 'none';
    screen_reset.style.display = 'none';
    invite.style.display = 'inline-block';
    exit2.style.display = 'inline-block';

}

CommonFn.prototype.meetStartLayout = function () {
    meet_room.classList.add('on');
    fd_list.classList.remove('on');
    id_list.classList.remove('on');
    local_room.classList.remove('on');
    article.classList.remove('whiteboard');
    ServiceBox.style.display = 'block';
    service.style.display = 'block';
    list.style.display = 'none';
    fdlist.style.display = 'none';
    local_view.style.display = 'none';
    meet.style.display = 'block';
    meet_button.style.display = 'block';
    shareView2.style.display = 'none';
    invite.style.display = 'inline-block';
    exit2.style.display = 'inline-block';
    aside.style.display = "none";
    invite.classList.add('large');
    exit2.classList.add('large');
    document.querySelector('#Service-Box').classList.remove('auto');

}

// 완료 건들지 말자.
CommonFn.prototype.localStartLayout = function () {
    local_room.classList.add('on');
    article.classList.add('whiteboard');
    meet_room.classList.remove('on');
    fd_list.classList.remove('on');
    id_list.classList.remove('on');

    ServiceBox.style.display = 'block';
    service.style.display = 'block';

    list.style.display = 'none';
    fdlist.style.display = 'none';
    meet.style.display = 'none';
    my_page.style.display = 'none';
    local_view.style.display = 'block';

    meet_button.style.display = 'block';
    view2.style.display = '100%';
    shareView2.style.display = 'block';
    local_exit.style.display = 'block';

    aside.style.display = 'block';
    white_exit.display = 'none';
    white_invite.display = 'none';

    info.style.display = 'none';
    editor.style.display = 'none';

    invite.style.display = 'none';
    exit2.style.display = 'none';
    document.querySelector('#Service-Box').classList.remove('auto');
}


CommonFn.prototype.friendStartLayout = function () {
    fd_list.classList.add('on');
    id_list.classList.remove('on');
    meet_room.classList.remove('on');
    local_room.classList.remove('on');
    article.classList.remove('whiteboard');
    local_view.style.display = 'none';
    local_exit.style.display = 'none';
    white.style.display = 'none';
    ServiceBox.style.display = 'block'
    service.style.display = 'block';
    meet_button.style.display = 'none';
    list.style.display = 'none';
    meet.style.display = 'none';
    fdlist.style.display = 'block';
    my_page.style.display = 'none';
}

CommonFn.prototype.setWhiteBoardLayout = function () {
    let video = document.querySelector('.screen-video video')
    if (video) {
        video.style.height = $('.screen-video').height() + "px";
    }
    whiteboard.mainCanvas2.height = $('.screen-video').height();
    whiteboard.mainCanvas2.width = $('.screen-video').width();
}
CommonFn.prototype.setWhiteBoardLayoutDocument = function () {
    whiteboard.mainCanvas.width = $('.document-canvas').width();
    whiteboard.mainCanvas.height = $('.document-canvas').height();
    whiteboard.subCanvas.width = $('.document-canvas').width();
    whiteboard.subCanvas.height = $('.document-canvas').height();
}

function shareEventExit() {
    meet_room.classList.add('on');
    id_list.classList.remove('on');
    article.classList.remove('whiteboard');
    service.style.display = 'block';
    list.style.display = 'none';
    meet.style.display = 'block';
    meet_button.style.display = 'block';
    white.style.display = 'none';
    aside.style.display = "none";
    my_page.style.display = 'none';
    btn.classList.add('gray');
}


CommonFn.prototype.hasClass = function (el, className) {
    if (el.classList)
        return el.classList.contains(className)
    else
        return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
}
CommonFn.prototype.addClass = function (el, className) {
    if (el.classList)
        el.classList.add(className)
    else if (!hasClass(el, className))
        el.className += " " + className
}
CommonFn.prototype.removeClass = function (el, className) {
    if (el.classList)
        el.classList.remove(className)
    else if (hasClass(el, className)) {
        var reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
        el.className = el.className.replace(reg, ' ')
    }
}

CommonFn.prototype.removeClassAll = function (el, className) {
    el.className = ' ';
}



let commonFn = new CommonFn();