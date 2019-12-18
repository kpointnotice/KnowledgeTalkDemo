document.addEventListener('DOMContentLoaded', function(){
    let infoEditClose    = document.getElementById('InfoEditClose');
    let modifyConfirmBtn = document.getElementById('ModifyConfirmBtn');
    let modifyUserId     = document.getElementById('ModifyUserId');
    let modifyUserPw     = document.getElementById('ModifyUserPw');
    let modifyUserName   = document.getElementById('ModifyUserName');
    let modifyUserPwRe   = document.getElementById('ModifyUserPwRe');

    //sidebar.controller.js에서 getUserInfo를 호출, 버튼 누를때 마다 새로운 정보를 가져와야 함.
    modifyConfirmBtn.addEventListener('click', function(){
        
        if(!commonService.inputValidate(modifyUserName)){
            //message -> string.js
            commonService.messageBox('정보수정 에러',nameValidateErr, modifyUserName)
            return false;
        }

        if(!commonService.inputValidate(modifyUserPw)){
            //messgae -> stirng.js
            commonService.messageBox('정보수정 에러',passwdValidateErr, modifyUserPw);
            return false;
        }

        if(!commonService.inputValidate(modifyUserPwRe)){
            //message -> string.js
            commonService.messageBox('정보수정 에러',repasswdValidateErr, modifyUserPwRe);
            return false;
        }
        
        infoEditService.reqModifyUserInfo();
    });

    //닫기버튼
    infoEditClose.addEventListener('click', function(){
        commonService.closePopup('InfoEdit');
        modifyUserPw.value = '';
        modifyUserPwRe.value = '';
    });
});