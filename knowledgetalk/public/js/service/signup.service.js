function SignupService(){}

SignupService.prototype.signUpResult = function(result){
    grecaptcha.reset(refreshCaptcha);
    if(result.code === '200'){
        //messge -> string.js
        commonService.messageBox('회원가입',signupSucMsg, null);
        //팝업창 없애기
        commonService.closePopup('Signup');
    } else if (result.code === '433'){
        //message -> string.js
        commonService.messageBox('Error',signupIdDuplicateErr, null);
    } else {
        //message ->string.js
        commonService.messageBox('Error',singupFailMsg, null);
    }
}

// SignupService.prototype.signupCaptcha = () => {
//     let signupCaptcha  = document.getElementById('SignupCaptcha');

//     let request = new XMLHttpRequest();
//     let url = `/captcha/nkey`;
//     request.open("GET", url);
//     request.send();
//     request.onreadystatechange = () => {
//         if (request.readyState === XMLHttpRequest.DONE && request.status === 200) {
//             let reqKey = JSON.parse(request.response).key;
//             let captchaUrl = `/captcha/image/`+reqKey;

//             signupCaptcha.setAttribute("key", reqKey);
//             signupCaptcha.src = captchaUrl;
//         } else {
//             console.log("request error !");
//         }
//     }
// }

// SignupService.prototype.signupCaptchaRefresh = key => {
//     let signupCaptcha  = document.getElementById('SignupCaptcha');
//     signupCaptcha.src = signupCaptcha.src;
// }

let signupService = new SignupService();