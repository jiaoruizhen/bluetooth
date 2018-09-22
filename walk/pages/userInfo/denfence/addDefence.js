// pages/denfence/addDefence.js
var timestamp = Date.parse(new Date());
timestamp = timestamp / 1000;  
var app = getApp();
// var serverUrl = 'http://potter.s1.natapp.cc';
var serverUrl = 'https://www.dognessnetwork.com/neacklace';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    name: timestamp,
    radius:50
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    //设置长
    var width = wx.getSystemInfoSync().windowWidth;
    var deviceHeight = wx.getSystemInfoSync().windowHeight;
    var leftDistance = width * 0.8;
    var topDistance = height * 0.03;
    var pages = getCurrentPages()    //获取加载的页面
    var currentPage = pages[pages.length - 1]    //获取当前页面的对象
    var url = currentPage.route    //当前页面url
    var options = currentPage.options    //如果要获取url中所带的参数可以查看options
    var pid = options.pid;
    var lat = options.lat;
    var lng = options.lng;
    var imei = options.imei;
    console.log('添加围栏的信息：pid:'+pid+'=========lat:'+lat+'======lng:'+lng+'==========imei:'+imei)
    var fenceid = null;
    if (options.fenceid != undefined){
      var fenceid = options.fenceid;
    }
    var height = deviceHeight*0.90;
    that.setData({
      imei:imei,
      fenceid:fenceid,
      controls: [{
        id: 1,
        position: {
          top: topDistance,
          left: leftDistance,
          width: 55,
          height: 45
        },
        iconPath: "../img/save.png",
        clickable: true

      }],
      pid:pid,
      circles: [{
        iconPath: "../img/fence_location.png",
        id: 0,
        latitude: lat,
        longitude: lng,
        color: '#0000FF',
        // color:'#000000AA',
        fillColor: '#00000000',
        // fillColor: '#ff0000',
        radius: 30
      }],
      markers: [{
        iconPath: "../img/fence_location.png",
        id: 0,
        latitude: lat,
        longitude: lng,
        width: 25,
        height: 35
      }],
      lng: lng,
      lat: lat,
      height:height
    })
  },
  sliderchange:function(res){
   var radius = res.detail.value ;
   var that = this;
   var lat = that.data.lat;
   var lng = that.data.lng;
   that.setData({
     radius:radius,
     circles: [{
       iconPath: "../img/fence_location.png",
       id: 0,
       latitude: lat,
       longitude: lng,
       color: '#0000FF',
      //  color: '#000000AA',
       fillColor: '#00000000',
        // fillColor: '#ff0000',
       radius: radius
     }]
   })
  },

  //点击保存的动作
  controltap:function(){
    var that = this;
    var fenceid = that.data.fenceid;
    var url = null;
    var name = that.data.name;
    var lng = that.data.lng;
    var lat = that.data.lat;
    var radius = that.data.radius;
    var pid = that.data.pid;
    var imei = that.data.imei;
    var timestamp = Date.parse(new Date());
    timestamp = timestamp / 1000;  
    var data = null;
    if (fenceid == null){
      //添加围栏
      url = serverUrl+'/add_geo_fance';
     data = { "name":name, "lng":lng, "lat":lat, "radius":radius, "pid":pid }
    }else{
      //更新围栏
      url = serverUrl+'/update_geo_fance';
      data = { "name": name, "lng": lng, "lat": lat, "radius": radius, "pid": pid ,"fenceid":fenceid}
    }
    // var length = name.trim().length;
    // var pid = that.data.pid;
    // if (length < 1) {
    //   wx.showToast({
    //     title: '请填写名称',
    //   })
    // }else{
      wx.request({
        url: url + '?session=' + app.session,
        data:data,
        success:function(res){  
          var status = res.data.header.status;
          if (status =='1000'){
            wx.request({
              url: serverUrl+'/onoff_fance?session='+app.session,
              data: { "deviceId": imei, "fance": 1, "timestap": timestamp},
              success: function (res) {
              }
            })
            wx.navigateBack({
              url: '../index/index?name=' + name + '&lng=' + lng + '&lat=' + lat + '&radius=' + radius + '&pid=' + pid,
            })
          }
        },
        fail:function(res){
            console.log("error"+res)
        }
      })
    // }
  },

  //input输入操作
  // nameInput:function(res){
  //   var that = this;
  //   var name = res.detail.value;
  //   var length = name.trim().length;
  //     that.setData({
  //       name: name
  //     })
  // },
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