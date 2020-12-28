const { join } = require('path');
const { ipcRenderer } = require('electron');
// Class module
const Chart = require(join(__dirname, '../public/javascripts/renderer_chart'));
const Table = require(join(__dirname, '../public/javascripts/renderer_table'));
// Object
let chart = null;
let table = null;
// Data
let totalData = null;
let undoList = [];
global.selected = null;
const MAX_SIZE = 10;

// Upload file
function upload(file) {
  const filename = file.name;
  const lastIndex = filename.lastIndexOf('.');
  if (lastIndex > -1) {
    const extension = filename.substring(lastIndex + 1);
    if (extension === "xls" || extension === "xlxs" || extension === "csv") {
      console.log("operation function (front)");
      ipcRenderer.send('upload', file.path);
    } else {
      alert("파일 확장자가 올바르지 않습니다. (Support. xls, xlxs, csv)");
    }
  } else {
    alert("파일 확장자가 올바르지 않습니다. (Support. xls, xlxs, csv)");
  }   
}

// Init chart
function initChart() {
  chart = new Chart();
}

// Init data table
function initTable() {
  table = new Table();
}

// Update table
function updateTable() {
  if (totalData !== null && totalData.length > 0) {
    table.update(totalData.slice(chart.rangeIndex.start, chart.rangeIndex.end + 1));
  }
}

// Undo table row data
function undo() {
  if (global.selected !== null && undoList.length > 0) {
    const prevData = undoList.pop();
    // Update
    updateData(prevData.elem, prevData.data);
    // Update UI
    document.getElementById('selected-datetime').textContent = prevData.data.timestamp;
    document.getElementById('input-temp').value = prevData.data.temperature;
    document.getElementById('input-rh').value = prevData.data.relativeHumidity;
    document.getElementById('input-dp').value = prevData.data.dewPoint;
  }
}

// Update table row data
function edit() {
  if (global.selected !== null) {
    // Save prev data (max size 10)
    const prevData = {
      elem: global.selected,
      data: JSON.parse(JSON.stringify(table.getRow(global.selected)))
    }
    undoList.push(prevData);
    if (undoList.length > MAX_SIZE) {
      undoList.shift();
    }
    // Create edited data
    const editedData = {
      identifyIndex: prevData.data.identifyIndex,
      timestamp: prevData.data.timestamp,
      temperature: document.getElementById('input-temp').value,
      relativeHumidity: document.getElementById('input-rh').value,
      dewPoint: document.getElementById('input-dp').value
    }
    // Update
    updateData(global.selected, editedData);
    // Clear edit form
    // document.getElementById('selected-datetime').textContent = "-";
    // document.querySelectorAll('.input-edit').forEach(function(elem) {
    //   elem.value = '';
    //   elem.disabled = true;
    // });
    // global.selected = null;
  }
};

function updateData(elem, data) {
  // Update table row
  table.setRow(elem, data);
  // Update chart
  totalData[data.identifyIndex].temperature = data.temperature;
  totalData[data.identifyIndex].relativeHumidity = data.relativeHumidity;
  totalData[data.identifyIndex].dewPoint = data.dewPoint;
  chart.updateData(totalData);
}

function captureGraph() {
  const data = chart.capture();
  if (data !== null) {
    const link = document.createElement('a');
    link.download = `${Date.now()}_tempGraph.png`;
    link.href = data;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    delete link;
  }
}

function download() {
  if (totalData !== null && totalData.length > 0) {
    ipcRenderer.send('download', totalData.slice(chart.rangeIndex.start, chart.rangeIndex.end + 1));
  }
}

/* Communication main process (upload file) */
ipcRenderer.on('upload', function(event, args) {
  if (args.result) {
    totalData = args.message;
    chart.uploadData(totalData);
    table.update(totalData);
  } else {
    alert(args.message);
  }
});

/* Communication main process (download file) */
ipcRenderer.on('download', function(event, args) {
  if (args.result) {
    const link = document.createElement('a');
    link.download = args.filename;
    link.href = args.filePath;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    delete link;
  } else {
    alert(args.message);
  }
});