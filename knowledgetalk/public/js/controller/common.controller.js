document.addEventListener("keyup", event => {
  if (event.keyCode === 27) {
    commonService.closeMessageBox();
  }
});
document.addEventListener("DOMContentLoaded", function() {
  /* let closeBtn = document.getElementsByClassName('close');
    for(let i=0; i<closeBtn.length; i++){
        closeBtn[i].addEventListener('click', function(e){
            console.log("e:::", e.target)
        })
    } */
  document.querySelector("#confirmOk").addEventListener("click", () => {
    commonService.closePopup("confirmBox", true);
  });
  document.querySelector("#confirmCancel").addEventListener("click", () => {
    commonService.closePopup("confirmBox", true);
  });
  document.querySelector("#TopRoomInfo").addEventListener("click", event => {
    event.preventDefault();
    copyToClipboard(TopRoomInfo.innerText);
    let toastMsg = document.getElementById("copyToast");
    clearTimeout(commonService.toastMsg);
    toastMsg.className = "toastMsg show";
    commonService.toastMsg = setTimeout(() => { toastMsg.className = "toastMsg"; }, 3000);
  });
  document.querySelector("#SidebarBtn").addEventListener("click", event => {
    event.preventDefault();
    let SidebarBtn = document.querySelector("#SidebarBtn");
    if (SidebarBtn.children[0].style.display === "none") {
      commonService.closeSidebar();
    } else if (SidebarBtn.children[1].style.display === "none") {
      commonService.openSidebar();
    }
  });

    //iamabook.
    if(agentCheck() === false) return false;
});

function copyToClipboard(val) {
  var t = document.createElement("textarea");
  document.body.appendChild(t);
  t.value = val;
  t.select();
  document.execCommand('copy');
  document.body.removeChild(t);
}

//iamabook.
function agentCheck() {
    let raw = navigator.userAgent, flag = false;

    let isChrome = raw.match(/C(hrome|hromium|riOS)\/([0-9]+)\./);
    if(isChrome) flag = parseInt(isChrome[2]) >= 72;

    if (flag === false) {
        alert(serviceBrowserIsUnavailable);
        return false;
    }
    return true;
}