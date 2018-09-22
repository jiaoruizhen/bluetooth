// pages/userInfo/petOwnerInfo/editUserInfo/edit.js
var app=getApp()
// var url ='https://www.dognessnetwork.com/walk-1.0.0-SNAPSHOT'
//  var url = 'https://localhost:80'
var url = app.url
Page({

  /**
   * 页面的初始数据
   */
  data: {
    text:'',
    id:0,
    userId:0,
    petId:0,
    type:"",
    sex:1,
    dates: getNowFormatDate(),
    types: '',
    picker_arr: [],//picker中range属性值
    picker_index: 0,//picker中value属性值
    id_arr: [],//存储id数组
    value:'',
    selectType:''
  },
  editUserInfo: function (e) {
    let that=this
    console.log("修改：",that.data.text)

    if(that.data.text=='昵称'){
      wx.request({
        url: url + '/users/updateUserInfo',
        data: {
          'id': that.data.userId,
          'nickname':e.detail.value.input,
        },
        success: function (res) {
          console.log("修改信息：", res)
          console.log("点击事件：",e)
          console.log("id:", e.detail.target.dataset.id,"name:", e.detail.value.input)
          if (res.data.code == 200) {
            wx.redirectTo({
              url: '../petOwnerInfo',
            })
          } else {
            wx.showToast({
              title: '修改失败',
            })
          }
        }
      })
    } else if (that.data.text == '姓名'){
      wx.request({
        url: url + '/users/updateUserInfo',
        data: {
          'id': that.data.userId,
          'name': e.detail.value.input
        },
        success: function (res) {
          console.log("修改信息：", res)
          console.log("点击事件：", e)
          console.log("id:", e.detail.target.dataset.id, "name:", e.detail.value.input)
          if (res.data.code == 200) {
            wx.navigateBack({
              url: '../petOwnerInfo',
            })
          } else {
            wx.showToast({
              title: '修改失败',
            })
          }
        }
      })
    } else if (that.data.text == '邮箱'){
      wx.request({
        url: url + '/users/updateUserInfo',
        data: {
          'id': that.data.userId,
          'email': e.detail.value.input
        },
        success: function (res) {
          console.log("修改信息：", res)
          if (res.data.code == 200) {
            wx.navigateBack({
              url: '../petOwnerInfo',
            })
          } else {
            wx.showToast({
              title: '修改失败',
            })
          }
        }
      })
    } else if (that.data.text == '宠物姓名'){
      wx.request({
        url: url + '/pet/updatePet',
        data: {
          'id': that.data.petId,
          'name': e.detail.value.input
        },
        success: function (res) {
          console.log("修改信息：", res)
          if (res.data.code == 200) {
            wx.navigateBack({
              url: '../petOwnerInfo',
            })
          } else {
            wx.showToast({
              title: '修改失败',
            })
          }
        }
      })
    } else if (that.data.text == '宠物性别') {
      wx.request({
        url: url + '/pet/updatePet',
        data: {
          'id': that.data.petId,
          'sex': e.detail.value.sex
        },
        success: function (res) {
          console.log("修改信息：", res)
          if (res.data.code == 200) {
            wx.navigateBack({
              url: '../petOwnerInfo',
            })
          } else {
            wx.showToast({
              title: '修改失败',
            })
          }
        }
      })
    } else if (that.data.text == '宠物出生日期') {
      wx.request({
        url: url + '/pet/updatePet',
        data: {
          'id': that.data.petId,
          'birthday': that.data.dates
        },
        success: function (res) {
          console.log("修改信息：", res)
          if(res.data.code==200){
            wx.navigateBack({
              url: '../petOwnerInfo',
            })
          }else{
            wx.showToast({
              title: '修改失败',
            })
          }
        }
      })
    } else if (that.data.text == '宠物种类') {
      wx.request({
        url: url + '/pet/updatePet',
        data: {
          'id': that.data.petId,
          'type': that.data.type
        },
        success: function (res) {
          console.log("修改信息：", res)
          if (res.data.code == 200) {
            wx.navigateBack({
              url: '../petOwnerInfo',
            })
          } else {
            wx.showToast({
              title: '修改失败',
            })
          }
        }
      })
    }
    
  },
  //  点击日期组件确定事件  
  bindDateChange: function (e) {
    console.log(e.detail.value)
    if (e.detail.value == null) {
      wx.showToast({
        title: '请选择出生日期',
      })
    }
    if (new Date(e.detail.value)>new Date()){
      wx.showToast({
        title: '日期错误',
      })
    }else{
      this.setData({
        dates: e.detail.value
      })
    }
    
    console.log(new Date(e.detail.value));
  },
  check:function(e){
    var localData=e.detail.value
    var noiseChar = "~!@#$%^&*()_+-=`[]{};':\"\\|,./<>?\n\r";
    var goodChar = "～！＠＃＄％＾＆＊（）＿＋－＝｀［］｛｝；＇：＂＼｜，．／＜＞？　　";
    for (var i = 0; i < noiseChar.length; i++) {
      var oneChar = noiseChar.charAt(i);
      var towChar = goodChar.charAt(i)
      while (localData.indexOf(oneChar) >= 0) {
          wx.showToast({
            title: '不能输入特殊字符',
          })
      }
    } 
  },
  bindPickerChange: function (e) {//选项改变触发事件
    let that = this
    console.log(e.detail.value);
    console.log("选择类型：", that.data.picker_arr[e.detail.value]);
    if (e.detail.value == null) {
      wx.showToast({
        title: '请选择宠物类型',
      })
    } 
    var i = parseInt(e.detail.value)+1
    console.log(i)
    that.setData({
      picker_index: e.detail.value,
      type: i,
      selectType: that.data.picker_arr[e.detail.value]
    })
  },
  getType: function () {
    let that = this
    console.log("url:",url)
    wx.request({
      url: url + '/type/findAll',
      success: function (res) {
        console.log(res.data.data)
        var picker_arr = [],
          id_arr = [],
          types = res.data.data

        types.forEach(function (e) {
          picker_arr.push(e.name);
          id_arr.push(e.id);
        })

        that.setData({ types: types, picker_arr: picker_arr, id_arr: id_arr });
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that=this
    console.log('options:', options)
    console.log("text:", that.data.text)
    that.getType()
    that.setData({
        id:parseInt(options.id),
        userId: parseInt(options.users),
        petId: parseInt(options.petId),
        value: options.value,
        dates: options.value,
        selectType: options.value
    })
    //修改昵称
    if(options.id==0){
      that.setData({
      text:'昵称'
      })
    } else if (options.id == 1){
      that.setData({
        text: '姓名'
      })
    } else if (options.id == 2){
      that.setData({
        text: '邮箱'
      })
    } else if (options.id == 3){
      that.setData({
        text: '宠物姓名'
      })
    } else if (options.id == 4) {
      that.setData({
        text: '宠物性别'
      })
    } else if (options.id == 5) {
      that.setData({
        text: '宠物出生日期'
      })
    } else if (options.id == 6) {
      that.setData({
        text: '宠物种类'
      })
    }
     
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
  var hours = date.getHours();
  var min = date.getMinutes();
  var secend = date.getSeconds();
  if (hours >= 0 && hours <= 9) {
    hours = "0" + hours;
  }
  if (min >= 0 && min <= 9) {
    min = "0" + min;
  }
  if (secend >= 0 && secend <= 9) {
    secend = "0" + secend;
  }

  if (month >= 0 && month <= 9) {
    month = "0" + month;
  }
  if (strDate >= 0 && strDate <= 9) {
    strDate = "0" + strDate;
  }
  var currentdate = date.getFullYear() + seperator1 + month + seperator1 + strDate;
  return currentdate;
}