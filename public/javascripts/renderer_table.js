class Table {
  constructor(table) {
    const height = document.getElementById('panel-table').clientHeight - 46;

    this.table = $('#table-main').DataTable({
      columns: [
        {data: "identifyIndex", className: "table-header", visible: false},
        {data: "timestamp", title: "Datetime", className: "table-header"},
        {data: "temperature", title: "Temp (℃)", className: "table-header"},
        {data: "relativeHumidity", title: "RH (%rh)", className: "table-header"},
        {data: "dewPoint", title: "Dew point (℃)", className: "table-header"}
      ],
      info: false,
      order: [[1, "asc"]],
      ordering: false,
      paging: false,
      scrollY: height,
      searching: false
    });
  }

  update(data) {
    this.table.clear().draw();
    for (const elem of data) {
      this.table.row.add(elem).draw();
    }

    // Set table row click event
    document.querySelectorAll('#table-main tbody > tr > td').forEach(function(elem) {
      elem.addEventListener('click', function() {
        // Activate edit input
        document.querySelectorAll('.input-edit').forEach(function(elem) {
          elem.disabled = false;
        });
        // Set edit form
        global.selected = this;
        const rowData = table.getRow(global.selected);
        document.getElementById('selected-datetime').textContent = rowData.timestamp;
        document.getElementById('input-temp').value = rowData.temperature;
        document.getElementById('input-rh').value = rowData.relativeHumidity;
        document.getElementById('input-dp').value = rowData.dewPoint;
      });
    });
  }

  getRow(selected) {
    return this.table.row(selected).data();
  }

  setRow(selected, data) {
    this.table.row(selected).data(data).draw();
  }
}

module.exports = Table;