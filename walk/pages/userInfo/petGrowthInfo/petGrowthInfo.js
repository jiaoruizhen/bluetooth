const app = getApp();
var rate = 0;
var canvasWidth = 0;
var canvasHeight = 0;
var url = app.url
Page({

  /**
   * 页面的初始数据
   */
  data: {
    petInfo: '',
    lineCanvasData: {
      canvasId: 'lineAreaCanvas',
    },
   
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setConvasData()
    
  },
  addRecord: function () {
    let that = this
    wx.navigateTo({
      url: 'add/add?petInfo=' + that.data.petInfo,
    })
  },

  setConvasData: function () {
    console.log(app.systemInfo);
    var systemInfo = app.systemInfo;
    rate = systemInfo.screenWidth / 750;
    var updateData = {};
    var updateData1 = {};
    canvasWidth = systemInfo.screenWidth - rate * 64;
    canvasHeight = rate * 306 + rate * 44 + rate * 34 + rate * 22;

    var yMax = 100000;
    var yMin = 0;
    var xMax = 6;
    var xMin = 0;
    updateData['lineCanvasData.canvasWidth'] = canvasWidth;
    updateData['lineCanvasData.axisPadd'] = { left: rate * 5, top: rate * 44, right: rate * 5 };
    updateData['lineCanvasData.axisMargin'] = { bottom: rate * 34, left: rate * 26 };
    updateData['lineCanvasData.yAxis.fontSize'] = rate * 22;
    updateData['lineCanvasData.yAxis.fontColor'] = '#637280';
    updateData['lineCanvasData.yAxis.lineColor'] = '#DCE0E6';
    updateData['lineCanvasData.yAxis.lineWidth'] = rate * 2;
    updateData['lineCanvasData.yAxis.dataWidth'] = rate;
    updateData['lineCanvasData.yAxis.isShow'] = true;
    updateData['lineCanvasData.yAxis.isDash'] = true;
    updateData['lineCanvasData.yAxis.minData'] = yMin;
    updateData['lineCanvasData.yAxis.maxData'] = yMax;
    updateData['lineCanvasData.yAxis.padd'] = rate * 306 / (yMax - yMin);

    updateData['lineCanvasData.xAxis.dataHeight'] = rate;
    updateData['lineCanvasData.xAxis.fontSize'] = rate * 22;
    updateData['lineCanvasData.xAxis.fontColor'] = '#637280';
    updateData['lineCanvasData.xAxis.lineColor'] = '#DCE0E6';
    updateData['lineCanvasData.xAxis.lineWidth'] = rate * 2;
    updateData['lineCanvasData.xAxis.minData'] = xMin;
    updateData['lineCanvasData.xAxis.maxData'] = xMax;
    updateData['lineCanvasData.xAxis.padd'] = (canvasWidth - rate * 103) / (xMax - xMin);

    updateData['lineCanvasData.point'] = { size: rate * 4, isShow: false };
    updateData['lineCanvasData.canvasHeight'] = canvasHeight;
    this.setData({
      updateData,
    });


  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
  getPetInfo: function () {
    let that = this
    wx.getStorage({
      key: 'userId',
      success: function (res) {
        wx.request({
          url: url + '/growthRecord/selectByPetId',
          data: {
            "userId": res.data
          },
          success: function (res) {
            console.log("宠物信息：", res)
            that.setData({
              petInfo: res.data.data
            })

            console.log(that.data.petInfo)
          }
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getPetInfo()
    //  let that = this
    //  that.getPetInfo()
    //   var data=that.data.petInfo
    //   var systemInfo = app.systemInfo;
    //   rate = systemInfo.screenWidth / 750;
    //   var updateData = {};
    //   canvasWidth = systemInfo.screenWidth - rate * 64;
    //   canvasHeight = rate * 306 + rate * 44 + rate * 34 + rate * 22;

    //   var yMax = 50;
    //   var yMin = 0;
    //   var xMax = 6;
    //   var xMin = 0;
    //   var temp={},
    //   var date=[],
    //   for(var i in data){
    //     for(var j in data[i].growthRecord){
    //       temp = temp + { x: 0, y: parseInt(data[i].growthRecord[j].weight), title: data[i].growthRecord[j].weight }
    //       date.push(data[i].growthRecord[j].rDate)
    //     }
    //   }
    //       var series = [{
    //         data:temp
    //       }];
    //       console.log("series:", series)
    //       var temp1={}
    //       var xAxisData = [
    //         { x: 0, y: 0, title: res.data.data.weeks[0][0] },
    //         { x: 1, y: 0, title: res.data.data.weeks[1][0] },
    //         { x: 2, y: 0, title: res.data.data.weeks[2][0] },
    //         { x: 3, y: 0, title: res.data.data.weeks[3][0] },
    //         { x: 4, y: 0, title: res.data.data.weeks[4][0] },
    //         { x: 5, y: 0, title: res.data.data.weeks[5][0] },

    //       ];
    //       var yAxisData = [
    //         { x: 0, y: 0, title: "0" },
    //         { x: 0, y: 20000, title: "20000" },
    //         { x: 0, y: 40000, title: "40000" },
    //         { x: 0, y: 60000, title: "60000" },
    //         { x: 0, y: 80000, title: "80000" },
    //         { x: 0, y: 100000, title: "100000" },
    //       ];
    //       updateData['lineCanvasData.xAxis.minData'] = xMin;
    //       updateData['lineCanvasData.xAxis.maxData'] = xMax;
    //       updateData['lineCanvasData.xAxis.padd'] = (canvasWidth - rate * 98) / (xMax - xMin);
    //       updateData['lineCanvasData.point'] = { size: rate * 4, isShow: true };
    //       updateData['lineCanvasData.yAxis.minData'] = yMin;
    //       updateData['lineCanvasData.yAxis.maxData'] = yMax;
    //       updateData['lineCanvasData.yAxis.padd'] = rate * 306 / (yMax - yMin);
    //       updateData['lineCanvasData.series'] = series;
    //       updateData['lineCanvasData.xAxis.data'] = xAxisData;
    //       updateData['lineCanvasData.yAxis.data'] = yAxisData;
    //       that.setData(
    //         updateData
    //       );
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log("22222");
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },




})