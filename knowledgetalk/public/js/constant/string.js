/*
 * messageBox 문구 정리 
 */
let searchValidateErr = "검색어는 2~20자 사이로 입력하셔야 합니다."; // 친구검색
let availableMeetingErr = '회의 중에만 사용 가능한 기능입니다.'; //Error
let notAvailableMeetingErr = '회의 중에는 사용할 수 없는 기능입니다.'; //Error
let loginValidateErr = '로그인 후 이용해주세요!'; //Error
let nameValidateErr = '이름을 입력하셔야 합니다.'; //정보수정 에러
let passwdValidateErr = '비밀번호를 입력하셔야 합니다.'; //정보수정 에러
let repasswdValidateErr = '변경할 비밀번호를 입력하셔야 합니다.'; //정보수정 에러
let inviteCheckErr = "적어도 한명은 선택하셔야 합니다." ; //입력메세지 에러
let idInputErr = '아이디를 입력하셔야 합니다.'; //회원로그인 에러
let passwdInputErr = '비밀번호를 입력하셔야 합니다.'; //회원로그인 에러
let signupIdInputErr = '아이디를 입력하셔야 합니다.'; //회원가입 에러
let signupIdValidateErr = 'ID는 2~20자 사이로 입력하셔야 합니다.'; //회원가입 에러
let signupNameInputErr = '이름을 입력하셔야 합니다.'; //회원가입 에러
let signupPasswdInputErr = '비밀번호를 입력하셔야 합니다.'; //회원가입 에러
let signupRepasswdInputErr = '비밀번호확인을 입력하셔야 합니다.'; // 회원가입 에러
let signupPasswdValidateErr = '입력하신 비밀번호가 일치하지 않습니다.'; //회원가입 에러
let signupCaptchaInputNullErr = '자동 입력 방지 문자를 입력하셔야 합니다.';
let signupCaptchaInputErr = '자동 입력 방지 입력이 일치하지 않습니다.';
let signupCaptchaErr = '올바르지 못한 접근입니다.';
let screenSharingErr = '다른 이용자가 화면을 공유중입니다.'; //''
let serverNotResMeetingCloseMsg = "서버에 응답이 없습니다. 회의를 종료합니다."; //네트워크 오류
let clientNotResMsg = "상대방이 응답하지 않습니다."; //응답 지연
let resDelayRejectMsg = "응답이 지연되어 자동으로 거절합니다."; // 응답 지연
let serverProblemRefreshMsg =  "서버 장애로 5초 후 새로고침됩니다."; //네트워크 오류
let noRoomMsg = "이미 존재하지 않는 방입니다."; //참여 오류
let passwdChangeSucMsg = '데이터 변경에 성공하였습니다.'; //정보 수정
let repasswdChangeErr = '비밀번호가 일치 하지 않습니다.'; //Error
let loginFailMsg = 'ID 또는 PASSWORD가 일치하지 않습니다.'; //Error
let presenseRejectAllMsg = '모든 사람이 초대에 거절하여 방이 종료됩니다.'; //회의 거절
let presenseRejectMsg = ' 님이 회의 참여를 거절하였습니다.' ; //회의 거절
let presenseCloseMsg = '회의가 종료되었습니다.'; //회의 종료
let presenseExitAllMsg = ' 님이 회의실을 나갔습니다. 모든 사람이 퇴실하여 회의가 종료됩니다.'; //exit
let presenseExitMsg = ' 님이 회의실을 나갔습니다.'; //exit
let presenseJoinMsg = ' 님이 회의에 참여하였습니다.'; //join
let signupSucMsg = '회원가입에 성공하였습니다.'; //회원가입
let signupIdDuplicateErr = '회원아이디가 중복 되었습니다.'; // Error
let singupFailMsg = '회원가입에 실패하였습니다.'; // Error
let connectMServerErr = 'Media 서버와 연결에 실패하였습니다.' ; //Error
let joinMeetingErr = "회의참여에 실패하였습니다."; //회의참여
let preemptedDocumentShareMsg = '다른 이용자가 문서를 공유중입니다.'; //''
let preemptedScreenShareErr = '다른 이용자가 화면을 공유중입니다.'; //''
let preemptedShareErr = '다른 이용자가 문서 또는 화면을 공유중입니다.'; //''

/*
 *  setConfirm 문구 정리
 */

let addFriendConfirmMsg = "해당친구를 친구 목록에 추가하시겠습니까?"; //추가
let deleteFriendConfirmMsg = "친구목록에서 해당 친구를 삭제하시겠습니까?"; //삭제
let screenShareCloseConfirmMsg = "1:1 회의에서 다자간 회의로 전환 시, 화면공유가 종료됩니다. 그래도 진행하시겠습니까?"; //화면공유
let documentShareCloseMsg = "자료공유를 중지하시겠습니까? "; //자료공유
let conferenceCloseMsg = "회의를 종료하시겠습니까?"; //회의 종료
let screenShareCloseMsg = "화면공유를 중지 하시겠습니까?"; //화면 공유
let joinConfirmMsg = ` 님이 회의실에 입장합니다. 허가하시겠습니까?`; //회의 참가
let serviceBrowserIsUnavailable = `현재 KnowledgeTalk 서비스페이지는 Chrome 72 이상에서 최적화되어 있습니다.\r\nChrome 최신버전 설치 후 이용하시기 바랍니다.`; // 브라우저 agent 미지원