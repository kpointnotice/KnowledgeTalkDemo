document.addEventListener("DOMContentLoaded", function () {
  const ToolTip = (function () {
    "use strict";

    let _tooltip;

    function ToolTip(tooltip) {
      _tooltip = tooltip || document.querySelectorAll(".tooltip");
    }

    ToolTip.prototype = {
      hide: function () {
        for (let tt of _tooltip) {
          tt.style.display = "none";
        }
      }
    };

    return ToolTip;
  })();

  const tooltip = new ToolTip(document.querySelectorAll(".tooltip"));
  // $( window ).resize(function() {
  //     scrollEvent = true;
  //     sharing.selectedLink = null;
  //     if(sessionStorage.getItem("lookat")==="document"){
  //         console.log("resize document canvas :::" , $( '.document-canvas' ).width())
  //         whiteboard.mainCanvas.width = $( '.document-canvas' ).width();
  //         whiteboard.mainCanvas.height = $( '.document-canvas' ).height();
  //         whiteboard.subCanvas.width = $( '.document-canvas' ).width();
  //         whiteboard.subCanvas.height = $( '.document-canvas' ).height();
  //     }else if(sessionStorage.getItem("lookat")==="screenshare") {
  //         console.log("resize screen-video canvas :::" , $( '.screen-video' ).width())
  //         whiteboard.mainCanvas2.width = $( '.screen-video' ).width();
  //         whiteboard.mainCanvas2.height = $( '.screen-video' ).height();
  //     }

  // })

  /**
   * whiteboard default value
   */
  const BOARD_WIDTH = 1250,
    BOARD_HEIGHT = 610,
    ERASER_SIZE_S = 7,
    ERASER_SIZE_M = 15,
    ERASER_SIZE_L = 21,
    PEN_SIZE_S = 7,
    PEN_SIZE_M = 15,
    PEN_SIZE_L = 21,
    TEXT_SIZE_S = 12,
    TEXT_SIZE_M = 24,
    TEXT_SIZE_L = 48,
    COLOR_BLACK = "#000000",
    COLOR_WHITE = "#ffffff",
    COLOR_YELLOW = "#fdd835",
    COLOR_RED = "#b71c1c",
    COLOR_GREEN = "#689f38",
    COLOR_BLUE = "#1565c0",
    COLOR_PURPLR = "#cc00cc",
    COLOR_PINK = "#ff007f";

  /**
   * tool list
   */
  const tooltype = ["tooltype_pen", "tooltype_color", "tooltype_eraser"];

  /**
   * eraser object
   */
  const Eraser = {
    size: {
      small: ERASER_SIZE_S,
      medium: ERASER_SIZE_M,
      large: ERASER_SIZE_L
    }
  };

  /**
   * pen object
   */
  const Pen = {
    thickness: {
      small: PEN_SIZE_S,
      medium: PEN_SIZE_M,
      large: PEN_SIZE_L
    }
  };

  /**
   * color object
   */
  const Color = {
    black: COLOR_BLACK,
    // white  : COLOR_WHITE,
    yellow: COLOR_YELLOW,
    red: COLOR_RED,
    green: COLOR_GREEN,
    blue: COLOR_BLUE
    // purple : COLOR_PURPLR,
    // pink   : COLOR_PINK
  };

  /**
   * text tool object
   */
  const TextTool = {
    size: {
      small: TEXT_SIZE_S,
      medium: TEXT_SIZE_M,
      large: TEXT_SIZE_L
    }
  };

  /*
   *
   *
   */
  wb = {
    TextTool,
    Color,
    Pen,
    Eraser
  };

  let whiteCanvas, imageCanvas, tmpCanvas;
  let wrap, fullscreen, view;
  whiteCanvas = document.querySelector("#whiteboard");
  whiteCanvas2 = document.querySelector("#ScreenWhiteboard");
  imageCanvas = document.querySelector("#imgboard");
  fullscreen = document.querySelector("#fullscreen");
  clear = document.querySelector("#clear");
  view = document.querySelector("#view");
  close = document.querySelector(".stop-document");

  /**
   * 화이트보드 초기화.
   * 1. 컨트롤 할 보드 (캔버스)
   * 2. 보드 사이즈
   */
  whiteboard.init({
    width: BOARD_WIDTH,
    /* option */
    height: BOARD_HEIGHT,
    /* option */
    whiteCanvas: whiteCanvas,
    /*  must  */
    whiteCanvas2: whiteCanvas2,
    imgCanvas: imageCanvas,
    /*  must  */
    tooltype: tooltype[0],
    /* option */
    color: Color.black,
    /* option */
    thickness: Pen.thickness.small,
    /* option */
    eraser_size: Eraser.size.small,
    /* option */
    text_size: TextTool.size.medium /* option */
  });

  /**
   * default cursor
   */
  commonFn.addClass(
    whiteboard.mainCanvas,
    `pen_cursor_${whiteboard.pen.thickness}`
  );
  /**
   * 페이지 로드되었을 때 모두 Hide
   * tooltip 객체는 index.ejs 에 선언되어 있음
   */
  //tooltip.hide();

  clear.addEventListener("click", clearHandler);
  close.addEventListener("click", closeHandler);

  tooltype.map(function (val) {
    let $tooltip = document.querySelector(`#${val}`);
    $tooltip.val = val;
    $tooltip.addEventListener("click", tooltipHandler);
  });

  Object.keys(Pen.thickness).map(function (key) {
    let $pen = document.querySelector(`#pen_${key}`);
    $pen.val = Pen.thickness[key];
    $pen.key = key;

    $pen.addEventListener("click", drawHandler);
  });

  Object.keys(Eraser.size).map(function (key) {
    let $eraser = document.querySelector(`#pen_${key}`);
    $eraser.key = key;
    $eraser.val = Eraser.size[key];
    $eraser.addEventListener("click", eraserHandler);
  });

  Object.keys(Color).map(function (key) {
    let $color = document.querySelector(`#color_${key}`);
    $color.val = Color[key];
    $color.addEventListener("click", colorHandler);
  });
  /**
   *
   * Tool type select event handler
   *
   * @param {object} e
   */
  function tooltipHandler(e) {
    e.preventDefault();
    // if ( sharing.isShareButtonEnable() ) {
    // tooltip.hide();
    //this.nextElementSibling.style.display = 'block'

    /**
     * change cursor type
     */
    if (e.target.val === "tooltype_pen") {
      sessionStorage.setItem("nowval", "pen");
      commonFn.removeClass(document.querySelector(`#tooltype_eraser`), "on");
      commonFn.addClass(this, "on");

      commonFn.removeClassAll(whiteboard.mainCanvas);
      commonFn.addClass(
        whiteboard.mainCanvas,
        `pen_cursor_${whiteboard.pen.thickness}`
      );
    }
    // else if ( e.target.val === 'tooltype_text') {
    //     commonFn.removeClassAll(whiteboard.mainCanvas)
    //     commonFn.addClass(whiteboard.mainCanvas, `text_cursor`)
    // }
    else if (e.target.val === "tooltype_eraser") {
      sessionStorage.setItem("nowval", "eraser");
      commonFn.removeClass(document.querySelector(`#tooltype_pen`), "on");

      commonFn.addClass(this, "on");

      commonFn.removeClassAll(whiteboard.mainCanvas);
      commonFn.addClass(
        whiteboard.mainCanvas,
        `eraser_cursor_${whiteboard.eraser.size}`
      );
    }

    /**
     * Color를 눌렀을 땐 이전에 세팅되어 있던 타입을 그대로 사용한다.
     */
    if (e.target.val !== "tooltype_color") {
      whiteboard.toolbar.type = e.target.val;

    }

    /**
     * Textarea가 화이트보드에 남아 있다면 지워준다.
     */
    let textarea = document.querySelector("#text_tool");
    if (textarea) {
      textarea.style.display = "none";
      textarea.value = "";
    }
    // } else {
    //     commonFn.alert( alertMsg['A46'] );
    // }
  }

  /**
   *
   * Pen select event handler
   *
   * @param {object} e
   */
  function drawHandler(e) {
    e.preventDefault();
    let linesize = "7";
    whiteboard.pen.thickness = e.target.val;
    linesize = e.target.val;
    /**
     * change cursor type
     */
    commonFn.removeClassAll(whiteboard.mainCanvas);
    commonFn.addClass(whiteboard.mainCanvas, `pen_cursor_${e.target.val}`);

    Object.keys(Pen.thickness).map(function (key) {
      commonFn.removeClass(document.querySelector(`#pen_${key}`), "on");
    });

    commonFn.addClass(this, "on");
    // tooltip.hide();
    let sendData = {
      signalOp: "LineSize",
      roomId: sessionStorage.getItem("roomId"),
      reqNo: commonFn.getReqNo(),
      lineSize: e.target.val
    };
    sessionStorage.setItem("pen", linesize);
    commonService.sendSocketMessage(sendData);
  }

  /**
   *
   * Eraser select event handler
   *
   * @param {object} e
   */
  function eraserHandler(e) {
    e.preventDefault();
    whiteboard.eraser.size = e.target.val;

    /**
     * change cursor type
     */
    commonFn.removeClassAll(whiteboard.mainCanvas);
    let nowval = sessionStorage.getItem("nowval");
    if (nowval == "pen") {
      commonFn.addClass(whiteboard.mainCanvas, `pen_cursor_${e.target.val}`);
    } else {
      commonFn.addClass(whiteboard.mainCanvas, `eraser_cursor_${e.target.val}`);
    }

    Object.keys(Eraser.size).map(function (key) {
      commonFn.removeClass(document.querySelector(`#pen_${key}`), "on");
    });

    commonFn.addClass(this, "on");
    // tooltip.hide();

    sessionStorage.setItem("EraserSize", e.target.val);
    let sendData = {
      signalOp: "EraserSize",
      roomId: sessionStorage.getItem("roomId"),
      reqNo: commonFn.getReqNo(),
      eraserSize: e.target.val
    };

    commonService.sendSocketMessage(sendData);
  }

  function screenHandler(e) {
    e.preventDefault();

    let img = new Image();
    let drawDataURL = whiteboard.mainCanvas.toDataURL();

    if (sharing.selectedLink) {
      img.src =
        sharing.selectedLink instanceof HTMLElement ?
        sharing.selectedLink.children[0].getAttribute("src") :
        sharing.selectedLink;
    }

    if (!commonFn.hasClass(ServiceBox, "fullsize")) {
      /* 확대 */
      commonFn.addClass(ServiceBox, "fullsize");

      // 이미지를 기준으로 할 것인가... 보드를 기준으로 할 것인가.
      whiteboard
        .fullscreen({
          type: "+",
          /* + or - */
          width: window.innerWidth,
          height: window.innerHeight
        })
        .insertImage(img.src, drawDataURL);
    } else {
      /* 축소 */
      commonFn.removeClass(ServiceBox, "fullsize");
      whiteboard
        .fullscreen({
          type: "-",
          /* + or - */
          width: isImgExistOnCanvas() ?
            whiteboard.LIST_UP_WIDTH : whiteboard.DEFAULT_WIDTH,
          height: isImgExistOnCanvas() ?
            whiteboard.LIST_UP_HEIGHT : whiteboard.DEFAULT_HEIGHT
        })
        .insertImage(img.src, drawDataURL);
    }
  }

  function isImgExistOnCanvas() {
    if (
      whiteboard.DEFAULT_WIDTH !== whiteboard.width ||
      whiteboard.DEFAULT_HEIGHT !== whiteboard.height
    ) {
      return true;
    } else {
      return false;
    }
  }

  /**
   *
   * Clear whiteboard event handler
   *
   * @param {object} e
   */
  function clearHandler(e) {
    e.preventDefault();

    whiteboard.clear();
    // tooltip.hide();
  }

  function closeHandler(e) {
    commonService.setConfirm("자료공유", documentShareCloseMsg,
      () => {
        e.preventDefault();
        document.getElementById("imgList").innerHTML = "";
        documentService.EndFileShare();
        document.getElementById('imgList').style.display = 'none';
        let canvasWrap = document.querySelector('.canvas-wrap');
        let pensizeTool = document.getElementById('pensizeTool').getElementsByClassName('on')[0]
        let penscolorTool = document.getElementById('penscolorTool').getElementsByClassName('on')[0];

        commonFn.removeClass(penscolorTool, "on");
        commonFn.removeClass(pensizeTool, "on");

        $('#color_black').addClass('on');
        $('#pen_small').addClass('on')

        sessionStorage.setItem("color", '#000000');
        sessionStorage.setItem("pen", 7);
        whiteboard.pen.thickness = '7';
        whiteboard.color = '#000000';

        canvasWrap.style.width = "100%";
        // commonService.setCategory('document');
        document.querySelector(".stop-document").style.display = "none";
      },
      () => {
        console.log("취소");
      }
    );
  }

  /**
   *
   * Color select event handler
   *
   * @param {object} e
   */
  function colorHandler(e) {
    e.preventDefault();

    whiteboard.color = e.target.val;
    Object.keys(Color).map(function (key) {
      commonFn.removeClass(document.querySelector(`#color_${key}`), "on");
    });

    commonFn.addClass(this, "on");
    // tooltip.hide();
    
    sessionStorage.setItem("color", e.target.val); // 여기 부분 수정이다.
    let sendData = {
      signalOp: "Color",
      roomId: sessionStorage.getItem("roomId"),
      reqNo: commonFn.getReqNo(),
      color: e.target.val
    };

    commonService.sendSocketMessage(sendData);
  }
});