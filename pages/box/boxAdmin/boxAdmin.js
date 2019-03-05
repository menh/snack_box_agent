// pages/box/boxAdmin/boxAdmin.js
const app = getApp()
const util = require('../../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    boxType: 'all',
    boxsPending: [],
    pendingNum: 0,


    containerId: '',
    boxs: [],
    sortBox: 'box',
    sortBoxFlag: 0,
    info: {
      boxNum: 0,
      residualNum: 0,
      goodsNum: 0,
      sellRadio: 0
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.startPullDownRefresh({});
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
    util.checkAgent(app.globalData.openid);
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
    this.setData({
      containerId: app.globalData.containerId
    })
    this.getBoxs();
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

  getBoxs: function() {
    var self = this;
    wx.request({
      url: app.globalData.serverIp + 'selBox.do',
      data: {
        containerId: app.globalData.containerId,
        conditionParam: 'containerId'
      },
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        self.getBoxsCallback(self, res.data);
        wx.stopPullDownRefresh();
      },
      fail: function(res) {
        wx.showModal({
          title: '错误',
          content: res.data,
          showCancel: false,
          confirmText: '我知道了',
        })
        wx.stopPullDownRefresh();
      }
    })

  },

  getBoxsCallback: function(self, boxs) {
    boxs = self.processDateForBoxs(boxs); //对时间进行处理
    boxs = self.processDataForBoxs(boxs); //对数据进行处理

    // boxs = self.test(boxs);//测试

    self.setData({
      boxs: boxs
    })
    self.setInfoByBoxs(self, boxs)
    self.setBoxsBySort(self.data.sortBox, self.data.sortBoxFlag)
    console.log('boxs:', boxs)

    var boxsPending = self.getPendingBoxsFromBoxs(this.data.boxs);
    self.setData({
      boxsPending: boxsPending,
      pendingNum:boxsPending.length
    })

    console.log('boxsPending:', boxsPending)
  },
  // test: function (boxs) {
  //   for (var i = 0; i < 5; i++) {
  //     boxs[i].state = '申请补货'
  //   }
  //   for (var i = 10; i < 15; i++) {
  //     boxs[i].state = '申请补货已确认'
  //   }
  //   for (var i = 20; i < 25; i++) {
  //     boxs[i].state = '建议补货'
  //   }
  //   for (var i = 30; i < 35; i++) {
  //     boxs[i].state = '沉默'
  //   }
  //   return boxs;
  // },
  getPendingBoxsFromBoxs: function(boxs) {
    var boxsPending = [];
    for (var i = 0; i < boxs.length; i++) {
      if (boxs[i].state != undefined && boxs[i].state != null && boxs[i].state != '正常' && boxs[i].state != '申请补货') {
        boxsPending.push(boxs[i]);
      }
    }

    return boxsPending.sort(function(order1, order2) {
      if (order1.state != order2.state && order1.state == '申请补货已确认') {
        return -1;
      } else if (order1.state != order2.state && order2.state == '申请补货已确认') {
        return 1;
      } else if (order1.state != order2.state && order1.state == '建议补货') {
        return -1;
      } else if (order1.state != order2.state && order2.state == '建议补货') {
        return 1;
      } else if (order1.state != order2.state && order1.state == '沉默盒子') {
        return -1;
      } else if (order1.state != order2.state && order2.state == '沉默盒子') {
        return 1;
      }  else if (order1.room > order2.room) {
        return 1;
      } else if (order1.room < order2.room) {
        return -1;
      } else {
        return 0;
      }
    });
  },
  setInfoByBoxs: function(self, boxs) {
    var info = {
      boxNum: boxs.length,
      residualNum: 0,
      goodsNum: 0,
      sellRadio: 0
    }
    for (var i = 0; i < boxs.length; i++) {
      info.residualNum += boxs[i].residualNum;
      info.goodsNum += parseInt(boxs[i].goodsNum);
    }
    info.sellRadio = ('' + ((info.goodsNum - info.residualNum) / info.goodsNum)).substr(0, 4)
    self.setData({
      info: info
    })
  },


  sortBoxsById: function(boxs) { //为盒子处理时间
    var compare = function(order1, order2) { //比较函数
      if (parseInt(order1.boxId) < parseInt(order2.boxId)) {
        return -1;
      } else if (parseInt(order1.boxId) > parseInt(order2.boxId)) {
        return 1;
      } else {
        return 0;
      }
    }
    return boxs.sort(compare);
  },

  processDateForBoxs: function(boxs) { //为盒子处理时间
    for (var i = 0; i < boxs.length; i++) {
      var temp = boxs[i];
      temp.attendDateDay = util.getDayFromDate(temp.attendDate);
      temp.attendDateTime = util.getTimeFromDate(temp.attendDate);
      temp.lastSuppleDateDay = util.getDayFromDate(temp.lastSuppleDate);
      temp.lastSuppleDateTime = util.getTimeFromDate(temp.lastSuppleDate);
      temp.lastPurchaseDateDay = util.getDayFromDate(temp.lastPurchaseDate);
      temp.lastPurchaseDateTime = util.getTimeFromDate(temp.lastPurchaseDate);
      temp.visitDateDay = util.getDayFromDate(temp.visitDate);
      temp.visitDateTime = util.getTimeFromDate(temp.visitDate);
    }
    return boxs;
  },
  processDataForBoxs: function(boxs) { //处理剩余商品
    for (var i = 0; i < boxs.length; i++) {
      var temp = boxs[i];
      if (temp.sellNum == "null" || temp.sellNum == null) {
        temp.residualNum = parseInt(temp.goodsNum);
      } else {
        temp.residualNum = parseInt(temp.goodsNum) - parseInt(temp.sellNum);
      }
    }
    return boxs;
  },

  tapCategory: function (e) {
    let category = e.currentTarget.dataset.category;
    this.setData({
      boxType: category
    });
  },
  tapSort: function(e) {
    let sortBox = e.currentTarget.dataset.sort;
    if (sortBox == this.data.sortBox) {
      this.data.sortBoxFlag = (this.data.sortBoxFlag == 0 ? 1 : 0);
    }
    this.setBoxsBySort(sortBox, this.data.sortBoxFlag);
    this.setData({
      sortBox: sortBox
    });
  },
  setBoxsBySort: function(sortBox, sortBoxFlag) {
    var compare;
    if (sortBox == 'box') {
      compare = function(order1, order2) { //比较函数
        if (parseInt(order1.boxId) < parseInt(order2.boxId)) {
          return -1;
        } else if (parseInt(order1.boxId) > parseInt(order2.boxId)) {
          return 1;
        } else {
          return 0;
        }
      }
    } else if (sortBox == 'room') {
      compare = function(order1, order2) { //比较函数
        if (order1.room < order2.room) {
          return 1;
        } else if (order1.room > order2.room) {
          return -1;
        } else {
          return 0;
        }
      }
    } else if (sortBox == 'proportion') {
      compare = function(order1, order2) { //比较函数
        if (order2.sellRatio == 'null' || parseFloat(order1.sellRatio) < parseFloat(order2.sellRatio)) {
          return 1;
        } else if (order1.sellRatio == 'null' || parseFloat(order1.sellRatio) > parseFloat(order2.sellRatio)) {
          return -1;
        } else {
          return 0;
        }
      }
    } else if (sortBox == 'surplus') {
      compare = function(order1, order2) { //比较函数
        if (order1.residualNum < order2.residualNum) {
          return -1;
        } else if (order1.residualNum > order2.residualNum) {
          return 1;
        } else {
          return 0;
        }
      }

    } else if (sortBox == 'time') {
      compare = function(order1, order2) { //比较函数
        if (order2.lastPurchaseDate == '' || order2.lastPurchaseDate == 'null' || parseInt(order1.lastPurchaseDate) > parseInt(order2.lastPurchaseDate)) {
          return 1;
        } else if (order1.lastPurchaseDate == '' || order1.lastPurchaseDate == 'null' || parseInt(order1.lastPurchaseDate) < parseInt(order2.lastPurchaseDate)) {
          return -1;
        } else {
          return 0;
        }
      }
    }
    this.setData({
      boxs: sortBoxFlag == 0 ? this.data.boxs.sort(compare) : this.data.boxs.sort(compare).reverse()
    })

  },

  navigate: function(e) {
    var url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: url
    });
  },
})