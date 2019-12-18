document.addEventListener("DOMContentLoaded", function() {
    let roomJoin = document.getElementById("MeetingJoin");
    let joinClose = document.getElementById("JoinClose");
    let targetId = document.getElementById("JoinTarget").value;

    roomJoin.addEventListener('click', joinService.roomJoin);
    joinClose.addEventListener('click', () => {
        targetId = "";
        commonService.closePopup("Join");
    });
});