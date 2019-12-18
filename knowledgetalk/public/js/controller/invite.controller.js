document.addEventListener("DOMContentLoaded", function () {
  let friendList = document.getElementById("InviteFriendList");
  let friendListScroll = document.querySelector(".popup-friendlist");
  // let roomSortObj = document.getElementById("RoomSort");
  let roomName = document.getElementById("RoomName");
  let friendListChild = friendList.getElementsByTagName("li");
  // let roomSortChild = roomSortObj.getElementsByTagName("dd");
  let meetingStartBtn = document.getElementById("MeetingStartBtn");
  let inviteClose = document.getElementById("InviteClose");
  // let roomSort = "onetoone";
  let inviteLists = [];
  let sendData;

  //친구목록을 가져옴.
  //common.service.js에서 친구목록 불러옴.

  //회원초대에서 룸종류 선택
  // for (let i = 0; i < roomSortChild.length; i++) {
  //   let targetObj = roomSortChild[i].getElementsByTagName("input");

  //   //해당 스위치버튼을 클릭하였을 경우 해당 항목은 체크, 나머지항목은 unchecked;
  //   targetObj[0].addEventListener("click", function() {
  //     //스위치버튼 초기화.
  //     for (let j = 0; j < roomSortChild.length; j++) {
  //       roomSortChild[j].getElementsByTagName("input")[0].checked = false;
  //     }
  //     //해당항목은 체크, 룸종류값 세팅
  //     this.checked = true;
  //     roomSort = this.value;
  //     console.log(roomSort);
  //   });
  // }

  //미팅시작버튼 클릭
  meetingStartBtn.addEventListener("click", function () {
    if (meetingStartBtnDupl) {
      return;
    }
    meetingStartBtnDupl = true;
    let tmpInviteUsers = [];
    for (let i = 0; i < friendListChild.length; i++) {
      let targetObj = friendListChild[i].getElementsByTagName("input")[0];
      // console.log("targetObj ::::", targetObj, friendListChild, friendListChild[i]);
      // console.log(targetObj.checked);
      if (targetObj && targetObj.checked === true) {
        tmpInviteUsers.push(targetObj.value);
      }
    }

    inviteLists = tmpInviteUsers;
    if (inviteLists.length === 0) {
      commonService.messageBox(
        "입력메세지 에러",
        inviteCheckErr,
        null
      );
      meetingStartBtnDupl = false;
      return false;
    }

    // if (inviteLists.length > 1) {
    //   commonService.messageBox(
    //     "서버 공사 중",
    //     "현재 MCU에서 SFU로 변경 중으로 5월 초 까지 다자간 서비스 사용이 제한됩니다.",
    //     null
    //   );
    //   meetingStartBtnDupl = false;
    //   return false;
    // }

    // 방 생성 시 녹화할 것인지
    // if (!inMeeting) {
    //   commonService.setConfirm("녹화", "회의 내용을 녹화하시겠습니까?", 
    //     () => {
    //       let type = 'SS_UI_REQUEST';
    //       let text = 'start';
    //       let isMulti = false;

    //       window.postMessage({
    //           type,
    //           text,
    //           isMulti
    //       }, '*');
    //     }, 
    //     () => {

    //     })
    // }

    //룸이름을 체크함.
    // if (!commonService.inputValidate(roomName)) {
    //   commonService.messageBox(
    //     "입력메세지 에러",
    //     "룸이름을 입력하셔야 합니다.",
    //     roomName
    //   );
    //   return false;
    // }

    //1:1은 한명만 초대가 가능하도록 설정함.
    // console.log("roomsort", roomSort);
    // if (roomSort === "onetoone") {
    //   if (inviteLists.length > 1) {
    //     commonService.messageBox(
    //       "입력메세지 에러",
    //       "1:1 미팅서비스는 한명만 초대가 가능합니다.",
    //       null
    //     );
    //     return false;
    //   } else {
    // 1:1 화상대화

    // 화상 회의 Call
    if (commonService.isSharing && sessionStorage.getItem('useMediaSvr') === 'N') {
      // confirm("1:1 회의에서 다자간 회의로 전환 시, 화면공유가 종료됩니다. 그래도 진행하시겠습니까?");
      commonService.setConfirm("화면공유",
        "1:1 회의에서 다자간 회의로 전환 시, 화면공유가 종료됩니다. 그래도 진행하시겠습니까?",
        () => {
          sendData = {
            eventOp: "Call",
            reqNo: commonService.getReqNo(),
            userId: JSON.parse(sessionStorage.getItem("userInfo")).userId,
            reqDate: commonService.getReqDate(),
            reqDeviceType: "pc",
            targetId: inviteLists,
            serviceType: "multi",
            roomId: sessionStorage.getItem("roomId")
          };

          commonService.sendSocketMessage(sendData);
        },
        () => {
          meetingStartBtnDupl = false;
        });
      return;
    }


    sendData = {
      eventOp: "Call",
      reqNo: commonService.getReqNo(),
      userId: JSON.parse(sessionStorage.getItem("userInfo")).userId,
      reqDate: commonService.getReqDate(),
      reqDeviceType: "pc",
      targetId: inviteLists,
      // serviceType: inMeeting || inviteLists.length > 1 ? "multi" : "single"
    };

    sessionStorage.getItem("roomId")
      ? (sendData.roomId = sessionStorage.getItem("roomId"))
      : "";
    commonService.sendSocketMessage(sendData);

    commonService.closePopup("Invite");
    let roomSort = sendData.serviceType === "multi" ? "onetomany" : "onetoone";

    if (!inMeeting) {
      let RecordInfo = document.getElementById("RecordInfo");
      RecordInfo.style.display = "";
      sessionStorage.setItem("maker", true);

      document.getElementById("TopRoomInfo").innerHTML = userNumber;
      document.getElementById("RoomInfo").style.display = "";
      let attendant_box = document.querySelector(".attendant-box");
      let attendant_list = `<a class="tooltipped" data-position="left" data-tooltip="${JSON.parse(sessionStorage.getItem("userInfo")).userId}"><i class="material-icons">person</i></a>`;
      attendant_box.innerHTML = attendant_list;

      let elems = document.querySelectorAll('.tooltipped');
      let instances = M.Tooltip.init(elems);

      videoService.setVideo(roomSort);
    }
  });

  inviteClose.addEventListener("click", function () {
    commonService.closePopup("Invite");
  });

  // scroll 페이징

  friendListScroll.addEventListener("scroll", () => {
    if (scrollDupl) {
      return;
    }
    if (inviteService.page + 8 >= inviteService.total) {
      return;
    }
    let scrollStyleHeight = window.getComputedStyle(friendListScroll).height;
    let contentStyleHeight = window.getComputedStyle(friendList).height;
    let scrollTop = friendListScroll.scrollTop; //스크롤바의 상단위치
    let scrollHeight = scrollStyleHeight.substr(0, scrollStyleHeight.length - 2) - 0; //스크롤바를 갖는 div의 높이
    let contentHeight = contentStyleHeight.substr(0, contentStyleHeight.length - 2) - 0; //문서 전체 내용을 갖는 div의 높이

    if (scrollTop + scrollHeight + 1 >= contentHeight) {
      scrollDupl = true; // 스크롤바가 맨 아래에 위치할 때
      inviteService.page += 8;

      let sendData = {
        eventOp: "MemberList",
        reqNo: commonService.getReqNo(),
        reqDate: commonService.getReqDate(),
        type: "friend",
        status: "all",
        option: {
          limit: 8,
          offset: inviteService.page
        }
      };

      commonService.sendSocketMessage(sendData);
    }
  });
});
let temp = 0;
document.getElementById('accept-invite').addEventListener('click', function () {
  if (responseInviteDupl) {
    return;
  }
  responseInviteDupl = true;

  exceptionService.clearExitTimer();
  let joinAccept = '';

  if (sessionStorage.getItem("useMediaSvr") === "Y") {
    //janus.
    joinAccept = {
      eventOp: "Join",
      reqNo: commonService.getReqNo(),
      userId: JSON.parse(sessionStorage.getItem("userInfo")).userId,
      reqDate: commonService.getReqDate(),
      roomId: sessionStorage.getItem("roomId"),
      status: "accept",
      isSfu: sessionStorage.getItem("isSfu") === 'true'
    };
    //janus end.
  } else if (sessionStorage.getItem("useMediaSvr") === "N") {
    joinAccept = {
      eventOp: "Join",
      reqNo: commonService.getReqNo(),
      userId: JSON.parse(sessionStorage.getItem("userInfo")).userId,
      reqDate: commonService.getReqDate(),
      roomId: sessionStorage.getItem("roomId"),
      status: "accept"
    };
  }

  commonService.sendSocketMessage(joinAccept);
  // 종료로직

  commonService.closePopup('inviteMessageBox');
  if (sessionStorage.getItem("useMediaSvr") === "Y") {
    videoService.setVideo("onetomany");

    let multiVideoBox = document.querySelector("#VIDEOONETOMANY");
    let videoContainner = document.createElement("dd");
    videoContainner.classList = "multi-video";
    let multiVideoTitle = document.createElement("p");
    multiVideoTitle.innerHTML = `local`;
    let multiVideo = document.createElement("video");
    multiVideo.autoplay = true;
    multiVideo.id = "multiVideo-local";
    multiVideo.srcObject = localStream;
    setupService.audioOutput ? multiVideo.setSinkId(setupService.audioOutput).then(() => {
      console.log(`change audio output to ${setupService.audioOutput}`);
    }).catch(err => {
      console.log(`sink err: ${err}`);
    }) : "";
    videoContainner.appendChild(multiVideoTitle);
    videoContainner.appendChild(multiVideo);
    multiVideoBox.appendChild(videoContainner);
  }
});

document.getElementById('reject-invite').addEventListener('click', function () {
  if (responseInviteDupl) {
    return;
  }
  responseInviteDupl = true;
  isReject = true;
  exceptionService.clearExitTimer();

  let joinReject ='';
  
  if (sessionStorage.getItem("useMediaSvr") === "Y") {
    //janus.
    joinReject = {
      eventOp: "Join",
      reqNo: commonService.getReqNo(),
      userId: JSON.parse(sessionStorage.getItem("userInfo")).userId,
      reqDate: commonService.getReqDate(),
      roomId: sessionStorage.getItem("roomId"),
      status: "reject",
      isSfu: sessionStorage.getItem("isSfu") === 'true'
    };
  } else if (sessionStorage.getItem("useMediaSvr") === "N") {
    joinReject = {
      eventOp: "Join",
      reqNo: commonService.getReqNo(),
      userId: JSON.parse(sessionStorage.getItem("userInfo")).userId,
      reqDate: commonService.getReqDate(),
      roomId: sessionStorage.getItem("roomId"),
      status: "reject"
    };
  }

  //janus end.
  commonService.sendSocketMessage(joinReject);
  // 종료로직
  commonService.closePopup('inviteMessageBox');
});