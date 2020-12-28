const { ipcRenderer } = require('electron');

function sign_in() {
  const user = document.getElementById('input-user').value;
  const pw = document.getElementById('input-pw').value;

  if (user === undefined || user === null || user === '' || user.replace(/\s/, '') === '') {
    document.getElementById('input-user').focus();
    alert("User을 입력해주세요.");
  } else if (pw === undefined || pw === null || pw === '' || pw.replace(/\s/, '') === '') {
    document.getElementById('input-pw').focus();
    alert("비밀번호를 입력해주세요");
  } else {
    ipcRenderer.send('sign_in', {user: user, password: pw});
  }
}

// Response
ipcRenderer.on('sign_in', function(event, args) {
  alert(args);
});