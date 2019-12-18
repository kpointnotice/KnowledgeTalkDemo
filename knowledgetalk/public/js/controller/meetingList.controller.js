document.addEventListener('DOMContentLoaded', function(){
    let meetingListClose  = document.getElementById('MeetingListClose');
    let meetingListDelete = document.getElementById('MeetingListDelete');

    //개인별 미팅리스트 호출
    //common.service.js에서 getMeetingList()을 호출

    MeetingListBtn.addEventListener('click', () => {
        commonService.setCategory("meetingList");
    });

    //미팅리스트 close버튼
    meetingListClose.addEventListener('click', function(){
        commonService.closePopup('MeetingList');
    });
})