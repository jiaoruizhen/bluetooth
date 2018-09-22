// pages/userInfo.js、
var app = getApp();
var url = app.url
var util = require("../../utils/util.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    users: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("用户信息111：", app.globalData.userInfo);
      this.setData({
        users: app.globalData.userInfo
      })
      util.searchbluetooth()
  },
  
  removeDevice:function(){
    
    
   
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    util.getDevices()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
   
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
  
  }
})