// pages/findPet/information/information.js
var app = getApp();

var url = app.url
Page({

  /**
   * 页面的初始数据
   */
  data: {
      loseInfo:'',
      temp:[]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that=this
    console.log("app.globalData.loseInfo:", app.globalData.loseInfo)
    var temp=[]
    app.globalData.loseInfo.forEach(function (e) {
      if (e.list != undefined || e.list != null) {
        e.list.forEach(function (a) {
          if (a.url.includes("\"")) {
            a.url = a.url.split("\"")[1]
            temp.push(a.url)
          }else{
            temp.push(a.url)
          }
        })
      }
    })
   that.setData({
     loseInfo: app.globalData.loseInfo,
     temp:temp
   })
  },
  getPhone:function(e){
      console.log(e)
      wx.makePhoneCall({
        phoneNumber: e.currentTarget.dataset.mobile,
      })
  },
  preview:function(e){
    let that=this
    console.log(e)
      wx.previewImage({
        current:e.currentTarget.dataset.url,
        urls: that.data.temp
      })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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