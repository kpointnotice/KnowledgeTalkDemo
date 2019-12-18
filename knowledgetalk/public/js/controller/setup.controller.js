document.addEventListener('DOMContentLoaded', function(){

    let setupClose = document.getElementById('SetupClose');
    let setupBtn = document.getElementById('SetupBtn');
    let audioInputSelect = document.getElementById("audioSource");
    let videoInputSelect = document.getElementById("videoSource");
    
    //미팅리스트 close버튼
    setupClose.addEventListener('click', function(){
        let previewVideo = document.querySelector("#previewVideo");
        if (previewVideo) {
            previewVideo.remove();
        }

        if (previewStream) {
            previewStream.getVideoTracks()[0].stop();
            previewStream.getAudioTracks()[0].stop();
        }

        commonService.closePopup('Setting');
    })

    setupBtn.addEventListener('click', function(e){
        if (setupBtnDupl) {
            return;
        }
        setupBtnDupl = true;
        setupService.setting()
    })

    audioInputSelect.addEventListener("change", setupService.preview);
    videoInputSelect.addEventListener("change", setupService.preview);
})