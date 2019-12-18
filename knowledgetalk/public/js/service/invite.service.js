function InviteService() {
  this.page = 0;
  this.total = 0;
}

// InviteService.prototype.recieve = data => {
//     sessionStorage.setItem("roomId", data.roomId);
//     respInvite(sessionStorage.getItem("roomId"));
// };

InviteService.prototype.recieveInvite = function(data) {
  let inviterId = data.userId;
  let sendData = '';
  sessionStorage.setItem("useMediaSvr", data.useMediaSvr);

  commonService.setCategory('receiveInvite');
  document.getElementById('Inviter').innerHTML = inviterId;

  sessionStorage.setItem("roomId", data.roomId);
  //janus.
  sessionStorage.setItem("isSfu", data.isSfu);
  
  if (sessionStorage.getItem("useMediaSvr") === "Y") {
    sendData = {
      eventOp: "Invite",
      reqNo: data.reqNo,
      code: "200",
      message: "OK",
      reqDate: commonService.getReqDate(),
      status: "accept",
      roomId: data.roomId,
      isSfu: data.isSfu
    };
  } else if (sessionStorage.getItem("useMediaSvr") === 'N') {
    sendData = {
      eventOp: "Invite",
      reqNo: data.reqNo,
      code: "200",
      message: "OK",
      reqDate: commonService.getReqDate(),
      status: "accept",
      roomId: data.roomId
    };
  }

  //janus end.
  commonService.sendSocketMessage(sendData);
  
  exceptionService.setRequestTimer(30);
};

InviteService.prototype.getFriendList = function() {
  let targetObj = document.getElementById("InviteFriendList");
  
  document.querySelector(".loader").style.display = "";
  targetObj.innerHTML = "";
  inviteService.page = 0;
  inviteService.total = 0;
  
  let sendData = {
    eventOp: "MemberList",
    reqNo: commonService.getReqNo(),
    reqDate: commonService.getReqDate(),
    type: "friend",
    status: "all",
    option: {
      limit: 8,
      offset: 0
    }
  };

  commonService.sendSocketMessage(sendData);
};

InviteService.prototype.setFriendList = function(data) {
  let targetObj = document.getElementById("InviteFriendList");
  let insertStr = "";

  //디비에서 가져온 친구목록을 세팅
  for (let i = 0; i < data.length; i++) {
    let state = data[i].user_state;
    insertStr += `<li>
                    <div class="switch">`;
    insertStr += state === "ready" ? `<label><input type="checkbox" value="${data[i].id}"><span class="lever">` : ``;
    insertStr += `</span></label></div>
                    <span class="profile-icon">
                    <i class="material-icons">person</i>
                    <span class="user-state `;
    insertStr += state === "logout" ? `offline` : `online`;
    insertStr += `"></span>
                  </span><div class="user-info">${data[i].id} <span>(${data[i].name})</span></div>`
    insertStr += state === "busy" ? `<span class="user-state-busy">회의중</span>` : ""
    insertStr += `</li>`;
  }

  targetObj.insertAdjacentHTML("beforeend", insertStr);
};

let inviteService = new InviteService();
