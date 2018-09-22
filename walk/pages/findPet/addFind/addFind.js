// pages/findPet/addFind/addFind.js
var app = getApp();
var url = app.url
var countdown = 60;
var settime = function (that) {
  if (countdown == 0) {
    that.setData({ is_show: true })
    countdown = 60; return;
  } else {
    that.setData({
      is_show: false,
      last_time: countdown
    })
    countdown--;
  }
  setTimeout(function () {
    settime(that)
  }, 1000)
}
var temp = []
var id = []
Page({

  /**
   * 页面的初始数据
   */
  data: {
    picture: [],
    logo: [],
    mobile: '',
    time: 0,
    isShow: false,
    pet: [],
    picker_arr: [],//picker中range属性值
    picker_index: 0,//picker中value属性值
    id_arr: [],//存储id数组
    last_time: '',
    is_show: true,
    isTrue: false,
    dates: "",
    times: "",
    index: 0,
    end: "",
    device: '',
    deviceId: [],
    petId: '',
    types: "",
    selectPet: '',
    a:12,
  },
  chooseImageTap: function () {
    let _this = this;
    wx.showActionSheet({
      itemList: ['从相册中选择', '拍照'],
      itemColor: "#f7982a",
      success: function (res) {
        if (!res.cancel) {
          if (res.tapIndex == 0) {
            _this.chooseWxImage('album')
          } else if (res.tapIndex == 1) {
            _this.chooseWxImage('camera')
          }
        }
      }
    })

  },
  chooseWxImage: function (type) {
    let _this = this;
    var pics = []
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: [type],
      success: function (res) {
        console.log(res);
        //然后上传图片
        var imgsrc = res.tempFilePaths;
        pics = pics.concat(imgsrc);
        _this.setData({
          logo: pics
        })
        _this.uoloadImg()
      }
    })
  },
  uoloadImg: function () {
    let that = this
    var pics = this.data.logo;
    console.log("pics:", pics)
    that.uploadimg({
      url: url + '/users/upload',//这里是你图片上传的接口
      path: pics  //这里是选取的图片的地址数组
    });
  },
  formSubmit: function (e) {
    let that = this

    var petId = this.data.id_arr[e.detail.value.selector]
    console.log(this.data.id_arr[e.detail.value.selector])
    var lat = 0
    var lon = 0
    wx.getLocation({
      type: 'wgs84',
      success: function (res) {
        console.log(res)
        lat = res.latitude
        lon = res.longitude
     
    console.log('form发生了submit事件，携带数据为：', e)
    console.log(res.latitude, res.longitude)
    if (that.data.picture[0] == undefined || that.data.picture[0] == null || that.data.picture[0].length <= 0) {
      wx.showModal({
        title: '提示',
        content: '请上传图片',
      })
    } else {
      if (e.detail.value.mobile == null || e.detail.value.mobile == "" || e.detail.value.mobile == undefined) {
        wx.showModal({
          title: '提示',
          content: '请填写手机号',
        })
      } else {
        if (e.detail.value.sendData == null || e.detail.value.sendData == "" || e.detail.value.sendData == undefined) {
          wx.showModal({
            title: '提示',
            content: '请添加宠物描述',
          })
        } else {

          if (e.detail.value.location == null || e.detail.value.location == "" || e.detail.value.location == undefined) {
            wx.showModal({
              title: '提示',
              content: '请添加宠物丢失地点',
            })
          } else {
            console.log("loseloseloseloseloselose",lat,":",lon)
            wx.request({
              url: url + '/lose/insert',
              data: {
                "petId": petId,
                "mobile": e.detail.value.mobile,
                "sendData": e.detail.value.sendData,
                "createTime": that.data.dates + " " + that.data.times,
                "publishTime": getNowFormatDate(),
                "location": e.detail.value.location,
                "bounty": e.detail.value.bounty,
                "status": 0,
                "type": "1",
                "lat": res.latitude,
                "lon": res.longitude,
              },
              success: function (res) {
                if (res.data.code == 200) {
                  
                  that.setData({
                    isTrue: false
                  })
                  console.log("添加信息：", res)
                  console.log("that.data.picture", that.data.picture)
                  that.data.picture.forEach(function (e) {
                    wx.request({
                      url: url + '/image/insert',
                      data: {
                        "informationId": parseInt(res.data.data),
                        "url": e
                      },
                      success: function (res1) {
                        console.log("res1：",res1)
                        if (res1.data.code == 200) {
                          console.log("that.data.deviceId", that.data.deviceId)
                          if (that.data.deviceId != null && that.data.deviceId != undefined) {
                            that.data.deviceId.forEach(function (e) {
                              wx.request({
                                url: url + '/device/update',
                                data: {
                                  "id": e,
                                  "isLose": 1
                                },
                                success: function (r) {
                                  console.log("更改设备状态：",r)
                                }
                              })
                            })
                          }

                         
                        }
                      }
                    })
                  })
                  wx.switchTab({
                    url: '../findPet',
                  })

                }
              }
            })

          }
        }
      }
    }
      }
    })
  },
  sendMsg: function (e) {
    if (e.detail.value.length <= 0 || e.detail.value == null || e.detail.value == undefined) {
      wx.showToast({
        title: '请填写描述信息',
      })
    }
  },
  blur_bounty: function (e) {
    if (e.detail.value == "" || e.detail.value.length <= 0 || e.detail.value == null || e.detail.value == undefined) {
      wx.showToast({
        title: '请输入悬赏金额',
      })
    }
  },
  blur_mobile: function (e) {
    let that = this
    console.log(e)
    if (e.detail.value == "" || e.detail.value.length <= 0 || e.detail.value == null || e.detail.value == undefined) {
      wx.showToast({
        title: '请输入手机号',
      })
    } else {
      var reg = /^1[3|4|5|7|8|6][0-9]{9}$/
      if (reg.exec(e.detail.value)) {
        that.setData({
          mobile: e.detail.value
        })
      } else {
        wx.showToast({
          title: '手机号错误',
        })
      }

    }

  },
  bindTimeChange: function (e) {
    console.log(this.data.dates + " " + this.data.times)
    this.setData({
      times: e.detail.value
    })
  },
  //  点击日期组件确定事件  
  bindDateChange: function (e) {
    console.log(e.detail.value)
    this.setData({
      dates: e.detail.value
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
   // console.log(this.data.a)
    var temp = getNowFormatDate().split(",")
    console.log(temp)
    this.setData({
      dates: temp[0],
      times: temp[1],
      end: temp[0],

    })
    this.getPetInfo()
   // console.log(options)
  },
  //获取验证码
  clickVerify: function () {
    let that = this
    // 将获取验证码按钮隐藏60s，60s后再次显示 
    if (that.data.mobile == null || that.data.mobile == "" || that.data.mobile == undefined) {
      wx.showToast({
        title: '请输入手机号',
      })
    } else {
      that.setData({
        is_show: (!that.data.is_show)
        //false    
      })
      settime(that);
      wx.request({
        url: 'https://tmltea.mynatapp.cc/wechat/public/sedMsg',
        data: {
          "mobile": that.data.mobile
        },
        success: function (res) {
          if (res.data.errMsg == "OK") {
            wx.showToast({
              title: '发送成功',
              icon: "success"
            })
          } else {
            wx.showToast({
              title: '发送失败',
            })
          }
          console.log("======", res)
        }, fail: function (res) {
          console.log("失败信息：", res)
        }
      })
    }
  },
  send_code: function (e) {
    //验证验证码是否正确 输入验证码然后隐藏倒计时
    let that = this
    if (that.data.mobile == null || that.data.mobile == "" || that.data.mobile == undefined) {
      wx.showToast({
        title: '请输入手机号',
      })
    } else {
      if (e.detail.value.length <= 0 || e.detail.value == null || e.detail.value == undefined) {
        wx.showToast({
          title: '请输入验证码',
        })
      } else {
        let that = this
        var timestamp = Date.parse(new Date());
        timestamp = timestamp / 1000;
        console.log(that.data.mobile, ",", e.detail.value, ",", timestamp)
        wx.request({
          url: 'https://tmltea.mynatapp.cc/wechat/public/checkMsg',
          data: {
            "phone": that.data.mobile,
            "authCode": e.detail.value,
            "createTime": timestamp
          },
          success: function (res) {
            console.log(res);
            //如果验证码错误 显示错误信息
            if (res.data.res == "ok") {
              wx.showToast({
                title: '验证成功',
                icon: "success"
              })
            } else {
              wx.showToast({
                title: '验证失败',
              })
            }
          }
        })

      }

    }
  },
  bindPickerChange: function (e) {//选项改变触发事件
    let that = this
    console.log(e)
    that.setData({
      picker_index: e.detail.value,
      selectPet: that.data.pet[e.detail.value]
    })
    that.getMyPublish(that.data.id_arr[e.detail.value])
    console.log(e)
  },
  blur_location: function (e) {
    if (e.detail.value == "" || e.detail.value.length <= 0 || e.detail.value == null || e.detail.value == undefined) {
      wx.showToast({
        title: '请输入丢失地址',
      })
    }
  },
  radioChange: function (e) {
    console.log("设备", e.detail.value)
    if (e.detail.value == 0 || e.detail.value == "" || e.detail.value == undefined) {
    } else {
      id.push(e.detail.value)
      this.setData({
        deviceId: id
      })
    }
  },
  uploadimg: function (data) {
    var that = this,

      i = data.i ? data.i : 0,//当前上传的哪张图片
      success = data.success ? data.success : 0,//上传成功的个数
      fail = data.fail ? data.fail : 0;//上传失败的个数
    console.log("data.path[i]", data.path[i])
    console.log(data.url)
    wx.uploadFile({
      url: data.url,
      filePath: data.path[i],
      name: 'file',//这里根据自己的实际情况改
      formData: null,//这里是上传图片时一起上传的数据
      header: { "Content-Type": "multipart/form-data" },
      success: (resp) => {
        console.log("返回结果：", resp)
        var data = JSON.stringify(resp.data);
        var result = JSON.parse(data);
        result = JSON.parse(result)

        if (result.code == 200) {
          success++;//图片上传成功，图片上传成功的变量+1 

          temp = temp.concat(result.string)
          if (result.string == null || result.string == "" || result.string == undefined) {
            wx.showToast({
              title: '上传失败',
            })
          }
          console.log(result.data)
          that.setData({
            picture: temp,
            types: result.data
          })
          that.openActionsheetSh()
          console.log("111:", that.data.picture);
          //这里可能有BUG，失败也会执行这里,所以这里应该是后台返回过来的状态码为成功时，这里的success才+1
        } else if (result.code == 89 || result.code == 88) {
          wx.showModal({
            title: '提示',
            content: "您上传的" + result.msg + ',请重新上传！'
          })
        }
      },
      fail: (res) => {
        fail++;//图片上传失败，图片上传失败的变量+1
        console.log('fail:' + i + "fail:" + fail);
      },
      complete: () => {
        let that = this
        console.log(i);
        i++;//这个图片执行完上传后，开始上传下一张
        if (i == data.path.length) {   //当图片传完时，停止调用          
          console.log('执行完毕');
          console.log('成功：' + success + " 失败：" + fail);
          var index=0;
          index+=success
          that.setData({
            index: index,
          })
        } else {//若图片还没有传完，则继续调用函数
          console.log(i);
          data.i = i;
          data.success = success;
          data.fail = fail;
          that.uploadimg(data);
        }

      }
    });
  },
  deletePicture:function(e){//删除图片
  let that=this
var temp=that.data.picture
    console.log("11111111",temp)
    temp.splice(e.currentTarget.dataset.index, 1);
    console.log("222222222",temp)
  console.log(e)
      wx.request({
        url: url +'/users/deletePicture',
        data:{
          "url": e.currentTarget.dataset.url
        },
        success:function(res){
          console.log(res)
          var a = that.data.index - 1
          if(a<0){
            a=0
          }
          that.setData({
            index:a,
            picture:temp
          })
        }

      })
  },
  preview:function(e){
    let that=this
      wx.previewImage({
        current: e.currentTarget.dataset.url,
        urls: that.data.picture,
      })
  },
  getPetInfo: function () {
    let that = this
    console.log("res--userId")
    wx.getStorage({
      key: 'userId',
      success: function (res) {
        console.log("res--userId", res)
        wx.request({
          url: url + '/pet/selectAllDeviceByPetUserId',
          data: {
            "userId": res.data
          },
          success: function (res) {
            var data = JSON.stringify(res);
            data = data.replace(/\ufeff/g, "");//重点
            var result = JSON.parse(data);
            console.log(result.data.data)
            var picker_arr = [],
              id_arr = [],
              pet = result.data.data.pets
              var temp=[]
              var tep={}
            pet.forEach(function (e) {
              picker_arr.push(e.name);
              id_arr.push(e.id);
              result.data.data.devices.forEach(function(a){
                    if(a[0].petId==e.id){
                          tep={"mac":a[0].mac,"name":e.name,"id":a[0].id,"type":a[0].type}      
                          temp.push(tep)
                    }
              })
            })
            console.log("temp:",temp)
            that.setData({ pet: pet, picker_arr: picker_arr, id_arr: id_arr, device: temp });
            that.setData({
              selectPet: that.data.pet[0]
            })
          }
        })
      },
      fail: function (res) {
        console.log(res)
      }
    })
  },
  openActionsheetSh(e) {
    let that = this
    var temp = []
    // console.log(e)
    wx.showActionSheet({
      itemList: that.data.types,
      itemColor: '#007aff',
      success(res) {
        console.log("res:", res)
        if (res.tapIndex === 0) {
          that.updatePetType(that.data.types[0])
        } else if (res.tapIndex === 1) {
          that.updatePetType(that.data.types[1])
        } else if (res.tapIndex === 2) {
          that.updatePetType(that.data.types[2])
        } else if (res.tapIndex === 3) {
          that.updatePetType(that.data.types[3])
        } else if (res.tapIndex === 4) {
          that.updatePetType(that.data.types[4])
        } else if (res.tapIndex === 5) {
          that.updatePetType(that.data.types[5])
        }
      }
    })
  },
  updatePetType: function (type) {
    let that = this
    console.log("type",type)
    if(type!=null||type!=""||type!=undefined){
          wx.request({
            url: url +'/type/selectByName',
            data:{
              name: type
            },
            success:function(res){
                console.log("res::::",res)
    console.log("===================="+that.data.selectPet.type)
    var id = res.data.data[0].id
    console.log("id:",id)
    if (res.data.data[0].id != that.data.selectPet.type) {//选择的种类不是已拥有宠物种类
      wx.showModal({
        title: '提示',
        content: '您的宠物种类和您当前选择的不一致，请确认是否要将当前选择的种类作为您的宠物种类?', success: function (res1) {
          if (res1.confirm) {
            wx.request({
              url: url + '/pet/updatePet',
              data: {
                'id': that.data.selectPet.id,
                'type': id
              },
              success: function (res) {
                console.log("修改信息：", res)
                if (res.data.code == 200) {
                  wx.showToast({
                    title: '修改成功',
                  })     
                } else {
                  wx.showToast({
                    title: '修改失败',
                  })
                }
              }
            })
          }
        }
      })
    }
            }
      })
    }
  },
  getMyPublish: function (id) {
    let that = this
    //console.log("宠物信息", app.globalData.petInfo.pets)
    
      wx.request({
        url: url + '/lose/selectByPetIdAndDate',
        data: {
          petId:id,
          date: getNowDate()
        },
        success:function(res){
          console.log("查询当天发布的信息：",res)
          if (res.data.data!=undefined&&res.data.data.length>=3){
            wx.showModal({
              title: '提示',
              content: '您今天发布消息已达上限，请明天再发布！',
              confirmColor: '#007aff',
              cancelColor: '#007aff',
              confirmText: '是',
              cancelText: '否',
              success: function (res1) {
                wx.switchTab({
                  url: '../findPet',
                })
              }
            })
          }
        }
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
  var time = hours + seperator2 + min
  return currentdate + "," + time;
}

function getNowDate() {
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
 
  return currentdate
}