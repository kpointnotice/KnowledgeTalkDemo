function InfoEditService() {}

InfoEditService.prototype.getUserInfo = function() {
  let userId = commonService.userInfo.userId;

  // let sendData = {
  //     id : 'getUserInfo',
  //     useerId : userId
  // }

  let sendData = {
    eventOp: "ModifyInfo",
    reqNo: commonService.getReqNo(),
    reqDate: commonService.getReqDate(),
    token: "load",

    info: {
      userId: JSON.parse(sessionStorage.getItem("userInfo")).userId
    }
  };

  commonService.sendSocketMessage(sendData);

  // let tmpData = commonService.userInfo;
  // this.setUserInfo(tmpData);
};

InfoEditService.prototype.setUserInfo = function(data) {

  if (data.code === "200") {
    if (data.result.token === "load") {
      let modifyUserId = document.getElementById("ModifyUserId");
      let modifyUserPw = document.getElementById("ModifyUserPw");
      let modifyUserName = document.getElementById("ModifyUserName");

      //필드에 데이터를 세팅.
      // modifyUserId.value   = data.userId;
      // modifyUserName.value = data.userName;
      modifyUserId.value = JSON.parse(
        sessionStorage.getItem("userInfo")
      ).userId;
      modifyUserName.value = data.result.count.name;
    } else {
      //message -> sting.js
      commonService.messageBox("정보 수정", passwdChangeSucMsg, null);
      //팝업창 없애기
      commonService.closePopup("InfoEdit");
    }
  } else {
    //message -> string
    commonService.messageBox("Error", repasswdChangeErr, null);
  }
};

InfoEditService.prototype.reqModifyUserInfo = () => {
  let modifyUserPw = document.getElementById("ModifyUserPw");
  let modifyUserPwRe = document.getElementById("ModifyUserPwRe");
  let modifyUserName = document.getElementById("ModifyUserName");
  // let loginPw        = document.getElementById('LoginPw');

  let sendData = {
    eventOp: "ModifyInfo",
    reqNo: commonService.getReqNo(),
    reqDate: commonService.getReqDate(),
    token: "modify",
    info: {
      userId: JSON.parse(sessionStorage.getItem("userInfo")).userId,
      userName: modifyUserName.value,
      userPw: commonService.SHA256(modifyUserPw.value),
      modifyPw: commonService.SHA256(modifyUserPwRe.value)
    }
  };

  commonService.sendSocketMessage(sendData);

  modifyUserPw.value = "";
  modifyUserPwRe.value = "";
  /**
   *  confirm 버튼 클릭 시 SUCCESS message alert 창 발생 후 화면 비우기 기능 추가
   *  정보수정 버튼 눌렀을 시 -> 시그널서버 규격에 회원 정보 변경 관련 규격이 있어서 팝업창에 뿌리는것은 가능하나,
   *  세부 UI에 name을 변경 할 수 있는 부분이 없어서 confirm 버튼을 눌러도 변경이 되지 않음, 사진도 저장이 안됨.
   */
};

let infoEditService = new InfoEditService();
