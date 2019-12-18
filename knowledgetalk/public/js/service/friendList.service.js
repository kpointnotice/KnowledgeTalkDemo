function FriendListService() {
  this.page = 0;
  this.total = 0;
  this.keyword = "";
  this.type = "friend";
}

FriendListService.prototype.recieve = data => {
  if (data.code === "200") {
    friendListService.setFriendList(data);
  } else {
    friendListService.clearFriendList();
  }
};

/**
 * 친구목록을 가져옴.
 */
FriendListService.prototype.getFriendList = function() {
  let type;
  let selectedSearchFriend;
  let friendTab = document.querySelectorAll("#SearchTab > a");

  for (let i = 0; friendTab.length > i; i++) {
    if (friendTab[i].classList.contains("active")) {
      selectedSearchFriend = friendTab[i].getAttribute("data-value");
    }
  }

  if (selectedSearchFriend === "all") {
    type = "common";
  } else if (selectedSearchFriend === "inFriend") {
    type = "friend";

    document.querySelector(".loader").style.display = "";

    let sendData = {
      eventOp: "MemberList",
      reqNo: commonService.getReqNo(),
      reqDate: commonService.getReqDate(),
      type,
      status: "all"
    };

    commonService.sendSocketMessage(sendData);
  }
};

FriendListService.prototype.changeFriendList = (type, status) => {
  document.querySelector(".loader").style.display = "";

  let sendData = {
    eventOp: "MemberList",
    reqNo: commonService.getReqNo(),
    reqDate: commonService.getReqDate(),
    type,
    status,
    option: {
      limit: 8,
      offset: friendListService.page
    }
  };

  commonService.sendSocketMessage(sendData);
};

/**
 * 친구목록을 세팅함.
 */
FriendListService.prototype.setFriendList = function(data) {
  let targetObj = document.getElementById("FriendListBox");
  let friendListBtnGrp = document
    .getElementById("FriendListBtnGrp")
    .getElementsByTagName("button");
  let friendState = "";
  let tmpData;
  inviteService.total = friendListService.total = data.total;
  friendListService.type = data.type;
  switch (data.type) {
    case "common":
      tmpData = data.result.common;
      break;
    case "friend":
      tmpData = data.result.friend;
      inviteService.setFriendList(data.result.friend);
      break;
  }

  // let tmpData = [
  //     { userId : 'bbsmax', state : 'request'},
  //     { userId : 'hong', state : 'wait'},
  //     { userId : 'test', state : 'friend'},
  // ];
  //state : request ->친구요청, wait -> 친구승인대기, friend -> 친구, reject -> 거절, remove -> 삭제
  let insertList = "";
  for (let i = 0; i < tmpData.length; i++) {
    // user 정보에 state가 없으므로 주석처리
    // let stateString = '';
    // if(tmpData[i].state === 'request'){
    //     stateString = `<span class="friend-sort"><i class="${tmpData[i].state}">승</i></span>`;
    // }else if(tmpData[i].state === 'wait'){
    //     stateString = `<span class="friend-sort"><i class="${tmpData[i].state}">요</i></span>`;
    // }else if(tmpData[i].state === 'friend'){
    //     stateString = '';
    // }

    // insertList += `
    // <li key=${tmpData[i].id} state=${tmpData[i].state}>
    //     <dl class="friend-list">
    //         <dt><i class="material-icons">person</i></dt>
    //         <dd>${stateString}  ${tmpData[i].id}</dd>
    //     </dl>
    // </li>
    // `;

    // <dd><span class="friend-sort"><i class="accept">승</i></span>id</dd>
    let highlightId = tmpData[i].id.replace(
      new RegExp(friendListService.keyword, "gi"),
      "<span style='background-color: yellow;'>" +
        friendListService.keyword +
        "</span>"
    );
    let highlightName = tmpData[i].name.replace(
      new RegExp(friendListService.keyword, "gi"),
      "<span style='background-color: yellow;'>" +
        friendListService.keyword +
        "</span>"
    );

    insertList += `
        <li key=${tmpData[i].id} state=${data.type}>
            <dl class="friend-list">
                <dt><i class="material-icons">person</i></dt>
                <dd>${highlightId} (${highlightName})</dd>
            </dl>
        </li>
      `;
  }

  let myFriendList = document
    .getElementById("FriendListBox")
    .getElementsByTagName("li");

  targetObj.insertAdjacentHTML("beforeend", insertList);

  //동적으로 생성된 아이디 찾기
  for (let i = 0; i < myFriendList.length; i++) {
    myFriendList[i].addEventListener("click", function() {
      for (let j = 0; j < myFriendList.length; j++) {
        if (myFriendList[j].classList.contains("selected")) {
          myFriendList[j].classList.remove("selected");
        }
      }

      this.classList.add("selected");
      friendListService.selectedFriend = this.getAttribute("key");
      friendState = this.getAttribute("state");

      //해당버튼들을 초기화함.
      for (let k = 0; k < 2; k++) {
        if (!friendListBtnGrp[k].classList.contains("whitegrey")) {
          friendListBtnGrp[k].classList.add("whitegrey");
          friendListBtnGrp[k].disabled = true;
        }
        friendListBtnGrp[k].selected = friendListService.selectedFriend;
      }

      //state에 따라 활성화할 버튼
      //검색을 한 후 친구를 요청할 경우는 요청버튼만 활성화.

      if (friendState === "common") {
        friendListBtnGrp[0].classList.add("green");
        friendListBtnGrp[0].classList.remove("whitegrey");
        friendListBtnGrp[0].disabled = false;
        friendListBtnGrp[0].contype = "add";

        friendListBtnGrp[1].classList.add("red");
        friendListBtnGrp[1].classList.remove("whitegrey");
        friendListBtnGrp[1].disabled = false;
        friendListBtnGrp[1].contype = "delete";
      } else if (friendState === "friend") {
        friendListBtnGrp[1].classList.add("red");
        friendListBtnGrp[1].classList.remove("whitegrey");
        friendListBtnGrp[1].disabled = false;
        friendListBtnGrp[1].contype = "delete";
      }
      //   if (friendState === "friend") {
      //     friendListBtnGrp[4].classList.remove("whitegrey");
      //     friendListBtnGrp[4].disabled = false;
      //   }

      //   if (friendState === "request") {
      //     friendListBtnGrp[1].classList.remove("whitegrey");
      //     friendListBtnGrp[1].disabled = false;
      //   }

      //   if (friendState === "wait") {
      //     friendListBtnGrp[2].classList.remove("whitegrey");
      //     friendListBtnGrp[2].disabled = false;
      //     friendListBtnGrp[3].classList.remove("whitegrey");
      //     friendListBtnGrp[3].disabled = false;
      //   }
    });
  }
};

FriendListService.prototype.clearFriendList = () => {
  let friendList = document.getElementById("FriendListBox");
  let inviteFriendList = document.getElementById("InviteFriendList");
  while (friendList.hasChildNodes()) {
    friendList.removeChild(friendList.firstChild);
  }
  while (inviteFriendList.hasChildNodes()) {
    inviteFriendList.removeChild(inviteFriendList.firstChild);
  }
};

FriendListService.prototype.contactFriendRequest = event => {
  let button = event.target;

  let type = button.contype;
  let target = button.selected;
  let sendData = {
    eventOp: "Contact",
    reqNo: commonService.getReqNo(),
    reqDate: commonService.getReqDate(),
    type,
    target
  };

  commonService.sendSocketMessage(sendData);
  setTimeout(() => {
    commonService.setCategory("friend");
  }, 500);

  if (type === "delete") {
    let friendList = document.querySelectorAll("#FriendListBox > li");
    let i;
    for (i = 0; friendList.length > i; i++) {
      if (friendList[i].getAttribute("key") === target) {
        friendList[i].remove();
      }
    }
  }
};

FriendListService.prototype.searchFriendList = keyword => {
  // let friendList = document.querySelectorAll("#FriendListBox > li");
  // let i;
  // for (i = 0; friendList.length > i; i++) {
  //   if (
  //     friendList[i]
  //       .getAttribute("key")
  //       .toUpperCase()
  //       .indexOf(keyword.toUpperCase()) > -1
  //   ) {
  //     friendList[i].style.display = "";
  //   } else {
  //     friendList[i].style.display = "none";
  //   }
  // }
  document.querySelector(".loader").style.display = "";
  friendListService.keyword = keyword;

  let sendData = {
    eventOp: "MemberList",
    reqNo: commonService.getReqNo(),
    reqDate: commonService.getReqDate(),
    type: friendListService.type,
    status: "all",
    search: friendListService.keyword,
    option: {
      limit: 8,
      offset: friendListService.page
    }
  };

  commonService.sendSocketMessage(sendData);
};

let friendListService = new FriendListService();
