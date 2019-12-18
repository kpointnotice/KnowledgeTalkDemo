document.addEventListener('DOMContentLoaded', function() {
    let elems         = document.querySelectorAll('.tooltipped');
    let instances     = M.Tooltip.init(elems);

    let chatInput     = document.getElementById('ChatInput');
    let chatInsertBtn = document.getElementById('ChatInsertBtn');
    let chatLeft      = document.getElementById('ChatLeft');
    let inputMsg      = '';
    
    //채팅 input창에서 enter을 눌렸을 경우에 해당.
    chatInput.addEventListener('keyup', function(e){
        if(e.key === 'Enter'){
            if (!inMeeting) {
                let toastMsg = document.getElementById("chatToast");
                clearTimeout(chatService.toastMsg);
                toastMsg.className = "toastMsg show";
                chatService.toastMsg = setTimeout(() => { toastMsg.className = "toastMsg"; }, 3000);

                inputMsg   = '';
                this.value = '';
                return;
            } else {
                inputMsg = this.value.trim();
                if(inputMsg !== '' && inputMsg !== undefined){
                    //input에 내용이 있는경우 해당 내용을 서버로 보냄.
                    //commonService.sendSocketMessage(param);
                    //이곳에서는 chatService.setMessage()호출
                    chatService.setMessage(inputMsg);
                    let chatData = {
                        signalOp: "Chat",
                        userId: JSON.parse(sessionStorage.getItem("userInfo")).userId,
                        message: inputMsg
                    }
                    commonService.sendSocketMessage(chatData)
                    
                    inputMsg   = '';
                    this.value = '';
                }
            }
        }
    });

    //채팅보내기 버튼을 클릭하였을 경우에 해당.
    chatInsertBtn.addEventListener('click', function(){
        if (!inMeeting) {
            let toastMsg = document.getElementById("chatToast");
            clearTimeout(chatService.toastMsg);
            toastMsg.className = "toastMsg show";
            chatService.toastMsg = setTimeout(() => { toastMsg.className = "toastMsg"; }, 3000);
            
            inputMsg   = '';
            this.value = '';
        } else {
            inputMsg = chatInput.value.trim();
            if(inputMsg !== '' && inputMsg !== undefined){
                //input에 내용이 있는경우 해당 내용을 서버로 보냄.
                //commonService.sendSocketMessage(param);
                //이곳에서는 chatService.setMessage()호출
                chatService.setMessage(inputMsg);
                let chatData = {
                    signalOp: "Chat",
                    userId: JSON.parse(sessionStorage.getItem("userInfo")).userId,
                    message: inputMsg
                }
                commonService.sendSocketMessage(chatData)

                inputMsg   = '';
                chatInput.value  = '';
            }
        }
    });

    //채팅창 textarea근처를 클릭하면 해당 input창에 포커스이동
    chatLeft.addEventListener('click', function(){
        chatInput.focus();
    });
});