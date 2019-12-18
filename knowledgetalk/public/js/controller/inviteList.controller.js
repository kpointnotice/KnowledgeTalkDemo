document.addEventListener('DOMContentLoaded', function(){
    let inviteListClose = document.getElementById('InviteListClose');
    let inviteJoinBtn   = document.getElementById('InviteJoinBtn');
    let inviteDeleteBtn = document.getElementById('InviteDeleteBtn');

    //sidebar.controller.js에서 getInviteList() 호출, 버튼 누를때 마다 새로운 정보를 가져와야 함.

    inviteJoinBtn.addEventListener('click', function(){
        let state      = inviteListService.selectedState;
        let selectedId = inviteListService.selectedInviteList;
        let confirmMsg;
        let sendData;

        if(state === 'ing' || state === 'ready'){
            confirmMsg = "해당룸에 입장하시겠습니까?";
        }else if(state === 'end'){
            confirmMsg = "해당룸은 종료되었습니다. 입장이 불가능합니다.";
        }else if(state === undefined || state === ''){
            confirmMsg = "해당항목을 선택해 주세요.";
        }
        
        //confirm메세지에서 확인버튼클릭
        if(confirm(confirmMsg)){
            if(state === 'ing' || state === 'ready'){
                sendData = {
                    id     : 'join',
                    roomId : ''
                }

                commonService.sendSocketMessage(sendData);
                //팝업창 닫음.
                commonService.closePopup('InviteList');
                //좌측메뉴 닫음.
                commonService.closeSidebar();
            }
        }

    });

    inviteDeleteBtn.addEventListener('click', function(){
        let selectedId = inviteListService.selectedInviteList;
    })

    //닫기버튼
    inviteListClose.addEventListener('click', function(){
        commonService.closePopup('InviteList');
    });
});