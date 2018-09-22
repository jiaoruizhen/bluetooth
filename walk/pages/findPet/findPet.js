// pages/findPet.js
var app = getApp();
var result;
var url = app.url
var util = require("../../utils/util.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loseInfoView: null,
    screenWidth: 0,
    screenHeight: 0,
    imgwidth: 0,
    imgheight: 0,
    temp:[],
    loseIn:[],
    loadNum:1
  },

  publish: function () {
    wx.navigateTo({
      url: '../findPet/addFind/addFind',
    })
  },
  detail:function(){
    wx.navigateTo({
      url: '../findPet/myPublish/myPublish',
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    util.searchbluetooth()
    this.getLoseInfo()
    var _this = this;
    wx.getSystemInfo({
      success: function (res) {
        _this.setData({
          screenHeight: res.windowHeight,
          screenWidth: res.windowWidth,
        });
        console.log("周期：",res)
      }
    });  
  },
  imageLoad: function (e) {
    var _this = this;
    var $width = e.detail.width,//获取图片真实宽度  
      $height = e.detail.height,
      ratio = $width / $height;//图片的真实宽高比例
    var viewWidth = 500,       //设置图片显示宽度，
      viewHeight = 500 / ratio;//计算的高度值
    this.setData({
      imgwidth: viewWidth,
      imgheight: viewHeight
    })
  }, 
  getLoseInfo: function () {
    let that = this
    var temp=[]
    wx.request({
      url: url + '/lose/findAll',
      success: function (res) {
        console.log("查询所有发布的丢失信息：", res)
        console.log(res.data.data)
        result =res.data.data
        res.data.data.forEach(function(e){
          if(e.list!=undefined||e.list!=null){
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
          loseInfoView: res.data.data,
          temp:temp
        })
      },
    })
  },
  // preview: function (e) {
  //   let that = this
  //   var idx=e.currentTarget.id
  //   var current= e.currentTarget.dataset.url
  //   console.log("picture:",idx)
  //   wx.previewImage({
  //     current:current,
  //     urls: that.data.temp
  //   })
  //   console.log("666:",e)
  // },


  preview: function (e) {
    let that = this
    let findId = e.currentTarget.dataset.id
    let currentArray = []
    console.log("结果：",result)
    for (var i = 0; i < result.length; i++) {
      if (findId == result[i].loseInfo.id) {
        for (var j = 0; j < result[i].list.length; j++) {
          currentArray.push(result[i].list[j].url)
        }
      }
    }
    wx.previewImage({
      current: e.currentTarget.dataset.url,
      urls: currentArray
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    util.getDevices()
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
  // 页面渲染
  // showBegin:function(){
  //   let that=this
  //   var loseIn=[]
  //   wx.request({
  //     url: url + '/lose/findAll',
  //     method: "GET",
  //     data: {},
  //     header: {
  //       'content-type': 'application/text'
  //     },
  //     success: function (res) {
  //       var res_len=res.data.data.length
  //       console.log("quanchang:",res_len)
  //       for (var i = 0; i < res_len;i++){
  //         if (i < 5) {
  //           loseIn.push(res.data.data[i])
  //         }
  //       } 
  //       that.setData({
  //         loseInfoView: loseIn
  //       })
  //       console.log("loseIn",loseIn)
  //     },
  //     fail: function () {
        
  //     },
  //     complete: function () {
        
  //     }
  //   })  
  // },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let that = this
    that.getLoseInfo()
    // that.showBegin()
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    console.log("333")
    let that = this
    wx.showNavigationBarLoading() //在标题栏中显示加载
    wx.request({
       url: url + '/lose/findAll',
       data: {},
       method: 'GET',
       // OPTIONS, GET, HEAD, POST, PUT, DELETE, TRACE, CONNECT
       // header: {}, // 设置请求的 header
       success: function (res) {
         // success
         console.log("down:",res)
       },
       fail: function () {
         // fail
         wx.showToast({
          title:"刷新失败！",
          icon:"success",
          duration: 1000
        })
       },
       complete: function () {
         // complete
         wx.hideNavigationBarLoading() //完成停止加载
         wx.stopPullDownRefresh() //停止下拉刷新
       }
    })
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var loseInf=[]
    this.getLoseInfo()
    var that = this
    /* 加载5条数据*/
    var num=5
    /*加载次数*/
    this.setData({
      loadNum: this.data.loadNum + 1
    })
    /*已加载数据num*/
    var loadNumber = this.data.loadNum*num
    console.log("加载：", loadNumber)
    // 显示加载图标
    wx.showLoading({
      title: '玩命加载中',
    })
    wx.request({
      url: url + '/lose/findAll',
      method: "GET",  
      data:{},
      // 请求头部
      header: {
        'content-type': 'application/text'
      },
      success: function (res) {
        if (num * loadNum <= res.data.data.length){
          for (var i = num * loadNum - 5; i < num * loadNum; i++) {
            loseInf.push(res.data.data[i])
          }
          console.log("add_num:", loseInf)
        }
        // 设置数据
        that.setData({
          loseInfoView: this.data.loseIn.concat.loseInf
        })
      },
      fail:function(){
        //fail
      },
      complete:function(){
        // 隐藏加载框
        wx.hideLoading();
      },
      
    })  
    

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }

})