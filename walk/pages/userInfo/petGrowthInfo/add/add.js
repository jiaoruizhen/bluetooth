var app = getApp();
var url = app.url
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pets: null,
    petId: '',
    vacDetail:"身体健康，未接种疫苗",
    diet:"今天吃了2千克狗粮"
  },
  getType: function () {
    let that = this
    wx.getStorage({
      key: 'userId',
      success: function (res) {
        wx.request({
          url: url + '/pet/selectByUserId',
          data: {
            "userId": res.data
          },
          success: function (res) {
            console.log("宠物：", res)
            that.setData({ pets: res.data.data.pets });
            console.log(that.data.pets)

          }
        })
      }
    })
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
    wx.request({
      url: url + '/growthRecord/insert',
      data: {
        "height": e.detail.value.weight,
        "weight": e.detail.value.weight,
        "diet": diet,
        "vacDetail": detail,
        "rDate": getNowFormatDate(),
        // "petId": 206
        "petId": parseInt(that.data.petId)
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