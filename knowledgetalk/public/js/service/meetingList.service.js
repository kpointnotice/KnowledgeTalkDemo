function MeetingListService(){}

/**
 * 해당아이디별 미팅리스트를 가져옴.
 */
MeetingListService.prototype.getMeetingList = function(){
    let userId = commonService.userInfo.userId;
    let sendData = {
        // id     : 'meetingList',
        // userId : userId
        eventOp : "ConferenceHistory",
        reqNo : commonService.getReqNo(),
        // userId : JSON.parse(sessionStorage.getItem("userInfo")).userId,
        reqDate : commonService.getReqDate()
    };

    commonService.sendSocketMessage(sendData);

    //임시데이터로 리스트구성. SignalServer와 연동될 경우 해당 데이터를 대체.
    // let tmpData = [
    //     {id : 1, roomName : '테스트1', maker : 'bbsmax1', attendants : 'bbsmax, test', period : '12.20 10:20:21 ~ 12.20 10:44:21'},
    //     {id : 2, roomName : '테스트2', maker : 'bbsmax2', attendants : 'bbsmax, test, test3', period : '12.20 10:10:21 ~ 12.20 10:11:21'},
    //     {id : 3, roomName : '테스트3', maker : 'bbsmax3', attendants : 'bbsmax, test, test2', period : '12.20 10:02:21 ~ 12.20 10:22:21'},
    // ];

    // this.setMeetingList(tmpData);
}

/** 
 * 초대메세지를 세팅
 */
MeetingListService.prototype.setMeetingList = function(result){
    let targetObj       = document.getElementById('MeetingListTbl');
    // let targetSelectObj = targetObj.getElementsByTagName('input');

    let data = [];

    for (let i =0; i < result.length; i++) {
        let attendants = "";
        for (let j =0; j < result[i].participant.length; j++) {
            attendants += result[i].participant[j].id + ", ";
        }
        attendants = attendants.substr(0, attendants.length-2);
        
        let createDate = new Date(result[i].start_time).format("yyyyMMddhhmmss");
        let fileUrl = result[i].admin + "_" + createDate;
        if (result[i].is_recording !== "none") {
            recordUrl = fileUrl;
        } else {
            recordUrl = false;
        }
        data.push({id: i+1,  admin: result[i].admin, attendants, 
            period: new Date(result[i].start_time).format("yyyy-MM-dd hh:mm") + " ~ " + 
            new Date(result[i].end_time).format("yyyy-MM-dd hh:mm"), 
            chatLogs: fileUrl, record: recordUrl })
    }
    // let data = [
    //     {id : 1, roomName : '테스트1', maker : 'bbsmax1', attendants : 'bbsmax, test', period : '12.20 10:20:21 ~ 12.20 10:44:21'},
    //     {id : 2, roomName : '테스트2', maker : 'bbsmax2', attendants : 'bbsmax, test, test3', period : '12.20 10:10:21 ~ 12.20 10:11:21'},
    //     {id : 3, roomName : '테스트3', maker : 'bbsmax3', attendants : 'bbsmax, test, test2', period : '12.20 10:02:21 ~ 12.20 10:22:21'},
    // ];
    
    let insertStr = `
        <colgroup>
            <col width="70px" />
            <col width="150px" />
            <col width="100px" />
            <col width="200px" />
            <col width="100px" />
            <col width="100px" />
        </colgroup>
    `;
    for(let i=0; i< data.length; i++){
        insertStr += `
            <tr>
                <td scope="col">${data.length-i}</td>
                <td scope="col">${data[i].admin}</td>
                <td scope="col" class="center">${data[i].attendants}</td>
                <td scope="col">${data[i].period}</td>
                <td scope="col"><a href="" chatid="${data[i].chatLogs}" onclick="chatService.setChatLogs(this)"><i class="material-icons">speaker_notes</i></a></td>
                <td scope="col">`;
        insertStr += data[i].record ? `<a href="" recid="${data[i].record}" onclick="recordService.setRecordVideo(this)"><i class="material-icons">camera_roll</i></a>` : "";
        insertStr += `</td></tr>
        `;
    }

    targetObj.innerHTML = insertStr;

    //해당항목선택



}

let meetingListService = new MeetingListService();