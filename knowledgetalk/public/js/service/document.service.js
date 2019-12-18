function DocumentService(){
    this.isDocument = false;
}

DocumentService.prototype.setDocument = function(){
    let documentBox = document.getElementById('DocumentBox');
    let videoBox    = document.getElementById('VideoBox');

    //let tooltipbox = document.querySelector(".document-icon-box")

    //documentBox.appendChild(tooltipbox);
    //sessionStorage.setItem("lookaAtNow","Document")
    documentBox.style.display = 'block';
    commonService.isDocument = true;

    if(commonService.isDocument){
        if(!videoBox.classList.contains('isDocument')){
            videoBox.classList.add('isDocument');
        }
    }else{
        if(videoBox.classList.contains('isDocument')){
            videoBox.classList.remove('isDocument');
        }
    }
}
DocumentService.prototype.EndFileShare = function(){
    writeAuth = false;
    sharing.fileUnShare();
    let fileEndData = {
        eventOp : "FileShareEnd",
        reqNo : commonService.getReqNo(),
        userId : JSON.parse(sessionStorage.getItem("userInfo")).userId,
        reqDate : commonService.getReqDate(),
        roomId : sessionStorage.getItem("roomId")
    }
    commonService.sendSocketMessage(fileEndData);

    let sendData = {
        eventOp: "SessionReserveEnd",
        reqNo: commonService.getReqNo(),
        userId: JSON.parse(sessionStorage.getItem("userInfo")).userId,
        reqDate: commonService.getReqDate(),
        roomId: sessionStorage.getItem("roomId")
    };
    commonService.sendSocketMessage(sendData);
    //whiteboard.init()
}

DocumentService.prototype.EndFileShareRes = function(){

    sharing.fileUnShare();

}
DocumentService.prototype.UploadShare = function(){
    let formData = new FormData(dataform);
    formData.append("roomId",sessionStorage.getItem("roomId"));
    documentService.goPostURL(formData).then(function ( result ) {
        writeAuth = true;
		let _result = JSON.parse(result);
		let fileUrl   = _result.filename;
		let fileName  = _result.orgname;
		let fileType = _result.type;
        let r_id = _result.roomId;
		// 여기서 결과를 뿌려주면 된다.
		// UL 활성화
		if(fileType == "pdf"){
            pdfToCanvasBlob(fileUrl, function(err, blob, pages) {
                if (err) { throw err; }

                let blobData = new FormData();
                blobData.append("blob", blob);
                blobData.append("roomId",sessionStorage.getItem("roomId"));
                documentService.goBlobData(blobData).then(result => {
                    let _result = JSON.parse(result);
                    let fileUrl   = _result.filename;
                    let fileName  = _result.orgname;
                    let fileType = _result.type;
                    let r_id = _result.roomId;

                    documentService.listUpHandler(_result);
                    document.getElementsByClassName('stop-document')[0].style.display = 'block';
                    let sendData = {
                        eventOp      : 'FileShareStart',
                        fileInfoList : {filename: fileName, url: _result.filename},
                        reqNo        : commonService.getReqNo(),
                        reqDate      : commonService.getReqDate(),
                        roomId       : sessionStorage.getItem('roomId'),
                        userId       : JSON.parse(sessionStorage.getItem("userInfo")).userId
                    }
                    commonService.sendSocketMessage(sendData);
                });
            });
		}else{
             documentService.listUpHandler(_result);
             document.getElementsByClassName('stop-document')[0].style.display = 'block';
			let sendData = {
				eventOp      : 'FileShareStart',
				fileInfoList : {filename: fileName, url: _result.filename},
				reqNo        : commonService.getReqNo(),
				reqDate      : commonService.getReqDate(),
                roomId       : sessionStorage.getItem('roomId'),
				userId       : JSON.parse(sessionStorage.getItem("userInfo")).userId
			}
            commonService.sendSocketMessage(sendData);
		}

	})
	.catch(function(result){
		console.log("실패"+result);
	});
}

DocumentService.prototype.goPostURL= function(data){
	let g_http = documentService.getXMLHttpRequest();
	let result ;
    let url = "/upload/"+sessionStorage.getItem("roomId")
    //+sessionStorage.getItem("roomId");
    g_http.open("POST", url);
	g_http.send(data);
	// XMLHttpRequest 객체의 생성


	return new Promise(function(resolved, rejected){
		g_http.onreadystatechange = function (e) {
			if (g_http.readyState === XMLHttpRequest.DONE) {
				if(g_http.status === 200) {
					g_http.onload = function () {
						result = g_http.responseText;
						resolved(result);
					};
			    }else{
                  //  commonFn.alert( alertMsg['A47'] );
					//loading.style.display = 'none';
			    }
			}
		};
	});
}

DocumentService.prototype.goBlobData= function(data){
	let g_http = documentService.getXMLHttpRequest();
	let result ;
    let url = "/blob/"+sessionStorage.getItem("roomId")
    g_http.open("POST", url);
	g_http.send(data);
	// XMLHttpRequest 객체의 생성


	return new Promise(function(resolved, rejected){
		g_http.onreadystatechange = function (e) {
			if (g_http.readyState === XMLHttpRequest.DONE) {
				if(g_http.status === 200) {
					g_http.onload = function () {
						result = g_http.responseText;
						resolved(result);
					};
			    }else{
                  //  commonFn.alert( alertMsg['A47'] );
					//loading.style.display = 'none';
			    }
			}
		};
	});
}

DocumentService.prototype.getXMLHttpRequest = function(){
	if(window.ActiveXObject)
    {
        try
        {
            // IE 상위버전
            return new ActiveXObject("Msxml2.XMLHTTP");
        }
        catch(e1)
        {
            try
            {
                // IE 하위버전
                return new ActiveXObject("Microsoft.XMLHTTP");
            }
            catch(e2)
            {
                return null;
            }
        }
    }
    else if(window.XMLHttpRequest)
    {
        // 기타 브라우저
        return new XMLHttpRequest();
    }
    else
        return null;
}

DocumentService.prototype.listUpHandler = function ( result ) {
    const target     = document.querySelector('#imgList')

    // result 의 형태에 따라 달라 로직이 변경될 수 있음!
    let fileUrl   = result.filename,
        fileName  = result.orgname;

    showList().then( function () {

        sharing
            .init({
                url      : fileUrl,
                filename : fileName,
                target   : target,
            })
            .appendImgList()
            .then( function () {

                //loading.style.display = 'none';

                sharing.isStart = true;


                const selectedImg = new Image(),
                      subCtx      = whiteboard.subCanvas.getContext( '2d' ),
                      links       = target.querySelectorAll( 'a' );

                let scaleVal;

                links.forEach( function (link, index, array) {
                    // data-event 는 이벤트가 붙어있는 element에 대해서 따로 이벤트를 붙이지 않음을 알려주는 속성
                    if ( !links[index].getAttribute('data-event') ) {
                        links[index].setAttribute('data-event', 'add')

                        $( links[index] ).on( 'focusin', function ( e ) {
                            focusedEl = this
                        });

                        $( links[index] ).bind( 'click', function ( e ) {
                            e.preventDefault();

                            this.focus();

                            sharing.fileUnShare();
                           // if ( !commonFn.hasClass(this, 'on') ) {
                                sharing.selectedLink = link;
                                selectedImg.src      = link.children[0].getAttribute('src');
                                scaleVal = new Scale({
                                    // standardHeight: hasClass( ServiceBox, 'fullsize' ) ? window.innerHeight : $( '.document-canvas' ).height(),
                                    standardHeight: $( '.document-canvas' ).height(),
                                    // standardWidth : hasClass( ServiceBox, 'fullsize' ) ? window.innerWidth : $( '.document-canvas' ).width(),
                                    standardWidth : $( '.document-canvas' ).width(),
                                    targetHeight  : selectedImg.height,
                                    targetWidth   : selectedImg.width
                                }).do();
                               // whiteboard.resize( selectedImg.width * scaleVal, selectedImg.height * scaleVal );
                                subCtx.drawImage( selectedImg,(1250-(selectedImg.width * scaleVal))/2,(610-(selectedImg.height * scaleVal))/2,selectedImg.width * scaleVal, selectedImg.height * scaleVal);

                                if ( sharing.isStart ) {
                                    sendImage( this );
                                }
                            //}

                        });
                    }
                });
            })
    });
}

DocumentService.prototype.seledted = (event, self) => {
    event.preventDefault();
    let docList = document.querySelectorAll(".document-file-list > .tit");
    // for (let doc of docList) {
    //     doc.setAttribute("style", "height: 70px;");
    // }
    [].map.call(docList, obj => obj.setAttribute("style", "height: 70px;"));

    //self.setAttribute("style", "height: 70px; border: 3px blue dotted;");
}

function showList () {

    return new Promise( function ( resolve, reject ) {
        try {
            if ( target.style.display === 'none' ) {
                target.style.display = 'inline-block';

                setTimeout(function() {
                   // whiteboard.resize( $('.document-canvas').width(), $('.document-canvas').height() );
                }, 130)
            }

            if ( !commonFn.hasClass(view, 'open') ) commonFn.addClass(view, 'open');
            resolve()

        } catch ( err ) {
            reject( err )
        }
    })
}

function sendImage ( el ) {
    let self = el;
    for ( let link of target.querySelectorAll('a') ) {
        commonFn.removeClass( link, 'on' )
        // 요구사항 변경
        //commonFn.removeClass( link, 'click' )
    }
    commonFn.addClass( self, 'on' )

    commonService.sendSocketMessage( {
        'eventOp': 'FileShare',
        'reqNo'  : commonFn.getReqNo(),
        'reqDate': commonFn.getReqDate(),
        'roomId' : sessionStorage.getItem("roomId"),
        'userId' : JSON.parse(sessionStorage.getItem("userInfo")).userId,
        'fileUrl': self.children[ 0 ].getAttribute( 'src' ),
    });
}

function hasClass (el, className) {
    if ( el.classList )
        return el.classList.contains(className)
    else
        return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
}
/**
 * 작성일: 2017.10
 */
let Whiteboard = (function ( _window ) {
    'use strict';

    /**
     * 화이트보드 객체를 생성할 때 Option 인자로 기본값을 세팅할 수 있으며
     * 별도로 세팅을 하지 않았을 경우
     * 다음의 값으로 화이트보드 툴바를 세팅
     */
    const DEFAULT_TEXT_SIZE      = 24,
          DEFAULT_ERASER_SIZE    = 7,
          DEFAULT_COLOR          = '#000000',
          DEFAULT_THICKNESS      = 7,
          TEXTAREA_LINE_HEIGHT_S = 15,
          TEXTAREA_LINE_HEIGHT_M = 27,
          TEXTAREA_LINE_HEIGHT_L = 41,
          DEFAULT_BOARD_WIDTH    = 1250,
          DEFAULT_BOARD_HEIGHT   = 610,
          LIST_BOARD_WIDTH       = 1060,
          LIST_BOARD_HEIGHT      = 823,
          DEFAULT_TOOLTYPE       = 'tooltype_pen';


    let _boardWidth, _boardHeight;

    /**
     * 생성자를 통해 받은 캔버스와 소켓을 전역으로 사용하기 위해
     * 별도로 변수에 저장
     */
    let _mainCanvas, _mainCanvas2, _subCanvas;
    let _whiteCtx, _imgCtx;
    let _textarea;
    let diffWidth; // 화이트보드와 드로우영역 차이 ( Width )
    let diffHeight; // 화이트보드와 드로우영역 차이 ( Height )

    /**
     * Ginie App 성능을 위한 변수를 지정
     * mousemove 이벤트가 발생할 때 마다 지니에게 보내면 Ginie App에 과부화를 줄 여지가 있음
     * Interval 변수를 이용해 몇번 째 마다 보낼 것인지 정함
     */
    let _system = {
        interval  : 1,
        roop_time : 0
    }

    /**
     * 화이트 보드 툴바를 정의한 객체
     * 생성자 함수에서 값 초기화
     */
    let _toolbar = {
        type   : null,
        color  : null,
        pen    : { thickness: 7 },
        eraser : { size: null },
        text   : { contents: null, size: null }
    }

    /**
     * 마우스 객체
     */
    let _mouse = {
        start_pos : { x: 0, y: 0 },
        pos       : { x: 0, y: 0 }
    };

    function Whiteboard () {
        if ( !(this instanceof Whiteboard) ) {
            throw new TypeError("cannot call a class as a function");
        }
    }


    function downHandler ( e ) {
            if(writeAuth || isSharer){
                    let bounds = e.target.getBoundingClientRect(),
                    x = e.pageX - bounds.left - scrollX + 11,
                    y = e.pageY - bounds.top - scrollY + 11;
                _mainCanvas.addEventListener('mousemove', moveHandler, false);
                _mainCanvas2.addEventListener('mousemove', moveHandler, false);

                // 화이트보드를 클릭 했을 때 모든 툴팁을 닫는다.
                // tooltip.hide();


                _mouse.start_pos.x = _mouse.pos.x  = x
                _mouse.start_pos.y = _mouse.pos.y  = y


                // if ( _toolbar.type === 'tooltype_text' ) {
                //     printText();
                //     return;
                // }
                if ( _toolbar.type === 'tooltype_pen' ) {
                    draw('start');
                    return;
                }
                if ( _toolbar.type === 'tooltype_eraser' ) {
                    erase('start');
                    return;
                }
            }



    }

    function moveHandler ( e ) {
            let bounds = e.target.getBoundingClientRect(),
                x = e.pageX - bounds.left - scrollX + 11,
                y = e.pageY - bounds.top - scrollY + 11;

            _mouse.pos.x  = x;
            _mouse.pos.y  = y;

            if ( _toolbar.type === 'tooltype_text' ) {
                addTextarea();
                return;
            }
            if ( _toolbar.type === 'tooltype_pen' ) {
                draw( 'move' );
                return;
            }
            if ( _toolbar.type === 'tooltype_eraser' ) {
                erase( 'move' );
                return;
            }
    }

    function upHandler ( e ) {

        // if ( sharing.isShareButtonEnable() ) {

            let bounds = e.target.getBoundingClientRect(),
                x = e.pageX - bounds.left - scrollX + 11,
                y = e.pageY - bounds.top - scrollY + 11;

            _mainCanvas.removeEventListener('mousemove', moveHandler, false);
            _mainCanvas2.removeEventListener('mousemove', moveHandler, false);

            _mouse.pos.x = x;
            _mouse.pos.y = y;

            if ( _toolbar.type === 'tooltype_text' ) {
                //printText();
                return;
            }

            if ( _toolbar.type === 'tooltype_pen' ) {
                draw('end');
                return;
            }

            if ( _toolbar.type === 'tooltype_eraser' ) {
                erase('end');
                return;
            }
        // } else {
        //     commonFn.alert( alertMsg['A46'] );
        // }
    }


    /**
     *
     * 예외처리
     *
     *  캔버스에서 드로잉 중 마우스를 캔버스 밖으로 빼고 드로잉을 멈추면
     *  계속 mousemove 이벤트가 붙어있음.
     *  이 부분을 제거해주는 함수.
     *
     * @param {object} e
     */
    function exceptionHandler (e) {
        _mainCanvas.removeEventListener( 'mousemove', moveHandler, false );
        _mainCanvas2.removeEventListener( 'mousemove', moveHandler, false );
    }

    function draw ( point ) {
        let startlinesize = '7';
        let sendData;
        if ( (point === 'start' && writeAuth === true) || (point === 'start' && isSharer === true && commonService.isSharing === true)) {
            _whiteCtx.globalCompositeOperation = 'source-over';
            _whiteCtx.lineWidth                = _toolbar.pen.thickness;
            _whiteCtx.strokeStyle              = _toolbar.color;
            _whiteCtx.lineJoin                 = 'round';
            //_whiteCtx.lineCap                  = 'round';
            _whiteCtx.lineCap = "round";
            _whiteCtx.beginPath();
            _whiteCtx.moveTo( _mouse.pos.x, _mouse.pos.y );

            sessionStorage.getItem("pen")===null ? startlinesize = '7' : startlinesize = sessionStorage.getItem("pen")
            let sendDataLine = {
                'signalOp' : 'LineSize',
                'roomId'    : sessionStorage.getItem("roomId"),
                'reqNo'    : commonFn.getReqNo(),
                'lineSize' : startlinesize
            }
            let sendDataColor = {
                'signalOp' : 'Color',
                'roomId'    : sessionStorage.getItem("roomId"),
                'reqNo'    : commonFn.getReqNo(),
                'color'    : sessionStorage.getItem("color")
            }

            commonService.sendSocketMessage(sendDataLine);
            commonService.sendSocketMessage(sendDataColor);

            if(sessionStorage.getItem("lookat")==="document") {
                sendData = {
                    'signalOp': 'Draw',
                    'roomId': sessionStorage.getItem("roomId"),
                    'axisX': _mouse.pos.x,
                    'axisY': _mouse.pos.y,
                    'boardWidth': _mainCanvas.width,
                    'boardHeight': _mainCanvas.height,
                    'status': 'start',
                    'type': sessionStorage.getItem("screen")
                }
            }else if(sessionStorage.getItem("lookat")==="screenshare") {
                sendData = {
                    'signalOp': 'Draw',
                    'roomId': sessionStorage.getItem("roomId"),
                    'axisX': _mouse.pos.x,
                    'axisY': _mouse.pos.y,
                    'boardWidth': _mainCanvas2.width,
                    'boardHeight': _mainCanvas2.height,
                    'status': 'start',
                    'type': sessionStorage.getItem("screen")
                }

            }

            commonService.sendSocketMessage(  sendData );
            return;
        }

        if ( (point === 'move' && writeAuth === true) || (point === 'move' && isSharer === true && commonService.isSharing === true)) {
            _whiteCtx.lineTo( _mouse.pos.x , _mouse.pos.y );
            _whiteCtx.stroke();
            if(sessionStorage.getItem("lookat")==="document") {
                sendData = {
                    'signalOp': 'Draw',
                    'roomId': sessionStorage.getItem("roomId"),
                    'axisX': _mouse.pos.x,
                    'axisY': _mouse.pos.y,
                    'boardWidth': _mainCanvas.width,
                    'boardHeight': _mainCanvas.height,
                    'status': 'move',
                    'type': sessionStorage.getItem("screen")
                }
            }else if (sessionStorage.getItem("lookat")==="screenshare"){
                sendData = {
                    'signalOp': 'Draw',
                    'roomId': sessionStorage.getItem("roomId"),
                    'axisX': _mouse.pos.x,
                    'axisY': _mouse.pos.y,
                    'boardWidth': _mainCanvas2.width,
                    'boardHeight': _mainCanvas2.height,
                    'status': 'move',
                    'type': sessionStorage.getItem("screen")
                }
            }

            if ( (_system.roop_time ++ % _system.interval) === 0 ) {
                commonService.sendSocketMessage( sendData );
            }
            return;
        }

        if ( (point === 'end' && writeAuth === true) || (point === 'end' && isSharer === true && commonService.isSharing === true)) {
            _whiteCtx.closePath();
            if(sessionStorage.getItem("lookat")==="document") {
                sendData = {
                    'signalOp': 'Draw',
                    'roomId': sessionStorage.getItem("roomId"),
                    'axisX': _mouse.pos.x,
                    'axisY': _mouse.pos.y,
                    'boardWidth': _mainCanvas.width,
                    'boardHeight': _mainCanvas.height,
                    'status': 'end',
                    'type': sessionStorage.getItem("screen")
                }
            }else if (sessionStorage.getItem("lookat")==="screenshare"){
                sendData = {
                    'signalOp': 'Draw',
                    'roomId': sessionStorage.getItem("roomId"),
                    'axisX': _mouse.pos.x,
                    'axisY': _mouse.pos.y,
                    'boardWidth': _mainCanvas2.width,
                    'boardHeight': _mainCanvas2.height,
                    'status': 'end',
                    'type': sessionStorage.getItem("screen")
                }
            }

            commonService.sendSocketMessage(sendData );
            return;
        }
    }



    function erase  (point ) {
        let sendData;


        if ( (point === 'start' && writeAuth === true) || (point === 'start' && isSharer === true && commonService.isSharing === true) ) {
            _whiteCtx.globalCompositeOperation = 'destination-out';
            _whiteCtx.fillStyle                = '#ffffff';
            _whiteCtx.strokeStyle              = '#ffffff';
            _whiteCtx.lineWidth                = _toolbar.eraser.size;
            _whiteCtx.lineCap = "round";
            _whiteCtx.beginPath();
            _whiteCtx.moveTo( _mouse.pos.x, _mouse.pos.y );

            let sendDataErage = {
                'signalOp'  : 'EraserSize',
                'roomId'    : sessionStorage.getItem("roomId"),
                'reqNo'     : commonFn.getReqNo(),
                'eraserSize': sessionStorage.getItem("EraserSize")
            }

            commonService.sendSocketMessage(sendDataErage);

            if(sessionStorage.getItem("lookat")==="document") {
                sendData = {
                    'signalOp'    : 'Erase',
                    'roomId'      : sessionStorage.getItem("roomId"),
                    'axisX'       : _mouse.pos.x ,
                    'axisY'       : _mouse.pos.y ,
                    'boardWidth'  : _mainCanvas.width,
                    'boardHeight' : _mainCanvas.height,
                    'status'      : 'start'
                }
            }else{
                sendData = {
                    'signalOp'    : 'Erase',
                    'roomId'      : sessionStorage.getItem("roomId"),
                    'axisX'       : _mouse.pos.x ,
                    'axisY'       : _mouse.pos.y ,
                    'boardWidth'  : _mainCanvas2.width,
                    'boardHeight' : _mainCanvas2.height,
                    'status'      : 'start'
                }
            }
            commonService.sendSocketMessage(sendData );

            return;
        }

        if ( (point === 'move' && writeAuth === true) || (point === 'move' && isSharer === true && commonService.isSharing === true) ) {
            _whiteCtx.lineTo( _mouse.pos.x , _mouse.pos.y );
            _whiteCtx.stroke();
            if(sessionStorage.getItem("lookat")==="document") {
                sendData = {
                    'signalOp'   : 'Erase',
                    'roomId'     : sessionStorage.getItem("roomId"),
                    'axisX'      : _mouse.pos.x ,
                    'axisY'      : _mouse.pos.y ,
                    'boardWidth' : _mainCanvas.width,
                    'boardHeight': _mainCanvas.height,
                    'status'     : 'move'
                }
            }else{
                sendData = {
                    'signalOp'   : 'Erase',
                    'roomId'     : sessionStorage.getItem("roomId"),
                    'axisX'      : _mouse.pos.x ,
                    'axisY'      : _mouse.pos.y ,
                    'boardWidth' : _mainCanvas2.width,
                    'boardHeight': _mainCanvas2.height,
                    'status'     : 'move'
                }
            }

            if ( (_system.roop_time ++ % _system.interval) === 0 ) {
                commonService.sendSocketMessage(sendData );
            }
            return;
        }

        if ( (point === 'end' && writeAuth === true) || (point === 'end' && isSharer === true && commonService.isSharing === true) ) {
            _whiteCtx.closePath();
            if(sessionStorage.getItem("lookat")==="document") {
                sendData = {
                    'signalOp'   : 'Erase',
                    'roomId'     : sessionStorage.getItem("roomId"),
                    'axisX'      : _mouse.pos.x ,
                    'axisY'      : _mouse.pos.y ,
                    'boardWidth' : _mainCanvas.width,
                    'boardHeight': _mainCanvas.height,
                    'status'     : 'end'
                }
            }else{
                sendData = {
                    'signalOp'   : 'Erase',
                    'roomId'     : sessionStorage.getItem("roomId"),
                    'axisX'      : _mouse.pos.x ,
                    'axisY'      : _mouse.pos.y ,
                    'boardWidth' : _mainCanvas2.width,
                    'boardHeight': _mainCanvas2.height,
                    'status'     : 'end'
                }
            }

            commonService.sendSocketMessage(sendData );
            return;
        }
    }


    function addTextarea (point) {

        let x      = Math.min( _mouse.pos.x, _mouse.start_pos.x ),
		    y      = Math.min( _mouse.pos.y, _mouse.start_pos.y ),
		    width  = Math.abs( _mouse.pos.x - _mouse.start_pos.x ),
            height = Math.abs( _mouse.pos.y - _mouse.start_pos.y );


        let ww = $( '#whiteboard' ).innerWidth(); // Whiteboard Width
        let wh = $( '#whiteboard' ).innerHeight(); // Whiteboard Height
        let dw = $( '.draw' ).innerWidth(); // Draw Area Width
        let dh = $( '.draw' ).innerHeight(); // Draw Area Height

        if ( dw > ww ) {
            diffWidth = (dw - ww) / 2
        } else {
            diffWidth = 0;
        }

        if ( dh > wh ) {
            diffHeight = (dh - wh) / 2
        } else {
            diffHeight = 0;
        }

        x = x + diffWidth;
        y = y + diffHeight;

        _textarea.style.font    = `${ _toolbar.text.size }px Verdana`;
        _textarea.style.left    = `${ x }px`;
        _textarea.style.top     = `${ y }px`;
        _textarea.style.width   = `${ width }px`;
        _textarea.style.height  = `${ height }px`;
        _textarea.style.display = 'block';

        document.querySelector( '.draw' ).appendChild( _textarea );
        _textarea.focus();
    }

    function applyLineBreaks() {
        // [ this ] is textarea element
        let contents = this.value,
            emptyWidth = this.scrollWidth,
            i = 0;

        this.setAttribute( 'wrap', 'off' );
        this.value = '';

        //let nLastWrappingIndex = -1; //

        for ( ; i < contents.length; i++ ) {
            let letter = contents.charAt( i );

            // if (letter == ' ' || letter == '-' || letter == '+') {
            //     nLastWrappingIndex = i;
            // }

            this.value += letter;

            if ( this.scrollWidth > emptyWidth ) {
                let buffer = '';

                // if (nLastWrappingIndex >= 0) {
                //     for (let j = nLastWrappingIndex + 1; j < i; j++)
                //         buffer += contents.charAt(j);
                //     nLastWrappingIndex = -1;
                // }

                buffer += letter;
                this.value = this.value.substr( 0, this.value.length - buffer.length );
                this.value += "\n" + buffer;
            }
        }
        this.setAttribute( 'wrap', '' );

        return this;
    }


    function getLineHeight () {
        if ( _toolbar.text.size === 12 ) {
            return TEXTAREA_LINE_HEIGHT_S;
        } else if ( _toolbar.text.size === 24 ) {
            return TEXTAREA_LINE_HEIGHT_M;
        } else if ( _toolbar.text.size === 48 ) {
            return TEXTAREA_LINE_HEIGHT_L;
        }
    }

    function removeTextarea () {
        if ( _textarea.value ) {
            _textarea.style.display = 'none';
            _textarea.value = '';
        }
    }


    Whiteboard.prototype = {
        toolbar: {}, pen: {},  text: {}, eraser: {},
        setWhiteboard: data => {

            if (data === 'document') {
                _whiteCtx = _mainCanvas.getContext('2d');
                sessionStorage.setItem("screen",data)
            }
            else if (data === 'screenSharing') {
                _whiteCtx = _mainCanvas2.getContext('2d');
                sessionStorage.setItem("screen",data)
            }
        },

        init: function ( option ) {
            sessionStorage.setItem("nowval","pen")
            sessionStorage.setItem("color","black")
            if ( !option ) option = {};
            try {
                if ( !option.whiteCanvas || !option.imgCanvas )
                    throw 'you must initialize a canvas for whiteboard & imageboard';

                _mainCanvas = option.whiteCanvas;
                _subCanvas  = option.imgCanvas;

                _mainCanvas2 = option.whiteCanvas2;

                _boardWidth  = _subCanvas.width  = _mainCanvas.width  = _mainCanvas2.width  = ( typeof option.width !== 'undefined' )  ? option.width  : DEFAULT_BOARD_WIDTH;
                _boardHeight = _subCanvas.height = _mainCanvas.height = _mainCanvas2.height  = ( typeof option.height !== 'undefined' ) ? option.height : DEFAULT_BOARD_HEIGHT;

                _toolbar.type          = ( typeof option.tooltype !== 'undefined' )    ? option.tooltype    : DEFAULT_TOOLTYPE;
                _toolbar.color         = ( typeof option.color !== 'undefined' )       ? option.color       : DEFAULT_COLOR;
                _toolbar.pen.thickness = ( typeof option.thickness !== 'undefined' )   ? option.thickness   : DEFAULT_THICKNESS;
                _toolbar.eraser.size   = ( typeof option.eraser_size !== 'undefined' ) ? option.eraser_size : DEFAULT_ERASER_SIZE;
                _toolbar.text.size     = ( typeof option.text_size !== 'undefined' )   ? option.text_size   : DEFAULT_TEXT_SIZE;

                _whiteCtx = _mainCanvas.getContext( '2d' );
                _imgCtx   = _subCanvas.getContext( '2d' );
                //_whiteCtx.lineCap          = "round";
                _whiteCtx.lineJoin         = "round";
                _whiteCtx.lineWidth         = 7;
                _textarea                  = document.createElement( 'textarea' );
                _textarea.id               = 'text_tool';
                _textarea.style.position   = 'absolute';
                _textarea.style.border     = '1px dashed black';
                _textarea.style.display    = 'none';
                _textarea.style.overflow   = 'hidden';
                _textarea.style.whiteSpace = 'pre-line';
                _mainCanvas.addEventListener( 'mousedown', downHandler, false );
                _mainCanvas.addEventListener( 'mouseup', upHandler, false );
                _mainCanvas2.addEventListener( 'mousedown', downHandler, false );
                _mainCanvas2.addEventListener( 'mouseup', upHandler, false );
                _window.addEventListener( 'mouseup', exceptionHandler, false );

            } catch( err ) {
                console.log( "init", err );
            }

            try {

                removeColorFocus( wb.Color, function() {
                    if (color_black.classList)
                        color_black.classList.add('on');
                });
            } catch (err) {
                console.log( "remove color focus ", err );
            }


                // removeTextFocus( wb.TextTool.size, function() {
                //     text_medium.classList.add('on');
                // })
            try {
                removePenFocus( wb.Pen.thickness, function() {
                    if (pen_small.classList)
                        pen_small.classList.add('on');
                })
            } catch (err) {
                console.log( "remove pen focus ", err );
            }

            // console.log(eraser_large)
            // try {
            //     removeEraserFocus( wb.Eraser.size, function() {
            //         // alert('잠만')
            //         if (eraser_large && eraser_large.classList)
            //             eraser_large.classList.add('on');
            //     })
            // } catch (err) {
            //     console.log( "remove eraser focus ", err );
            // }



        },

        resize: function ( w, h ) {
            _boardWidth  = _mainCanvas2.width = _mainCanvas.width  = _subCanvas.width = ( typeof w !== 'undefined' ) ? w : _mainCanvas.width;
            _boardHeight = _mainCanvas2.height = _mainCanvas.height = _subCanvas.height = ( typeof h !== 'undefined' ) ? h : _mainCanvas.height;

        },

        clear: function ( who ) {
            let sendData;

            // 소켓에서 보낸 경우
            if ( who === 'their' ) {
                _whiteCtx.clearRect(0, 0, _mainCanvas.width, _mainCanvas.height);
                return;
            }

            sendData = {
                'signalOp'  : 'EraserSize',
                'eraserSize': -1,
                'reqNo'     : commonFn.getReqNo(),
                'reqDate'   : commonFn.getReqDate(),
                'roomId'    : sessionStorage.getItem("roomId")
            }
            _whiteCtx.clearRect( 0, 0, _mainCanvas.width, _mainCanvas.height );
            commonService.sendSocketMessage(sendData );
        },

        fullscreen: function ( option ) {

            if ( option.type === '+' ) {
                _subCanvas.width = _mainCanvas.width = option.width ? option.width : window.innerWidth;
                _subCanvas.height = _mainCanvas.height = option.height ? option.height : window.innerHeight;

            } else if (option.type === '-') {
                _subCanvas.width = _mainCanvas.width = option.width ? option.width : _boardWidth;
                _subCanvas.height = _mainCanvas.height = option.height ? option.height : _boardHeight;
            }

            whiteboard.mainCanvas.width = $( '.draw' ).width();
            whiteboard.subCanvas.width = $( '.draw' ).width();
            whiteboard.mainCanvas.height = $( '.draw' ).height();
            whiteboard.subCanvas.height = $( '.draw' ).height();

            return this;
        },

        insertImage: function ( imgURL, drawURL ) {
            let imgArea  = new Image(),
                drawArea = new Image();

            let scaleVal, newWidth, newHeight;
            if ( imgURL ) {

                imgArea.src  = imgURL;
                drawArea.src = drawURL;

                imgArea.onload = function () {

                    scaleVal = new Scale({
                        standardHeight: _mainCanvas.height,
                        standardWidth : _mainCanvas.width,
                        targetHeight  : imgArea.height,
                        targetWidth   : imgArea.width
                    }).do();

                    newWidth  = imgArea.width * scaleVal;
                    newHeight = imgArea.height * scaleVal;

                    _subCanvas.width  = _mainCanvas.width = newWidth;
                    _subCanvas.height = _mainCanvas.height = newHeight;

                    _imgCtx.drawImage( imgArea, 0, 0, imgArea.width, imgArea.height, 0, 0, newWidth, newHeight )

                    drawArea.onload = function () {
                        _whiteCtx.drawImage( drawArea, 0, 0, drawArea.width, drawArea.height, 0, 0, newWidth, newHeight );
                    }
                }

            } else {
                drawArea.src = drawURL;
                drawArea.onload = function () {
                    _whiteCtx.drawImage( drawArea, 0, 0, drawArea.width, drawArea.height, 0, 0, _mainCanvas.width, _mainCanvas.height );
                }
            }


        },

        draw: function ( data ) {
            if(sessionStorage.getItem("lookat")==="screenshare") {
                let x     = (data.axisX * _mainCanvas2.width) / data.boardWidth,
                y     = (data.axisY * _mainCanvas2.height) / data.boardHeight,
                point = data.status;
                if ( point === 'start') {
                    _whiteCtx.globalCompositeOperation = 'source-over';
                    _whiteCtx.lineWidth                = _toolbar.pen.thickness;
                    _whiteCtx.strokeStyle              = _toolbar.color;
                    _whiteCtx.lineJoin                 = 'round';
                    //_whiteCtx.lineCap                  = 'round';
                    _whiteCtx.lineCap = "round";
                    _whiteCtx.beginPath();
                    _whiteCtx.moveTo( x, y );
                   return;
               }

               if ( point === 'move' ) {
                   _whiteCtx.lineTo( x, y );
                   _whiteCtx.stroke();
               }

               if ( point === 'end' ) {
                   _whiteCtx.closePath();
                   return;
               }
            }else if (sessionStorage.getItem("lookat")==="document"){
                let x     = (data.axisX * _mainCanvas.width) / data.boardWidth,
                y     = (data.axisY * _mainCanvas.height) / data.boardHeight,
                point = data.status;
                if ( point === 'start') {
                    _whiteCtx.globalCompositeOperation = 'source-over';
                    _whiteCtx.lineWidth                = _toolbar.pen.thickness;
                    _whiteCtx.strokeStyle              = _toolbar.color;
                    _whiteCtx.lineJoin                 = 'round';
                    //_whiteCtx.lineCap                  = 'round';
                    _whiteCtx.lineCap = "round";
                    _whiteCtx.beginPath();
                    _whiteCtx.moveTo( x, y );
                   return;
               }

               if ( point === 'move' ) {
                   _whiteCtx.lineTo( x, y );
                   _whiteCtx.stroke();
               }

               if ( point === 'end' ) {
                   _whiteCtx.closePath();
                   return;
               }
            }


            // if ( point === 'start') {
            //      _whiteCtx.globalCompositeOperation = 'source-over';
            //      _whiteCtx.lineWidth                = _toolbar.pen.thickness;
            //      _whiteCtx.strokeStyle              = _toolbar.color;
            //      _whiteCtx.lineJoin                 = 'round';
            //      //_whiteCtx.lineCap                  = 'round';

            //      _whiteCtx.beginPath();
            //      _whiteCtx.moveTo( x, y );
            //     console.log(_whiteCtx)
            //     return;
            // }

            // if ( point === 'move' ) {
            //     _whiteCtx.lineTo( x, y );
            //     _whiteCtx.stroke();
            // }

            // if ( point === 'end' ) {
            //     _whiteCtx.closePath();
            //     return;
            // }
        },

        erase: function ( data ) {
            let x     = (data.axisX * _mainCanvas.width) / data.boardWidth,
                y     = (data.axisY * _mainCanvas.height) / data.boardHeight,
                point = data.status;

            if ( point === 'start' ) {
                _whiteCtx.globalCompositeOperation = 'destination-out';
                _whiteCtx.fillStyle                = '#ffffff';
                _whiteCtx.strokeStyle              = '#ffffff';
                _whiteCtx.lineWidth                = _toolbar.eraser.size;
                _whiteCtx.lineCap = "round";
                _whiteCtx.beginPath();
                _whiteCtx.moveTo ( x, y );

                return;
            }

            if ( point === 'move' ) {
                _whiteCtx.lineTo( x, y );
                _whiteCtx.stroke();

                return;
            }

            if ( point === 'end' ) {
                _whiteCtx.closePath();
                return;
            }
        },

        write: function (data) {

            let x        = (data.axisX * _mainCanvas.width) / data.boardWidth,
                y        = (data.axisY * _mainCanvas.height) / data.boardHeight,
                color    = data.color,
                contents = data.text,
                size     = data.size,
                lines    = contents.split( '\n' ),
                i        = 0;

             _whiteCtx.textBaseline             = 'top';
             _whiteCtx.textAlign                = 'left';
             _whiteCtx.font                     = `${ size }px Arial`;
             _whiteCtx.fillStyle                = color;
             _whiteCtx.globalCompositeOperation = 'source-over';

             for ( ; i < lines.length ; i ++ ) {
                 _whiteCtx.fillText( lines[i], x, y + (i * data.lineHeight) );
             }
        },

        boardData: function ( option ) {

            option = {};

            _toolbar.type          = ( typeof option.tooltype !== 'undefined' )    ? option.tooltype    : DEFAULT_TOOLTYPE;
            _toolbar.color         = ( typeof option.color !== 'undefined' )       ? option.color       : DEFAULT_COLOR;
            _toolbar.pen.thickness = ( typeof option.thickness !== 'undefined' )   ? option.thickness   : DEFAULT_THICKNESS;
            _toolbar.eraser.size   = ( typeof option.eraser_size !== 'undefined' ) ? option.eraser_size : DEFAULT_ERASER_SIZE;
            _toolbar.text.size     = ( typeof option.text_size !== 'undefined' )   ? option.text_size   : DEFAULT_TEXT_SIZE;

            removeColorFocus( wb.Color, function() {
                color_black.classList.add('on');
            });

            // removeTextFocus( wb.TextTool.size, function() {
            //     text_medium.classList.add('on');
            // })

            removePenFocus( wb.Pen.thickness, function() {
                pen_medium.classList.add('on');
            })

            // removeEraserFocus( wb.Eraser.size, function() {
            //     eraser_large.classList.add('on');
            // })
        }
    }

    Object.defineProperty( Whiteboard.prototype.eraser, 'size', {
        set: function ( newVal ) { _toolbar.eraser.size = newVal; },
        get: function () { return _toolbar.eraser.size; }
    })

    Object.defineProperty( Whiteboard.prototype.text, 'size', {
        set: function ( newVal ) { _toolbar.text.size = newVal; },
        get: function () { return _toolbar.text.size; }
    })

    Object.defineProperty( Whiteboard.prototype.toolbar, 'type', {
        set: function ( newVal ) { _toolbar.type = newVal; },
        get: function () { return _toolbar.type; }
    })

    Object.defineProperty( Whiteboard.prototype.pen, 'thickness', {
        set: function ( newVal ) { _toolbar.pen.thickness = newVal; },
        get: function () { return _toolbar.pen.thickness }
    })

    Object.defineProperties(Whiteboard.prototype, {
        color : {
            set: function ( newVal ) { _toolbar.color = newVal; },
            get: function () { return _toolbar.color; }
        },

        LIST_UP_HEIGHT: {
            get: function () { return LIST_BOARD_HEIGHT },
            configurable: false,
        },
        LIST_UP_WIDTH: { get: function () { return LIST_BOARD_WIDTH },
            configurable: false,
        },
        DEFAULT_HEIGHT: {
            get: function () { return DEFAULT_BOARD_HEIGHT },
            configurable: false,
        },
        DEFAULT_WIDTH: {
            get: function () { return DEFAULT_BOARD_WIDTH },
            configurable: false,
        },
        width : {
            set: function ( newVal ) { _boardWidth = newVal; },
            get: function () { return _boardWidth; }
        },
        height: {
            set: function ( newVal ) { _boardHeight = newVal; },
            get: function () { return _boardHeight; }
        },
        mainCanvas: {
            set: function ( newVal ) { _mainCanvas = newVal; },
            get: function () { return _mainCanvas; }
        },
        mainCanvas2: {
            set: function ( newVal ) { _mainCanvas2 = newVal; },
            get: function () { return _mainCanvas2; }
        },
        subCanvas: {
            set: function ( newVal ) { _subCanvas = newVal; },
            get: function () { return _subCanvas; }
        },

    })

    function removeColorFocus( els, callback ) {
        // 여기서 모두 지운다음
        Object.keys(els).map(function (key) {
            if (key.classList) {
                commonFn.removeClass(document.querySelector(`#color_${key}`), 'on');
            }
            callback();
        });
    }

    // function removeTextFocus( els, callback ) {
    //     // 여기서 모두 지운다음
    //     Object.keys(els).map(function (key) {
    //         commonFn.removeClass(document.querySelector(`#text_${key}`), 'on');
    //         callback();
    //     });
    // }

    function removePenFocus( els, callback ) {
        // 여기서 모두 지운다음
        Object.keys(els).map(function (key) {
            if (key.classList) {
                commonFn.removeClass(document.querySelector(`#pen_${key}`), 'on');
            }
            callback();
        });
    }

    function removeEraserFocus( els, callback ) {
        // 여기서 모두 지운다음
        Object.keys(els).map(function (key) {
            if (key.classList) {
                commonFn.removeClass(document.querySelector(`#eraser_${key}`), 'on');
            }
            callback();
        });
    }

    return Whiteboard;

})( window );
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
                    //whiteboard.resize( img.width * scaleVal, img.height * scaleVal );
                    subCtx.drawImage( img,(1250-(img.width * scaleVal))/2, (610-(img.height* scaleVal))/2, img.width * scaleVal, img.height * scaleVal);


                    sendData = {
                        'eventOp'   : 'FileShareSvr',
                        'reqNo'     : data.reqNo,
                        'code'      : 200,
                        'message'   : 'OK',
                        'resDate'   : commonFn.getReqDate(),
                        'userId'    : data.userId,
                        'roomId'    : data.roomId,
                        'recvUserId': JSON.parse(sessionStorage.getItem("userInfo")).userId
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
                        'recvUserId': JSON.parse(sessionStorage.getItem("userInfo")).userId
                    }
                }
                commonService.sendSocketMessage(sendData);
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
                //whiteboard.resize( w, h );
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

        //$div.innerHTML = _filename;
        $div.setAttribute('class', 'tit');
        $div.setAttribute('style', 'height : 70px;');
        $div.setAttribute("onclick", "documentService.seledted(event, this)");

        $img.setAttribute('src', _url);
        //$img.setAttribute('style', 'width : 90px;height : 65px;');
        //$img.setAttribute('data-name', _filename);

        $a.setAttribute('href', '#');

        $div.appendChild($li).appendChild($a).appendChild($img);
        //appendChild($ul).
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

const Scale = (function () {
    'use strict';

    function Scale ( option ) {
        try {

            if ( !option ) throw `you need target object property ( standard and target width & height property )
            like this ...
            {
                standardHeight: 283,
                standardWidth : 488,
                targetHeight  : 917,
                targetWidth   : 236
            }
            `;

            this.standardHeight = option.standardHeight;
            this.standardWidth = option.standardWidth;
            this.targetHeight   = option.targetHeight;
            this.targetWidth   = option.targetWidth;

        } catch ( err ) {
            console.error( err );
        }
    }

    Scale.prototype = {
        do: function ( ) {
            let standardAspect,
                targetAspect,
                scale,
                newWidth,
                newHeight;

            standardAspect = this.standardHeight / this.standardWidth;
            targetAspect   = this.targetHeight / this.targetWidth;

            if ( isImageLargerThanBoard.call(this) ) {
                if ( targetAspect <= standardAspect ) {
                    return Math.floor( (this.standardWidth / this.targetWidth) * 10000 ) / 10000;
                } else {
                    return Math.floor( (this.standardHeight / this.targetHeight) * 10000 ) / 10000;
                }
            } else {
                return 1;
            }

            function isImageLargerThanBoard () {
                return true; // 이것은 작은 이미지가 들어오면 알맞게 사이즈를 늘린다.
               // return this.targetWidth >= this.standardWidth || this.targetHeight >= this.standardHeight;
            }

        }
    }

    return Scale;

})()


let sharing            = new Sharing();
let documentService = new DocumentService();
let whiteboard         = new Whiteboard();
