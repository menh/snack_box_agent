// pages/box/boxEdit/boxEdit.js
const app = getApp()
const util = require('../../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    dateMultiArray: util.dateMultiArray,
    gradeMultiArray: ['未知', '大一', '大二', '大三', '大四', '研一', '研二', '研三'],
    gradeMultiIndex: [0],
    attendDateMultiIndex: [0, 0, 0, 0, 0, 0],
    lastSuppleDateMultiIndex: [0, 0, 0, 0, 0, 0],
    box: {
      containerId: '',
      boxId: '',
      room: '',
      sex: '',
      grade: '未知',
      attendDate: '',
      lastSuppleDate: '',
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    var self = this;
    var isEdit = options.isEdit;
    var interfaceName = options.interfaceName;
    var containerId = options.containerId;
    var boxId = options.boxId;

    self.setData({
      isEdit: isEdit,
      interfaceName: interfaceName
    })

    //编辑
    if (isEdit == 'true') {
      wx.setNavigationBarTitle({
        title: '编辑盒子'
      });
      this.data.box.boxId = boxId;
      this.getBox(boxId);
    } //添加
    else {
      wx.setNavigationBarTitle({
        title: '添加盒子'
      });
      this.data.box.containerId = containerId;
      this.setBoxDateBeforeEdit();
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },


  getBox: function(boxId) {
    console.log(boxId)
    var self = this;
    wx.request({
      url: app.globalData.serverIp + 'selBox.do',
      data: {
        boxId: boxId,
        conditionParam: 'boxId',
      },
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        console.log('box:', res.data)
        self.getBoxCallback(self, res.data[0]);
        wx.stopPullDownRefresh();
      },
      fail: function(res) {
        wx.showModal({
          title: '错误',
          content: res.data,
          showCancel: false,
          confirmText: '我知道了',
        })
      }
    })

  },

  getBoxCallback: function(self, box) {
    self.setDateByBox(self, box); //设置两个时间index
    self.setData({ //更新box，及其显示模式
      box: box
    })
  },
  setDateByBox: function(self, box) {
    var attendDate = util.string2Date(box.attendDate);
    var lastSuppleDate = util.string2Date(box.lastSuppleDate);
    var attendDateMultiIndex = util.getDateArrayByDate(attendDate);
    var lastSuppleDateMultiIndex = util.getDateArrayByDate(lastSuppleDate);


    var boxGrade = box.grade;
    var gradeMultiArray = this.data.gradeMultiArray;
    var gradeMultiIndex = [0]
    for (var i = 0; i < gradeMultiArray.length; i++) {
      if (boxGrade == gradeMultiArray[i]) {
        gradeMultiIndex = [i];
      }
    }

    self.setData({
      gradeMultiIndex: gradeMultiIndex,
      attendDateMultiIndex: attendDateMultiIndex,
      lastSuppleDateMultiIndex: lastSuppleDateMultiIndex
    })
  },

  setBoxDateBeforeEdit: function() {
    var date = new Date();
    var year = date.getFullYear(); //获取完整的年份(4位,1970-????)
    var month = date.getMonth() + 1; //获取当前月份(0-11,0代表1月)
    var day = date.getDate(); //获取当前日(1-31)
    var hour = date.getHours(); //获取当前小时数(0-23)
    var minutes = date.getMinutes(); //获取当前分钟数(0-59)
    var seconds = date.getSeconds(); //获取当前秒数(0-59)
    var dateNow = [year - 2018, month - 1, day - 1, hour, minutes, seconds]
    this.setData({
      attendDateMultiIndex: dateNow,
      lastSuppleDateMultiIndex: dateNow
    })
    this.data.box.attendDate = this.getDateFormMultiIndex(dateNow);
    this.data.box.lastSuppleDate = this.getDateFormMultiIndex(dateNow);
  },


  setNewDate: function(e) {},

  editRadioChange: function(e) {
    var value = e.detail.value;
    var name = e.currentTarget.dataset.name;
    if (name == 'sex') {
      this.data.box.sex = value;
    }
  },

  editInputChange: function(e) {
    var value = e.detail.value;
    var name = e.currentTarget.dataset.name;
    if (name == 'boxId') {
      this.data.box.boxId = value;
    } else if (name == 'room') {
      this.data.box.room = value;
    }
  },

  editPickerChange: function(e) {
    var value = e.detail.value;
    var name = e.currentTarget.dataset.name;
    if (name == 'grade') {
      this.setData({
        gradeMultiIndex: value
      });
      var gradeMultiArray = this.data.gradeMultiArray;
      var gradeMultiIndex = this.data.gradeMultiIndex;
      this.data.box.grade = gradeMultiArray[gradeMultiIndex[0]];
    } else if (name == 'attendDate') {
      this.setData({
        attendDateMultiIndex: value
      });
      var attendDateMultiIndex = this.data.attendDateMultiIndex;
      this.data.box.attendDate = this.getDateFormMultiIndex(attendDateMultiIndex)
    } else if (name == 'lastSuppleDate') {
      this.setData({
        lastSuppleDateMultiIndex: value
      });
      var lastSuppleDateMultiIndex = this.data.lastSuppleDateMultiIndex;
      this.data.box.lastSuppleDate = this.getDateFormMultiIndex(lastSuppleDateMultiIndex)
    }

  },
  getDateFormMultiIndex: function(multiIndex) {
    var dateMultiArray = this.data.dateMultiArray;
    return '' + dateMultiArray[0][multiIndex[0]].substr(0, 4) + dateMultiArray[1][multiIndex[1]].substr(0, 2) + dateMultiArray[2][multiIndex[2]].substr(0, 2) + dateMultiArray[3][multiIndex[3]] + dateMultiArray[4][multiIndex[4]] + dateMultiArray[5][multiIndex[5]]
  },

  editSubmit: function(e) {
    console.log(this.data.box)
    var self = this;
    var box = this.data.box;
    if (self.checkInput(box)) {
      wx.showModal({
        title: '请确认信息',
        content: "盒子编号:" + box.boxId,
        success: function(res) {
          if (res.confirm) {
            console.log('用户点击确定');
            self.addBox(self, box);
            //调用接口
          } else if (res.cancel) {
            console.log('用户点击取消');
          }
        }
      })
    } else {
      wx.showModal({
        content: '请填写全部目录信息',
        showCancel: false
      })
    }
  },

  checkInput: function(box) {
    console.log(box)
    if (box.boxId.length < 1) {
      return false;
    } else if (box.room.length < 1) {
      return false;
    } else if (box.sex.length < 1) {
      return false;
    }
    return true;
  },

  addBox: function(self, box) {
    console.log(box);
    wx.showLoading({
      title: '正在载入'
    })
    console.log('url:', app.globalData.serverIp + self.data.interfaceName)
    wx.request({
      url: app.globalData.serverIp + self.data.interfaceName,
      data: {
        containerId: box.containerId,
        boxId: box.boxId,
        room: box.room,
        sex: box.sex,
        grade: box.grade,
        attendDate: box.attendDate,
        lastSuppleDate: box.lastSuppleDate,
        conditionParam: 'boxId'
      },
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        console.log(res.data);
        if (res.data == false) {
          wx.hideLoading();
          wx.showModal({
            title: '错误',
            content: '重复添加，请联系管理员',
            showCancel: false,
            confirmText: '我知道了',
          })
        } else {
          wx.hideLoading();
          wx.navigateBack({})
        }
      },
      fail: function(res) {
        wx.showModal({
          title: '错误',
          content: res.data,
          showCancel: false,
          confirmText: '我知道了',
        })
      }
    })
  },
})