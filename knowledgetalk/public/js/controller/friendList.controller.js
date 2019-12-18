document.addEventListener("DOMContentLoaded", function() {
  let friendListClose = document.getElementById("FriendListClose");
  let friendListSearch = document.getElementById("FriendSearchInput");
  let friendListSearchBtn = document.querySelector(".search-btn");
  let friendListScroll = document.querySelector(".friend-box-scroll");
  let friendList = document.getElementById("FriendListBox");
  let searchTab = document.getElementById("SearchTab");
  let searchTabChild = searchTab.getElementsByTagName("a");
  let selectedSearchFriend = "all";
  let friendListBtnGrp = document
    .getElementById("FriendListBtnGrp")
    .getElementsByTagName("button");
  let confirmMsg = "";

  //sidebar.controller.js에서 getFriendList 호출, 버튼 누를때 마다 새로운 정보를 가져와야 함.

  //결과 내에서 키워드 검색 이벤트
  friendListSearch.addEventListener("keyup", event => {
    if (
      event.keyCode === 13 &&
      document.getElementById("MessageDim").classList.contains("fadeOut")
    ) {
      if (
        friendListSearch.value.length < 2 ||
        friendListSearch.value.length > 20
      ) {
        //메세지 -> string.js
        commonService.messageBox(
          "친구검색",
          searchValidateErr,
          friendListSearch
        );
        return;
      }
      friendList.innerHTML = "";
      friendListService.page = 0;
      friendListService.total = 0;
      friendListService.keyword = "";
      friendListService.searchFriendList(friendListSearch.value);
    }
  });
  friendListSearchBtn.addEventListener("click", () => {
    if (
      friendListSearch.value.length < 2 ||
      friendListSearch.value.length > 20
    ) {
      //메세지 -> string.js
      commonService.messageBox("친구검색", searchValidateErr, friendListSearch);
      return;
    }
    friendList.innerHTML = "";
    friendListService.page = 0;
    friendListService.total = 0;
    friendListService.keyword = "";
    friendListService.searchFriendList(friendListSearch.value);
  });

  //닫기버튼
  friendListClose.addEventListener("click", function() {
    commonService.closePopup("FriendList");
  });

  //스크롤 시 불러오기
  friendListScroll.addEventListener("scroll", () => {
    if (scrollDupl) {
      return;
    }
    if (friendListService.page + 8 >= friendListService.total) {
      return;
    }
    let scrollStyleHeight = window.getComputedStyle(friendListScroll).height;
    let contentStyleHeight = window.getComputedStyle(friendList).height;
    let scrollTop = friendListScroll.scrollTop; //스크롤바의 상단위치
    let scrollHeight =
      scrollStyleHeight.substr(0, scrollStyleHeight.length - 2) - 0; //스크롤바를 갖는 div의 높이
    let contentHeight =
      contentStyleHeight.substr(0, contentStyleHeight.length - 2) - 0; //문서 전체 내용을 갖는 div의 높이

    if (scrollTop + scrollHeight + 1 >= contentHeight) {
      scrollDupl = true; // 스크롤바가 맨 아래에 위치할 때
      friendListService.page += 8;
      friendListService.searchFriendList(friendListService.keyword);
    }
  });

  //각버튼들을 초기화함.
  for (let i = 0; i < 2; i++) {
    friendListBtnGrp[i].disabled = true;
    friendListBtnGrp[i].classList.add("whitegrey");
  }

  //친구목록에서 검색탭 클릭이벤트
  for (let i = 0; i < searchTabChild.length; i++) {
    searchTabChild[i].addEventListener("click", function(e) {
      e.preventDefault();

      friendListSearch.value = "";
      friendListService.page = 0;
      friendListService.total = 0;
      friendListService.keyword = "";

      //각버튼들을 초기화함.
      for (let i = 0; i < 2; i++) {
        friendListBtnGrp[i].disabled = true;
        friendListBtnGrp[i].classList.add("whitegrey");
      }

      //전체탭 active 클래스 삭제
      for (let j = 0; j < searchTabChild.length; j++) {
        searchTabChild[j].classList.remove("active");
      }

      //선택된 탭만 active클래스 추가
      this.classList.add("active");
      selectedSearchFriend = this.getAttribute("data-value");
      // console.log("selectedSearchFriend :::", selectedSearchFriend);
      if (selectedSearchFriend === "all") {
        friendList.innerHTML = `<li>
                                                                  <dl class="friend-list">
                                                                      <dt><i class="material-icons">search</i></dt>
                                                                      <dd>ID로 검색하실 수 있습니다.</dd>
                                                                  </dl>
                                                              </li>`;
        // friendListService.changeFriendList("common", "all");
        friendListService.type = "common";
        friendListBtnGrp[0].style.display = "";
        friendListBtnGrp[1].style.display = "none";
      } else if (selectedSearchFriend === "inFriend") {
        friendListService.type = "friend";
        friendList.innerHTML = "";
        friendListService.changeFriendList("friend", "all");
        friendListService.type = "friend";
        friendListBtnGrp[0].style.display = "none";
        friendListBtnGrp[1].style.display = "";
      }
    });
  }

  //버튼별 confirm메세지
  for (let i = 0; i < 2; i++) {
    friendListBtnGrp[i].addEventListener("click", function(event) {
      if (friendListBtnDupl) {
        return;
      }
      friendListBtnDupl = true;
      switch (this.innerText) {
        case "추가":
          confirmMsg = "해당친구를 친구 목록에 추가하시겠습니까?";
          break;
        // case "취소":
        //   confirmMsg = "친구요청을 취소 하시겠습니까?";
        //   break;
        // case "승인":
        //   confirmMsg = "상대방이 요청한 친구요청을 승인하시겠습니까?";
        //   break;
        // case "거절":
        //   confirmMsg = "상대방이 요청한 친구요청을 거절하시겠습니까?";
        //   break;
        case "삭제":
          confirmMsg = "친구목록에서 해당 친구를 삭제하시겠습니까?";
          break;
      }

      //confirm 메세지에서 확인버튼 클릭
      // if (confirm(confirmMsg)) {
      //   console.log(
      //     ":::: selectedFriendList ::::",
      //     friendListService.selectedFriend
      //   );

      //   friendListService.contactFriendRequest(event);

      //   // commonService.sendSocketMessage(sendData);
      // } else {
      //   friendListBtnDupl = false;
      // }
      commonService.setConfirm(
        this.innerText,
        confirmMsg,
        () => {
          friendListService.contactFriendRequest(event);
        },
        () => {
          friendListBtnDupl = false;
          setTimeout(() => {
            commonService.setCategory("friend");
          }, 500);
        }
      );
    });
  }
});
