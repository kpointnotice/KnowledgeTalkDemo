sessionStorage.clear();
document.addEventListener('DOMContentLoaded', function(){
    let loginBtn      = document.getElementById('LoginBtn');
    let loginId       = document.getElementById('LoginId');
    let loginPw       = document.getElementById('LoginPw');
    let loginClose    = document.getElementById('LoginClose');
    let signupBtn     = document.getElementById('SignupBtn');

    // let signupCaptcha = document.getElementById('SignupCaptcha');
    // let infoSearchBtn = document.getElementById('InfoSearchBtn');
    //회원가입 버튼
    signupBtn.addEventListener('click', function(e){
        e.preventDefault();

        loginId.value = '';
        loginPw.value = '';
        if (signupBtnDupl) {
            return;
        }
        signupBtnDupl = true;

        // signupService.signupCaptcha();

        commonService.closePopup('Login');
        commonService.resetMainMenu();
        setTimeout(() => {
            commonService.setCategory('signup');
            signupBtnDupl = false;
        }, 500);
    });

    //정보찾기 버튼
    // infoSearchBtn.addEventListener('click', function(e){
    //     e.preventDefault();
    // });

    //login inputbox의 값을 체크한 후 정상적인 경우 소켓으로 값을 전달.
    loginBtn.addEventListener('click', function(e) {
        signing = loginFn();
    });

    loginId.addEventListener('keyup', function(e) {
        if (e.keyCode === 13 && document.getElementById("MessageDim").classList.contains("fadeOut")) {
            signing = loginFn();
            loginId.blur();
        }
    }, true);

    loginPw.addEventListener('keyup', function(e) {
        if (e.keyCode === 13 && document.getElementById("MessageDim").classList.contains("fadeOut")) {
            signing = loginFn();
            loginPw.blur();
        }
    }, true);

    //로그인 팝업박스에서 close버튼
    loginClose.addEventListener('click', function(){
        loginId.value = '';
        loginPw.value = '';
        commonService.closePopup('Login');
        commonService.resetMainMenu();
    });

    function loginFn(){
        if (signing) {
            return signing;
        }

        if(!commonService.inputValidate(loginId)){
            //message -> string.js
            commonService.messageBox('회원로그인 에러',idInputErr, loginId);
            return false;
        }

        if(!commonService.inputValidate(loginPw)){
            //message -> string.js
            commonService.messageBox('회원로그인 에러',passwdInputErr, loginPw);
            return false;
        }

        exceptionService.setLogoutTimer(5);

        //소켓으로 보내는 데이터.
        let sendData = {
            eventOp: 'Login',
            reqNo: commonService.getReqNo(),
            reqDate: commonService.getReqDate(),
            userId: loginId.value,
            userPw: commonService.SHA256(loginPw.value),
            deviceType: "pc"
        };
        commonService.userInfo.userId = sendData.userId;
        //소켓으로 메세지를 보냄.
        commonService.sendSocketMessage(sendData);

        return true;
    }
});
