function JoinService() {}

JoinService.prototype.roomJoin = () => {
    if (joinDupl) {
        return;
    }
    joinDupl = true;

    let targetId = document.getElementById("JoinTarget").value.trim();
    let sendData = {
        eventOp: "GuestJoin",
        reqNo: commonService.getReqNo(),
        userId: JSON.parse(sessionStorage.getItem("userInfo")).userId,
        reqDate: commonService.getReqDate(),
        targetId,
        isLogin: true
    }
    document.getElementById("JoinTarget").value = "";

    commonService.sendSocketMessage(sendData);

    commonService.closePopup("Join");

}


let joinService = new JoinService();