function chromeMessageHandler( event ) {
    let type = event.data.type;
    let streamId = event.data.streamId;
    let isMulti = event.data.isMulti;
    let isRecoding = event.data.isRecoding;
    // user chose a stream
    if ( type && type === 'SS_DIALOG_SUCCESS' ) {
        document.querySelector(".loader").style.display="none";
        screenShareCanvasService.displayInlineBlockScreenCanvas();
        /**
         * N:N인지 1:1인지 체크해야함.
         */
        if (!isMulti) {
            //alert('1:1 입니다 ##parkoon ---> 화면공유 시작')
            oneAndOneScreenShareService.sendScreenOfferSdp(streamId);
            return;
        } 

        /**
         * N:N인지 1:1인지 체크해야함.
         */
    }

    if(type && type === 'SS_UI_CANCEL') {
        document.querySelector(".loader").style.display="none"
        let toolbox = document.getElementsByClassName('document-icon-box')[0];
        toolbox.style.display="none";
        oneAndOneScreenShareService.sessionReserveEnd();
        if(s_stream || screenStream) {
            commonService.setCategory('video');
        }
    }


    if(type && type === 'SS_DIALOG_CANCEL') {
        document.querySelector(".loader").style.display="none"
        let toolbox = document.getElementsByClassName('document-icon-box')[0];
        toolbox.style.display="none";
        commonService.setCategory('video');

        oneAndOneScreenShareService.sessionReserveEnd();
    }

}