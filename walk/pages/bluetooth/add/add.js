var app = getApp();
var url = app.url
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pets: null,
    petId: null,
    vacDetail:"身体健康，未接种疫苗",
    diet:"今天吃了2千克狗粮"
  },
  getType: function () {
    let that = this
    
    var temp = []
    var temp1 = []
    app.globalData.petInfo.forEach(function (e) {
      if (e.mac != undefined && e.mac == app.globalData.connectedDeviceId) {//mac地址存在 qie等于已连接设备id
        e = { "name": e.petName, "mac": e.mac, "url": e.petPortrait,"id":e.petId }
        temp.push(e)
      } 
      if (e.uuid != undefined && e.uuid == app.globalData.connectedDeviceId) {//mac地址不存在  uuid存在
        e = { "name": e.petName, "mac": e.uuid, "e.url": e.petPortrait, "id": e.petId }
        temp1.push(e)
      }
    })
    if (app.systemInfo.system.includes("iOS")) {
      that.setData({
        pets: temp1
      })
    } else if (app.systemInfo.system.includes("Android")) {
      that.setData({
        pets: temp,
      })
    }
    console.log("pets:",that.data.pets)
  },
  radioChange: function (e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value)
    let that = this
    that.setData({
      petId: e.detail.value
    })
  },
  formSubmit: function (e) {
    let that = this
    console.log("添加记录：", e)
    var detail="";
    var diet="";
    if (e.detail.value.vacDetail == "" || e.detail.value.vacDetail==null){
      detail =that.data.vacDetail
    }else{
      detail = e.detail.value.vacDetail
    }
    if (e.detail.value.diet == "" || e.detail.value.diet == null) {
      diet = that.data.diet
    } else {
      diet = e.detail.value.diet
    }
    if (e.detail.value.height == "" || e.detail.value.height == null || e.detail.value.height==undefined){
        wx.showToast({
          title: '请输入身高',
        })
    }
    if (e.detail.value.weight == "" || e.detail.value.weight == null || e.detail.value.weight==undefined){
        wx.showToast({
          title: '请输入体重',
        })
    }
    wx.request({
      url: url + '/growthRecord/insert',
      data: {
        "height": e.detail.value.height,
        "weight": e.detail.value.weight,
        "diet": diet,
        "vacDetail": detail,
        "rDate": getNowFormatDate(),
        // "petId": 206
        "petId": parseInt(that.data.pets[0].id)
      },
      success: function (res) {
        console.log(res)
        if (res.data.code == 200) {
          wx.navigateBack({
            url: '../petGrowthInfo',
          })
        }
      }

    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getType()
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
function getNowFormatDate() {
  var date = new Date();
  var seperator1 = "-";
  var seperator2 = ":";
  var month = date.getMonth() + 1;
  var strDate = date.getDate();
  if (month >= 1 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate;
  return currentdate;
}