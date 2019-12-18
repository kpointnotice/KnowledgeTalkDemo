document.addEventListener("DOMContentLoaded", function() {
  let leftSidebarClose = document.getElementById("LeftSidebarClose");
  let friendListBtn = document.getElementById("FriendListBtn");
  // let inviteListBtn = document.getElementById("InviteListBtn");
  let infoEditBtn = document.getElementById("InfoEditBtn");

  //좌측메뉴 닫기버튼
  leftSidebarClose.addEventListener("click", function() {
    commonService.closeSidebar();
    
  });

  //친구목록 버튼
  friendListBtn.addEventListener("click", function() {
    commonService.setCategory("friend");
  });

  //초대목록 버튼
  // inviteListBtn.addEventListener("click", function() {
  //   commonService.setCategory("inviteList");
  //   inviteListService.getInviteList();
  // });

  //정보수정 버튼
  infoEditBtn.addEventListener("click", function() {
    commonService.setCategory("infoEdit");
    infoEditService.getUserInfo();
  });
});
