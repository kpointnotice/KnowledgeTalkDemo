document.addEventListener('DOMContentLoaded', function(){
    // commonService.setCategory('login');
    let mainMenu         = document.getElementById('Mainmenu');
    let mainMenuChild    = mainMenu.getElementsByTagName('li');
    let loginInfo        = document.getElementById('LoginInfo');
    let chatBtn          = document.getElementById('ChatBtn');
    let rightSidebar     = document.getElementById('RightSidebar');
    let chatIcon         = document.getElementById('ChatIcon');
    let chatCount        = document.getElementById('ChatCount');
    let messageBoxOk     = document.getElementById('MessageBoxOk');
    let logoutBtn = document.getElementById('logout');
    /*  let messageBoxCancel = document.getElementById('MessageBoxCancel'); */

    //sessionSorage에서 로그인한 유저 정보를 가져옴.
    let user = sessionStorage.getItem("userInfo");
    let userId;

    if(sessionStorage.getItem("userInfo") != null) {
        userId = user.userId;
        let topLoginInfo  = document.getElementById('TopLoginInfo');
        topLoginInfo.innerHTML  = `<b>${userId}</b>님 안녕하세요.`;
    }

    //메인메뉴를 클릭하였을 경우 해당 data-value을 가져옴.
    for(let i=0; i<mainMenuChild.length; i++){
        let targetObj = mainMenuChild[i].getElementsByTagName('a');
        let targetObjChild = mainMenuChild[i].getElementsByTagName('i');
        targetObj[0].addEventListener('click', function(e){
            e.preventDefault();

            if (sessionStorage.getItem("userInfo") != null) {
                if ((i<3 || i===6) && !inMeeting) {
                    //message -> string.js
                    commonService.messageBox('Error',availableMeetingErr, null);
                    return;
                } else if (i===4 && inMeeting) {
                    //message -> string.js
                    commonService.messageBox('Error',NotAvailableMeetingErr, null);
                    return;
                }
                let data = this.getAttribute('data-value');
                commonService.setCategory(data);
                return;
            } else {
                //message -> string.js
                commonService.messageBox('Error',loginValidateErr, null);
                return;
            }
        })
    }

    //로그인정보 부분을 클릭했을 경우 발생하는 이벤트.
    loginInfo.addEventListener('click', function(e){
        e.preventDefault();
        if(sessionStorage.getItem("userInfo") !== null){
            // userId = userInfo.userId;
            //로그인정보가 있을 경우 좌측메뉴가 보임.
            // let sidebarUserId = document.getElementById('SidebarUserId');
            // let topLoginInfo  = document.getElementById('TopLoginInfo');
            // sidebarUserId.innerHTML = userId;
            // topLoginInfo.innerHTML  = `<b>${userId}</b>님 안녕하세요.`;
            // commonService.openSidebar();
            location.reload();
            return;
        }else{
            //iamabook.
            if(agentCheck() === false) return false;
            //로그인정보가 없을 경우 팝업창을 띄움.
            commonService.setCategory('login');
        }
    });

    logoutBtn.addEventListener('click', function (e) {
        e.preventDefault();
        // commonService.setConfirm('로그아웃','로그아웃 하시겠습니까?')
        location.reload();
    })

    //채팅버튼을 클릭하였을 경우 해당 클래스를 추가.
    chatBtn.addEventListener('click', function(e){
        e.preventDefault();

        //우측채팅창 보이기, 닫기
        if(!rightSidebar.classList.contains('rightSidebarOpen')){
            //채팅창 보이기
            if(rightSidebar.classList.contains('rightSidebarClose')){
                rightSidebar.classList.remove('rightSidebarClose');
            }
            rightSidebar.classList.add('rightSidebarOpen');
        }else{
            //채팅창 닫기
            rightSidebar.classList.remove('rightSidebarOpen');
            rightSidebar.classList.add('rightSidebarClose');
        };

        //채팅아이콘 변경

        if(chatIcon.innerText === 'sms'){
            chatIcon.innerText = 'close';
        }else{
            chatIcon.innerText = 'sms';
        }


        //채팅카운트 숨기기-채팅창이 닫혔을 경우 채팅카운터를 증가시켜서 보여줌.
        //열려있을 경우에는 채팅카운터 - 0
        chatCount.style.display = 'none';
        chatCount.innerText = "0";
    });


    //경고팝업창 닫기
    messageBoxOk.addEventListener('click', function(){

        commonService.closeMessageBox();
    });

    /* messageBoxCancel.addEventListener('click', function(){

    }) */
})