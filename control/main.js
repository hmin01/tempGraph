const { dir } = require('console');
const { app, BrowserWindow, ipcMain, ipcRenderer } = require('electron');
const { existsSync, mkdirSync, unlinkSync } = require('fs');
const { join } = require('path');
const xlsx = require('xlsx')
// Management window
let win = null;

const browserOption = {
  width: 1400,
  height: 900,
  webPreferences: {
    nodeIntegration: true
  }
};

function createWindow() {
  win = new BrowserWindow(browserOption);
  win.loadFile(__dirname + '/../views/login.html');

  win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

/* Communication to renderer (sign in) */
ipcMain.on('sign_in', async (event, args) => {
  if (args.user === "User01" && args.password === "q1w2e3") {
    win.loadFile(__dirname + '/../views/main.html');
  } else {
    event.sender.send('sign_in', "User 또는 비밀번호가 올바르지 않습니다. 다시 입력해주세요.");
  }
});
/* Communication to renderer (upload file) */
ipcMain.on('upload', async (event, args) => {
  if (existsSync(args)) {
    try {
      const workbook = xlsx.readFile(args);
      const sheet = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheet];
      // Extract last row index
      const ref = worksheet['!ref'].split(':');
      const last = Number(ref[1].replace(/\D/g, ''));
      // Extract data (except first row)
      const rows = [];
      let num = 2, identifyIndex = 0;
      while (num < last + 1) {
        if (worksheet[`B${num}`] !== undefined && worksheet[`B${num}`].v !== undefined && worksheet[`B${num}`].v.replace(/\s/g, '') !== '') {
          // Convert date
          let convertedDate = null;
          const rawDate = worksheet[`B${num}`].v.replace(/\s/g, '');
          if (rawDate.indexOf('오전') > -1) {
            convertedDate = rawDate.replace('오전', 'T');
          } else if (rawDate.indexOf('오후') > -1) {
            const splitDate = rawDate.split('오후');
            const splitTime = splitDate[1].split(':');
            convertedDate = `${splitDate[0]}T${Number(splitTime[0]) + 12}:${splitTime[1]}:${splitTime[2]}`;
          }
          // Save data
          if (convertedDate !== null) {
            rows.push({
              identifyIndex: identifyIndex++,
              timestamp: convertedDate,
              temperature: worksheet[`C${num}`].v !== undefined ? worksheet[`C${num}`].v : 0,
              relativeHumidity: worksheet[`D${num}`].v !== undefined ? worksheet[`D${num}`].v : 0,
              dewPoint: worksheet[`E${num}`].v !== undefined ? worksheet[`E${num}`].v : 0
            });
          }
        }
        num++;
      }
      event.sender.send('upload', {result: true, message: rows});
      // Delete
      delete(worksheet);
      delete(sheet);
      delete(worksheet);
      delete(rows);
    } catch (err) {
      console.error(err);
      event.sender.send('upload', {result: false, message: "[Error] Can't read file"});
    }
  } else {
    event.sender.send('upload', {result: false, message: "[Error] Not found upload file"});
  }
});
/* Communication to renderer (export excel file) */
ipcMain.on('download', async (event, args) => {
  try {
    if (args.length > 0) {
      const workbook = xlsx.utils.book_new();
  
      const data = [['Index', 'Datetime', 'Temp (℃)', 'RH (%rh)', 'Dew point (℃)']];
      for (let i = 0; i < args.length; i ++) {
        data[i+1] = [];
        data[i+1].push(i);
        data[i+1].push(args[i].timestamp);
        data[i+1].push(args[i].temperature);
        data[i+1].push(args[i].relativeHumidity);
        data[i+1].push(args[i].dewPoint);
      }
  
      const worksheet = xlsx.utils.aoa_to_sheet(data);
      xlsx.utils.book_append_sheet(workbook, worksheet);
      // Set path
      const filename = `${Date.now()}_data.xlsx`;
      const dirPath = join(__dirname, '../public/download');
      const filePath = join(dirPath, filename);
      if (!existsSync(dirPath)) {
        mkdirSync(dirPath);
      }
      // Creaet excel file
      xlsx.writeFile(workbook, filePath);
      // Response created excel file path
      event.sender.send('download', {result: true, filename: filename, filePath: filePath});
      // Delete excel file
      setTimeout(function() {
        unlinkSync(filePath);
      }, 30000);
    }
  } catch (err) {
    console.error(err);
    event.sender.send('download', {result: false, message: "[Error] Failed to create file"});
  }
});