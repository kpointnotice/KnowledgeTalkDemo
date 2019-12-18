
$( '#w_video' ).css( 'width', '367px');
$( '#w_video' ).css( 'height', '367px');

var Sharing = (function () {
    'use strict';

    let _url, _target, _filename, _selectedLink ;
    let _boardWidth, _boardHeight;  // 고정값 쓰려고한건데.. 좀 생각해보길..
    let _sharedLink, _isStart;


    function Sharing () { }

    Sharing.prototype = {

        /**
         * 파일위치 / 파일이름 / 리스트 출력 위치 / 이미지 출력 캔버스
         */
        init: function ( option ) {
            _url      = option.url;
            _filename = option.filename;
            _target   = option.target;

            return this;
         },


        appendImgList: function () {

            return new Promise (function (resolve, reject) {

                if ( _url instanceof Array ) {
                    try {
                        // 수정요청사항  append --> prepend
                        $( _target ).prepend( createPdfList() );
                        resolve();
                    } catch ( err ) {
                        reject();
                        console.log('element create errot ::: ', err)
                    }
                } else {
                    try {
                        $( _target ).prepend( createImgList() );
                        resolve();
                    } catch ( err ) {
                        reject();

                        console.log('element create errot ::: ', err)
                    }
                }
            })
        },
        fileUnShare: function () {
            const mainCtx = whiteboard.mainCanvas.getContext( '2d' ),
                  subCtx  = whiteboard.subCanvas.getContext( '2d' );

            mainCtx.clearRect(0, 0, whiteboard.width, whiteboard.height);
            subCtx.clearRect(0, 0, whiteboard.width, whiteboard.height);

			sharing.selectedLink = null;

			//whiteboard.resize(whiteboard.DEFAULT_WIDTH, whiteboard.DEFAULT_HEIGHT);
        },
        fileShare: function ( data ) {
            /**
             * 1. 화이트보드를 리사이징 한다.
             */
            const subCtx = whiteboard.subCanvas.getContext( '2d' )

            let img = new Image(),
                scaledVal,
                scaleVal,
                sendData;

            sharing.selectedLink = data.fileUrl
            img.src              = data.fileUrl;

            img.onload = function () {
                try {

                    scaleVal = new Scale({
                        standardHeight: $( '.document-canvas' ).height(),
                        standardWidth : $( '.document-canvas' ).width(),
                        targetHeight  : img.height,
                        targetWidth   : img.width
                    }).do();
                    sharing.fileUnShare();
                  //  whiteboard.resize( img.width * scaleVal, img.height * scaleVal );
                    subCtx.drawImage( img,0, 0, 1250, 610);

                    sendData = {
                        'eventOp'   : 'FileShareSvr',
                        'reqNo'     : data.reqNo,
                        'code'      : 200,
                        'message'   : 'OK',
                        'resDate'   : commonFn.getReqDate(),
                        'userId'    : data.userId,
                        'roomId'    : data.roomId,
                        'recvUserId': loginService.userInfo.id
                    }

                } catch ( err ) {
                    sendData = {
                        'eventOp'   : 'FileShareSvr',
                        'reqNo'     : data.reqNo,
                        'code'      : 444,
                        'message'   : err,
                        'resDate'   : commonFn.getReqDate(),
                        'userId'    : data.userId,
                        'roomId'    : data.roomId,
                        'recvUserId': loginService.userInfo.id
                    }
                }
                socketMessage.sendMessage('signal', 'knowledgetalk', sendData);
            }

        },
        reset: function (data) {
            let target = document.querySelector('#imgList');
            let view   = document.querySelector('#view');
            let view2 = document.querySelector("#view2");

            if(videoshow.getAttribute('src') !== "" && videoshow.getAttribute('src') !== null){
                // console.log( "화면공유가  떠있는 상태... 초기화 시키고 나가자");
                commonFn.whiteBoardShareExit();		    // 밖으로
                sharing.exitRoomAndClear();
                screenShare.ScreenShareExitEvent();
                commonFn.whiteBoardButtonClick();
            } 
            if (local_videoshow.getAttribute('src') !== "" && local_videoshow.getAttribute('src') !== null) {
                // console.log( "로컬 화면공유가  떠있는 상태... 초기화 시키고 나가자");
                sharing.exitRoomAndClear();
                screenShare.ScreenShareExitEvent();
            }

            //whiteboard.resize(whiteboard.DEFAULT_WIDTH, whiteboard.DEFAULT_HEIGHT);

            if ( commonFn.hasClass(view, 'open') ) commonFn.removeClass(view, 'open');
            if ( commonFn.hasClass(view2, 'open')) commonFn.removeClass(view2, 'open');
            //whiteboard.clear();
        },
        exitRoomAndClear: function ( w, h ) {

            const target     = document.querySelector('#imgList'),
                  shareBtn   = document.querySelector('#share'),
                  unShareBtn = document.querySelector('#unshare');

            let titles = target.querySelectorAll( 'div' ),
                lis    = target.querySelectorAll( 'li' ),
                sendData;

            /**
             * 1. whiteboard.sharedLink 초기화
             * 2. sharedLink의 클래스 'on' 제거
             * 3. shareBtn --> display  unShareBtn --> inline-block
             * 4. view --> 클래스 'open' 제거
             * 5. 화이트보드 리사이징 (본래의 화이트보드 크기로)
             * 6. li 및 title 제거
             * 7. 공유파일삭제
             */

            // 1
            sharing.selectedLink = '';

            // 3


            // 6
            for ( let title of titles) {
                title.parentNode.removeChild( title );
            }
            for( let li of lis ) {
                li.parentNode.removeChild( li );
            }

            // 4
            if ( target.style.display === 'inline-block' ) {
                target.style.display = 'none';
            }
            if ( commonFn.hasClass(view, 'open') ) commonFn.removeClass( view, 'open' );
            if ( commonFn.hasClass(view2, 'open') ) commonFn.removeClass( view2, 'open' );
            // 5
            if ( w && h ) {
               // whiteboard.resize( w, h );
            } else {
                //whiteboard.resize( whiteboard.DEFAULT_WIDTH, whiteboard.DEFAULT_HEIGHT );
            }

            meet_room.classList.add('on');
            id_list.classList.remove('on');
            article.classList.remove( 'whiteboard' );
            service.style.display = 'block';
            list.style.display = 'none';
            meet.style.display = 'block';
            meet_button.style.display = 'block';
            white.style.display = 'none';
            aside.style.display = "none";
            my_page.style.display = 'none';
            

            btn.classList.add('gray');
            // 이 부분 때문에 공유버튼 활성화가 되지 않았어...
            // 왜 isExitClick 플래그를 넣었는지 정확히 기억이 나지 않아 사이드 이펙트가 있을 수 있음.
            // if ( fix.isExitClick ) {
            //     btn.classList.remove('gray');
            //     fix.isExitClick = false;
            // } else {
            //     btn.classList.add('gray');
            // }
            
            //bkpark 삭제
            //공유파일삭제로직 추가
            // let formData = new FormData();
            // formData.append("roomId",loginService.userInfo.roomId);
            // console.log("bkpark?? 3");
            // uploadService.delete_file(formData)
            // .then(function ( result ) {
            //     //console.log("초기화시 삭제완료");
            // }).catch(function(result){
            //     //console.log("실패"+result);
            // });
        },

        isShareButtonEnable: function() {
            let shareButton = document.getElementById( 'click_bu' );
            return commonFn.hasClass( shareButton, 'gray' );
        },
    }

    function createPdfList () {

        const $div = document.createElement( 'div' ),
              $ul  = document.createElement( 'ul' );

        for ( let url of _url ) {
            const $li  = document.createElement( 'li' ),
                  $a   = document.createElement( 'a' ),
                  $img = document.createElement( 'img' );

            if (  !$div.innerHTML ) {
                $div.innerHTML = _filename;
                $div.setAttribute( 'class', 'tit' );
            }

            $img.setAttribute( 'src', url );
            $img.setAttribute( 'data-name', _filename );

            $a.setAttribute( 'href', '#' );

            $ul.appendChild( $li ).appendChild( $a ).appendChild( $img );
        }

        $div.appendChild( $ul );
        return $div
    }


    function createImgList () {

        const $li  = document.createElement('li'),
              $ul  = document.createElement('ul'),
              $a   = document.createElement('a'),
              $img = document.createElement('img'),
              $div = document.createElement('div');

        $div.innerHTML = _filename;
        $div.setAttribute('class', 'tit');

        $img.setAttribute('src', _url);
        $img.setAttribute('data-name', _filename);

        $a.setAttribute('href', '#');

        $div.appendChild($ul).appendChild($li).appendChild($a).appendChild($img);

        return $div;

    }

    Object.defineProperties(Sharing.prototype, {
        selectedLink: {
            get: function () { return _selectedLink },
            set: function (newVal) { _selectedLink = newVal }
        },
        sharedLink: {
            get: function () { return _sharedLink },
            set: function (newVal) {
                _sharedLink = newVal;
            }
        },
        isStart: {
            get: function () { return _isStart },
            set: function (newVal) {
                _isStart = newVal;
            }
        }
    })

    return Sharing;

})()
