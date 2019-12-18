function ChatService(){
    this.chatId;
    this.chatCopyToast;
    this.chatNullToast;
    this.toastMsg;
}

ChatService.prototype.setMessage = function(data){
    let targetObj = document.getElementById('ChatContent');
    let targetList = document.getElementById('ChatContentList');

    let time = commonService.getDate();
    let myMessage = `
        <li class="my-chat">
            <dl>
                <dd><div></div></dd>
                <dd class="chat-time">
                    ${time}
                </dd>
            </dl>
        </li>
    `;

    //채팅내용을 채팅박스에 삽입
    targetObj.insertAdjacentHTML('beforeend', myMessage);
    document.querySelector(".my-chat:last-child > dl > dd > div").innerText = data;

    //스크롤위치를 항상 제일 하단에 위치
    targetObj.scrollTop = targetObj.scrollHeight;
    //console.log(targetObj.scrollTop, targetObj.scrollHeight);
}

ChatService.prototype.setOtherMessage = function(data){
    let targetObj = document.getElementById('ChatContent');
    let targetList = document.getElementById('ChatContentList');

    let time = commonService.getDate();
    let otherMessage =`
    <li class="other-chat">
        <dl>
            <dt><i class="material-icons">person</i></dt>
            <dd class="chat-name">${data.userId}</dd>
            <dd><div></div></dd>
            <dd class="chat-time">
                ${time}
            </dd>
        </dl>
    </li>
    `;

    //채팅내용을 채팅박스에 삽입
    targetObj.insertAdjacentHTML('beforeend', otherMessage);
    document.querySelector(".other-chat:last-child > dl > dd > div").innerText = data.message;

    //스크롤위치를 항상 제일 하단에 위치
    targetObj.scrollTop = targetObj.scrollHeight;
    //console.log(targetObj.scrollTop, targetObj.scrollHeight);

    let ChatIcon = document.getElementById("ChatIcon");
    let ChatCount = document.getElementById("ChatCount");
    
    if (ChatIcon.innerText === "sms") {
        ChatCount.innerText = (ChatCount.innerText-0)+1;
        ChatCount.style.display = "";
    }
}

ChatService.prototype.resetMessage = function(data){
    let targetObj = document.getElementById('ChatContent');

    let ChatCount = document.getElementById("ChatCount");

    ChatCount.innerText = "0";
    ChatCount.style.display = "none";
    targetObj.innerHTML = "";
}

ChatService.prototype.uploadChatLogs = isMaker => {
    let chatLogs = document.querySelector("#ChatContent").innerHTML;
    if (!isMaker || chatLogs === "") {
        return;
    }
    let chats = "chats=";
    chats += chatLogs.replace(/&/gi, "%26");

    let request = new XMLHttpRequest();
    let url = `/chat/${chatService.chatId}`;
    request.open("POST", url);
    request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    request.send(chats);
    request.onreadystatechange = () => {
        if (request.readyState === XMLHttpRequest.DONE) {
            if (request.status === 200) {
                console.log("upload success !");
            } else {
                console.log("request error !");
            }
        }
    };
}

ChatService.prototype.setChatLogs = obj => {
    event.preventDefault();

    let request = new XMLHttpRequest();
    let url = `/chat/${obj.getAttribute("chatid")}/`;

    request.open("GET", url);
    request.send();
    request.onreadystatechange = () => {
        if (request.readyState === XMLHttpRequest.DONE) {
            if (request.status === 200) {
            let chatIcon = document.getElementById('ChatIcon');
            let rightSidebar = document.getElementById('RightSidebar');
            let logs = JSON.parse(request.response);
            document.querySelector("#ChatContent").innerHTML = logs;
            // 지난회의에서 채팅 불러올 때 아이콘 변경 되지 않는 문제 수정
            if(chatIcon.innerText === 'sms') {
                chatIcon.innerText = 'close'
            }

            if(!rightSidebar.classList.contains('rightSidebarOpen')){
                if(rightSidebar.classList.contains('rightSidebarClose')){
                    rightSidebar.classList.remove('rightSidebarClose');
                }
                rightSidebar.classList.add('rightSidebarOpen');
            }
            
            let toastMsg = document.getElementById("chatCopyToast");
            clearTimeout(chatService.chatCopyToast);
            toastMsg.className = "toastMsg show";
            chatService.chatCopyToast = setTimeout(() => { toastMsg.className = "toastMsg"; }, 3000);

            } else if (request.status === 404) {
                document.querySelector("#ChatContent").innerHTML = "";

                let toastMsg = document.getElementById("chatNullToast");
                clearTimeout(chatService.chatNullToast);
                toastMsg.className = "toastMsg show";
                chatService.chatNullToast = setTimeout(() => { toastMsg.className = "toastMsg"; }, 3000);

            } else {
                console.log("request error !");
            }
        }
    };
}

let chatService = new ChatService();