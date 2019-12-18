document.addEventListener('DOMContentLoaded', function(){
    let signupClose    = document.getElementById('SignupClose');
    let signupUserId   = document.getElementById('SignupUserId');
    let signupUserName = document.getElementById('SignupUserName');
    let signupUserPw   = document.getElementById('SignupUserPw');
    let signupUserRePw = document.getElementById('SignupUserRePw');
    let SignupProcBtn  = document.getElementById('SignupProcBtn');
    let signupCaptcha  = document.getElementById('SignupCaptcha');
    let signupCaptchaInput = document.getElementById('SignupCaptchaInput');
    let signupCaptchaRenew = document.getElementById('SignupCaptchaRenew');
    let sendData;

    SignupProcBtn.addEventListener('click', function(){
        if (signupProcBtnDupl) {
            return;
        }
        signupProcBtnDupl = true;
        
        document.querySelector(".loader").style.display="";
        
        // let reqKey = signupCaptcha.getAttribute("key");
        // let reqVal = signupCaptchaInput.value;

        // if (reqVal === "") {
        //     commonService.messageBox('회원가입 에러',signupCaptchaInputNullErr, signupUserId);
        //     signupProcBtnDupl = false;
        //     return false;
        // }

        // signupCaptchaInput.value = "";

        // let request = new XMLHttpRequest();
        // let requestUrl = `/captcha/result/${reqKey}/${reqVal}`;
        // request.open("GET", requestUrl);
        // request.send();
        // request.onreadystatechange = () => {
        //     if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
        //         let result = JSON.parse(request.response).result;
        //         if (result) {
            if(!commonService.inputValidate(signupUserId)){
                //message -> string.js
                commonService.messageBox('회원가입 에러',signupIdInputErr, signupUserId);
                signupProcBtnDupl = false;
                return false;
            }
                //message -> string.js
            if(signupUserId.value.length < 2 || signupUserId.value.length > 20){
                commonService.messageBox('회원가입 에러',signupIdValidateErr, signupUserId);
                signupProcBtnDupl = false;
                return false;
            }
                //message -> string.js
            if(!commonService.inputValidate(signupUserName)){
                commonService.messageBox('회원가입 에러',signupNameInputErr, signupUserName);
                signupProcBtnDupl = false;
                return false;
            }
                //message -> string.js
            if(!commonService.inputValidate(signupUserPw)){
                commonService.messageBox('회원가입 에러',signupPasswdInputErr, signupUserPw);
                signupProcBtnDupl = false;
                return false;
            }
                //message -> string.js
            if(!commonService.inputValidate(signupUserRePw)){
                commonService.messageBox('회원가입 에러',signupRepasswdInputErr, signupUserRePw);
                signupProcBtnDupl = false;
                return false;
            }
    
            if(signupUserPw.value !== signupUserRePw.value){
                signupUserPw.value   = '';
                signupUserRePw.value = '';
                //message -> string.js
                commonService.messageBox('회원가입 에러',signupPasswdValidateErr, signupUserPw);
                signupProcBtnDupl = false;
                return false;
            }

            if(grecaptcha) {
                if (grecaptcha.getResponse() == "") {
                    commonService.messageBox('CAPTCHA 에러', signupCaptchaErr, signupUserPw);
                    signupProcBtnDupl = false;
                    return false;
                }
            }
    
            sendData = {
                eventOp: "SignUp",
                reqNo: commonService.getReqNo(),
                reqDate: commonService.getReqDate(),
                userId: signupUserId.value,
                userPw: commonService.SHA256(signupUserPw.value),
                userRePw: commonService.SHA256(signupUserRePw.value),
                userName: signupUserName.value,
                deviceType: "pc"
            }
    
            commonService.sendSocketMessage(sendData);
            
            signupUserId.value = "";
            signupUserName.value = "";
            signupUserPw.value = "";
            signupUserRePw.value = "";
        } 
        //         else {
        //             commonService.messageBox('회원가입 에러', signupCaptchaInputErr, signupCaptchaInput);
                    
        //             signupService.signupCaptcha();
        //             signupProcBtnDupl = false;
        //             return false;
        //         }
        //         return false;
        //     } else {
        //         console.log("request error !");
        //         document.querySelector(".loader").style.display="";
        //         signupProcBtnDupl = false;
        //         return false;
        //     }
        // }
    // }
    );

    //이미지 캡차 리로드
    // signupCaptchaRenew.addEventListener('click', event => {
    //     event.preventDefault();

    //     signupService.signupCaptchaRefresh();
    // });

    //미팅리스트 close버튼
    signupClose.addEventListener('click', function(){
        document.querySelector(".loader").style.display="none";
        signupUserId.value = "";
        signupUserName.value = "";
        signupUserPw.value = "";
        signupUserRePw.value = "";
        commonService.closePopup('Signup');
        commonService.resetMainMenu();
    });
})