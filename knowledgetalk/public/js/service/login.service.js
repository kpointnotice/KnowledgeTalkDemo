function LoginService() {}
/**
 * 로그인이 성공했을 경우 실행.
 */
LoginService.prototype.recieve = data => {
  let loginBtn = document.getElementById('LoginBtn');
  if (data.code != 200) {
    commonService.messageBox('Error', loginFailMsg, document.getElementById("LoginId"));
    loginService.loginFailed(data);

  } else {
    //로그인 성공 후 실행.
    loginService.loginSuccess(data);
    loginBtn.disabled = true;
    // 친구목록 요청
  }
};

LoginService.prototype.loginSuccess = function (data) {
  //좌측화면 로그인박스
  let sidebarUserId = document.getElementById("SidebarUserId");
  let topLoginInfo = document.getElementById("TopLoginInfo");
  let toggleLeftInfo = document.querySelectorAll(".login-bg > dl > dd");
  let sidebarMenu = document.querySelectorAll(".login-box > ul > li");
  let loginBtn = document.getElementById('LoginOpen');
  let logoutBtn = document.getElementById('logout');
  //계정번호 기억
  userNumber = data.userNumber;

  loginBtn.style.display = 'none';
  logoutBtn.style.display = '';
  //팝업창 닫음.
  commonService.closePopup("Login");
  data.userId = commonService.userInfo.userId;

  /**
   * 로그인에 성공 후 return 받은 user 정보를 session storage에 저장,
   * user정버중 turn server의 정보도 있어 1:1의 경우는 잘 사용하고 있으나, N:N의 경우는 korento-utils 에서 사용이 안되는 이슈가 있었던 것으로 기억,
   * N:N의 경우는 소스상에 turn server url이 기록되어 있다.(connectionMulti.service.js)
   */
  sessionStorage.setItem("userInfo", JSON.stringify(data));
  commonService.isDocument = false;
  commonService.isSharing = false;

  sidebarUserId.innerHTML = data.userId;
  topLoginInfo.innerHTML = `<b>${data.userName}</b>님 안녕하세요.`;

  for (let i = 0; i < sidebarMenu.length; i++) {
    sidebarMenu[i].querySelector("a").style.display = '';
  }

  toggleLeftInfo[0].style.display = "";
  toggleLeftInfo[1].style.display = "none";

  commonService.setMainMenu();
  // document.addEventListener("mousemove", event => {    
  //   if (event.clientX < 260 && !inMeeting && isSideClose) {
  //     document.getElementById("Sidebar").style.display = ""
  //     commonService.openSidebar();
  //   } else if (event.clientX > 260 || inMeeting) {
  //     commonService.closeSidebar();
  //     isSideClose = true;
  //   }
  // });

  window.onbeforeunload = () => {
    if (inMeeting) {
      console.log("창을 벗어남으로 인한 자동 저장");
      chatService.uploadChatLogs(sessionStorage.getItem("maker"));
    }
    return "로그아웃 하시겠습니까?";
  }
};
// let isSideClose = false;
LoginService.prototype.loginFailed = data => {};

let loginService = new LoginService();