class Chart {
  constructor() {
    this.rangeIndex = {start: 0,end: 0};

    // Set chart height
    this.$chart = document.getElementById('chart');
    this.$chart.style.height = `${document.getElementById('panel-chart').clientHeight - 12}px`;
    // Create chart
    this.chart = echarts.init(document.getElementById('chart'));
    // Create option
    const option = {
      grid: {
        bottom: 28,
        left: 28,
        right: 28,
        top: 24
      },
      series: [{
        type: 'line',
        data: [0,0,0,0,0,0,0,0,0,0]
      }],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
            animation: false
        }
      },
      xAxis: {
        type: 'category',
        data: [1,2,3,4,5,6,7,8,9,10]
      },
      yAxis: {
        type: 'value'
      }
    }
    // Set chart option (init)
    this.chart.setOption(option);
  }

  isExist() {
    if (this.chart === null) {
      return false;
    } else {
      return true;
    }
  }

  create(option) {
    this.chart.setOption(option);
    // Hide loading
    setTimeout(() => {
      this.chart.hideLoading();
    }, 1500);
    // Chart dataZoom event
    this.chart.on('dataZoom', () => {
      const option = this.chart.getOption();
      this.rangeIndex.start = option.dataZoom[0].startValue;
      this.rangeIndex.end = option.dataZoom[0].endValue;
    });
  }

  uploadData(data) {
    // Show loading
    this.chart.showLoading();
    // Set range
    this.rangeIndex.end = data.length - 1;
    // Convert data
    const convertedData = convertData(data);
    // Create option
    const option = {
      color: ['#E84C2C', '#2E69E8', '#46BD22'],
      dataZoom: [{
        type: 'slider'
      }],
      legend: {
        data: ['Temperature', 'Relative Humidity', 'Dew Point']
      },
      grid: {
        bottom: 72,
        top: 28
      },
      series: [{
        name: 'Temperature',
        data: convertedData.temperature,
        type: 'line',
      }, {
        name: 'Relative Humidity',
        data: convertedData.relativeHumidity,
        type: 'line',
      }, {
        name: 'Dew Point',
        data: convertedData.dewPoint,
        type: 'line',
      }],
      xAxis: {
        data: convertedData.xAxis
      }
    };

    this.create(option);
  }

  updateData(data) {
    // Convert data
    const convertedData = convertData(data);
    const option = {
      series: [{
        data: convertedData.temperature,
      }, {
        data: convertedData.relativeHumidity,
      }, {
        data: convertedData.dewPoint
      }]
    }
    this.create(option);
  }

  capture() {
    if (this.isExist()) {
      return this.chart.getDataURL({
        pixelRatio: 2,
        backgroundColor: '#FFFFFF'
      });
    } else {
      return null;
    }
  }
};

function convertData(data) {
  // Create arrays
  const result = {
    xAxis: [],
    temperature: [],
    relativeHumidity: [],
    dewPoint: []
  };
  // Extract data
  for (let i = 0; i < data.length; i++) {
    result.xAxis.push(data[i].timestamp);
    result.temperature.push(data[i].temperature);
    result.relativeHumidity.push(data[i].relativeHumidity);
    result.dewPoint.push(data[i].dewPoint);
  }  
  // Return
  return result;
}

module.exports = Chart;