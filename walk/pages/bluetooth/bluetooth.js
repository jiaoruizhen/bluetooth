const app = getApp();
var url = app.url
var rate = 0;
var canvasWidth = 0;
var canvasHeight = 0;
var util = require("../../utils/util.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    petInfo: '',
    lineCanvasData: {
      canvasId: 'lineAreaCanvas',
    },
    pets:'',
    max:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    util.searchbluetooth()
  },
  addRecord: function () {
    let that = this
    wx.navigateTo({
      url: 'add/add',
    })
  },
  setConvasData:function(){
   let that=this
    var systemInfo = app.systemInfo;
    rate = systemInfo.screenWidth / 750;
    var updateData = {};
    canvasWidth = systemInfo.screenWidth - rate * 64;
    canvasHeight = rate * 306 + rate * 44 + rate * 34 + rate * 22;

    var yMax = parseInt(that.data.max)+10;
    var yMin = 0;
    var xMax = 7;
    var xMin = 0;
    updateData['lineCanvasData.canvasWidth'] = canvasWidth;
    updateData['lineCanvasData.axisPadd'] = { left: rate * 5, top: rate * 44, right: rate * 5 };
    updateData['lineCanvasData.axisMargin'] = { bottom: rate * 34, left: rate * 26 };
    updateData['lineCanvasData.yAxis.fontSize'] = rate * 22;
    updateData['lineCanvasData.yAxis.fontColor'] = '#637280';
    updateData['lineCanvasData.yAxis.lineColor'] = '#DCE0E6';
    updateData['lineCanvasData.yAxis.lineWidth'] = rate * 2;
    updateData['lineCanvasData.yAxis.dataWidth'] = rate * 62;
    updateData['lineCanvasData.yAxis.isShow'] = true;
    updateData['lineCanvasData.yAxis.isDash'] = true;
    updateData['lineCanvasData.yAxis.minData'] = yMin;
    updateData['lineCanvasData.yAxis.maxData'] = yMax;
    updateData['lineCanvasData.yAxis.padd'] = rate * 306 / (yMax - yMin);

    updateData['lineCanvasData.xAxis.dataHeight'] = rate * 26;
    updateData['lineCanvasData.xAxis.fontSize'] = rate * 22;
    updateData['lineCanvasData.xAxis.fontColor'] = '#637280';
    updateData['lineCanvasData.xAxis.lineColor'] = '#DCE0E6';
    updateData['lineCanvasData.xAxis.lineWidth'] = rate * 2;
    updateData['lineCanvasData.xAxis.minData'] = xMin;
    updateData['lineCanvasData.xAxis.maxData'] = xMax;
    updateData['lineCanvasData.xAxis.padd'] = (canvasWidth - rate * 103) / (xMax - xMin);

    updateData['lineCanvasData.point'] = { size: rate * 4, isShow: false };
    updateData['lineCanvasData.canvasHeight'] = canvasHeight;


    this.setData(updateData);
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    util.getDevices()
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
            var temp=[]
            that.data.petInfo.forEach(function(e){
              if (app.systemInfo.system.includes("iOS")) {
                if (e.uuid != undefined && e.uuid == app.globalData.connectedDeviceId){
                  temp.push(e)
                }
              } else if (app.systemInfo.system.includes("Android")) {
                if (e.mac != undefined && e.mac == app.globalData.connectedDeviceId){
                  temp.push(e)
                }
              }
            })
            console.log("temp:",temp)
            if (temp[0]==undefined||temp[0].growthRecord[0] == undefined || temp[0].growthRecord[0] == undefined || temp[0].growthRecord[0].weight==undefined){
              wx.showModal({
                title: '提示',
                content: '您还没有添加已连接宠物的成长记录呢，请前去添加！',
                success:function(res){
                      if(res.confirm){
                            wx.navigateTo({
                              url: 'add/add',
                            })
                      }
                }
              })
            }
            that.setData({
              pets:temp
            })
            var max = temp[0].growthRecord[0].weight
            //获取数组的第一个值   
            for (var i in temp[0].growthRecord) {
              max = max > temp[0].growthRecord[i].weight ? max : temp[0].growthRecord[i].weight;
            }
            that.setData({
              max:max                                                         
            })
            console.log("最大值：",max);
            console.log(that.data.petInfo)
          }
        })
      }
    })
  },
  delete:function(e){
    console.log(e)
    let that=this
    wx.showModal({
      title: '提示',
      content: '请确认是否要删除此条信息？',
      confirmColor: '#007aff',
      cancelColor: '#007aff',
      confirmText: '是',
      cancelText: '否',
      success: function (res1) {
        if(res1.confirm){
          wx.request({
            url: url +'/growthRecord/delete',
            data:{
              "id":e.currentTarget.dataset.id
            },
            success:function(res){
                  if(res.data.code==200){
                    wx.showToast({
                      title: '删除成功！',
                    })
                    wx.startPullDownRefresh(),
                      that.showData(),
                    wx.stopPullDownRefresh()
                  }else{
                    wx.showToast({
                      title: '删除失败！',
                    })
                  }
            }
          })
        }
      }
    })

  },
showData:function(){
  let that = this
  that.setConvasData()

  console.log(that.data.max)
  var systemInfo = app.systemInfo;
  rate = systemInfo.screenWidth / 750;
  var updateData = {};
  canvasWidth = systemInfo.screenWidth - rate * 64;
  canvasHeight = rate * 306 + rate * 44 + rate * 34 + rate * 22;

  var yMax = parseInt(that.data.max) + 10;
  var yMin = 0;
  var xMax = 7;
  var xMin = 0;

  var data=[];
  var xData=[];

  var j = that.data.pets[0].growthRecord.length-1
  that.data.pets[0].growthRecord.forEach(function (e) {
    xData.push({ x: j, y: 0, title: e.rDate.substring(6, 10).replace("-", ".") })
    data.push({ x: j, y: parseInt(e.weight), title: e.weight })
    console.log(j)
    j--
  })
  
  var series = [{
    data: data
  }];
  
  var xAxisData = xData;
  var yAxisData = [
    { x: 0, y: 0, title: '0' },
    { x: 0, y: parseInt(yMax / 5 * 1), title: parseInt(yMax / 5 * 1).toString() },
    { x: 0, y: parseInt(yMax / 5 * 2), title: parseInt(yMax / 5 * 2).toString() },
    { x: 0, y: parseInt(yMax / 5 * 3), title: parseInt(yMax / 5 * 3).toString() },
    { x: 0, y: parseInt(yMax / 5 * 4), title: parseInt(yMax / 5 * 4).toString() },
    { x: 0, y: yMax, title: yMax.toString() },
  ];
  yMax = parseInt(that.data.max) + 10;
  yMin = 0;
  xMax = 7;
  xMin = 0;
  updateData['lineCanvasData.xAxis.minData'] = xMin;
  updateData['lineCanvasData.xAxis.maxData'] = xMax;
  updateData['lineCanvasData.xAxis.padd'] = (canvasWidth - rate * 98) / (xMax - xMin);
  updateData['lineCanvasData.point'] = { size: rate * 4, isShow: true };
  updateData['lineCanvasData.yAxis.minData'] = yMin;
  updateData['lineCanvasData.yAxis.maxData'] = yMax;
  updateData['lineCanvasData.yAxis.padd'] = rate * 306 / (yMax - yMin);
  updateData['lineCanvasData.series'] = series;
  updateData['lineCanvasData.xAxis.data'] = xAxisData;
  updateData['lineCanvasData.yAxis.data'] = yAxisData;
  that.setData(updateData);
},
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getPetInfo()

    let that = this
    setTimeout(function () {
      wx.startPullDownRefresh(),
        that.showData(),
        wx.stopPullDownRefresh()
    }, 2000)

   
    
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
    this.showData();
    wx.stopPullDownRefresh()
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