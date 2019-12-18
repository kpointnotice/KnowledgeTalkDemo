function InviteListService(){
    this.selectedInviteList;
    this.selectedState;
}

/**
 * 해당아이디별 미팅리스트를 가져옴.
 */
// InviteListService.prototype.getInviteList = function(){

//     console.log("getInviteList() 호출");

//     let userId = commonService.userInfo.userId;
    
//     let sendData = {
//         id     : 'inviteList',
//         userId : userId
//     };

//     commonService.sendSocketMessage(sendData);

//     //임시데이터.
//     let tmpData = [
//         {id : 1, roomName : '테스트1', maker : 'bbsmax1', state : 'ing', period : '12.20 10:20:21 ~ 00.00 00:00:00'},
//         {id : 2, roomName : '테스트2', maker : 'bbsmax2', state : 'end', period : '12.20 10:10:21 ~ 12.20 10:11:21'},
//         {id : 3, roomName : '테스트3', maker : 'bbsmax3', state : 'ready', period : '12.20 10:02:21 ~ 00.00 00:00:00'},
//     ];

//     this.setInviteList(tmpData);
// }

/**
 * 초대메세지를 세팅
 */
InviteListService.prototype.setInviteList = function(data){

    let targetObj     = document.getElementById('InviteListTbl');
    let inviteListObj = targetObj.getElementsByTagName('input');

    let insertStr = `
        <colgroup>
            <col width="90px" />
            <col width="90px" />
            <col width="120px" />
            <col />
            <col width="220px" />
        </colgroup>
    `;

    for(let i=0; i<data.length; i++){
        insertStr += `
            <tr >
                <td scope="col"><div class="switch"><label><input type="checkbox" key="${data[i].id}" state="${data[i].state}"><span class="lever"></span></label></div></td>
                <td scope="col" >${data[i].state}</td>
                <td scope="col">${data[i].maker}</td>
                <td scope="col" class="left">${data[i].roomName}</td>
                <td scope="col">${data[i].period}</td>
            </tr>
        `
    }

    targetObj.innerHTML = insertStr;

    for(let i=0; i<inviteListObj.length; i++){
        inviteListObj[i].addEventListener('click', function(){
            //전체 checkbox 비활성화
            for(let j=0; j<inviteListObj.length; j++){
                inviteListObj[j].checked = false;
            }
            //해당 check박스만 활성화.
            this.checked = true;
            //선택된 리스트 id 저장.
            inviteListService.selectedInviteList = this.getAttribute('key');
            inviteListService.selectedState      = this.getAttribute('state');
        })
    }
}

let inviteListService = new InviteListService();