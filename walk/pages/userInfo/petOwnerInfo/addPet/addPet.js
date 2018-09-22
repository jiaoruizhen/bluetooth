// pages/userInfo/petOwnerInfo/addPet/addPet.js
var app = getApp();

var url = app.url
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dates: '2018-06-13',
    types: '',
    type: '',
    picker_arr: [],//picker中range属性值
    picker_index: 0,//picker中value属性值
    id_arr: [],//存储id数组
    userId: '',
    picture: '',
    logo: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log("userId:", options.id)
    this.setData(
      { userId: options.id }
    )
    this.getType()
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
    that.uploadimg({
      url: url + '/users/upload',//这里是你图片上传的接口
      path: pics  //这里是选取的图片的地址数组
    });
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
        var data = JSON.stringify(resp.data);
        //   data = data.replace(/\n\t/g, "\\n\\t").replace(/\n/g,"\\n");//重点
        // console.log('data', data)
        var result = JSON.parse(data);
        result = JSON.parse(result)
        console.log("图片：", resp, result.string)
        console.log("resp", resp)
        var temp = []
        if (result.code == 200) {
          success++;//图片上传成功，图片上传成功的变量+1 
          temp = temp.concat(result.string)
          that.setData({
            picture: temp
          })
          console.log("111:", that.data.picture);
          //这里可能有BUG，失败也会执行这里,所以这里应该是后台返回过来的状态码为成功时，这里的success才+1
        }
      },
      fail: (res) => {
        fail++;//图片上传失败，图片上传失败的变量+1
        console.log('fail:' + i + "fail:" + fail);
      },
      complete: () => {
        console.log(i);
        i++;//这个图片执行完上传后，开始上传下一张
        if (i == data.path.length) {   //当图片传完时，停止调用          
          console.log('执行完毕');
          console.log('成功：' + success + " 失败：" + fail);
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
  //  点击日期组件确定事件  
  bindDateChange: function (e) {
    console.log(e.detail.value)
    if (e.detail.value == null) {
      wx.showToast({
        title: '请选择出生日期',
      })
    }
    this.setData({
      dates: e.detail.value
    })
  },
  bindPickerChange: function (e) {//选项改变触发事件
    let that = this
    console.log(e.detail.value);
    if (e.detail.value == null) {
      wx.showToast({
        title: '请选择宠物类型',
      })
    }
    that.setData({
      picker_index: e.detail.value,
      type: e.detail.value
    })
  },
  formSubmit: function (e) {
    let that = this
    console.log(e)
    if (e.detail.value.name == null) {
      wx.showToast({
        title: '请选择宠物类型',
      })
    }
    wx.request({
      url: url + '/pet/addOne',
      data: {
        "type": parseInt(that.data.type) + 1,
        "name": e.detail.value.name,
        "sex": e.detail.value.sex,
        "birthday": that.data.dates,
        "petUserId": parseInt(that.data.userId),
        "portrait": that.data.picture[0]
      },
      success: function (res) {
        if (res.data.code == 200) {
          wx.showToast({
            title: '添加成功！',
          })
          wx.navigateBack({
            url: '../petOwnerInfo',
          })
        }
      }
    })

  },
  getType: function () {
    let that = this
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