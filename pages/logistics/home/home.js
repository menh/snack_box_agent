// pages/logistics/home/home.js
const app = getApp()
const util = require('../../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: 'today',
    wholesales: [],
    wholesalesToday: [],
    wholesalesPast: [],
    containerId:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      containerId:app.globalData.containerId
    })
    wx.startPullDownRefresh({});
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () { },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    util.checkAgent(app.globalData.openid);

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
    this.getWholesales();
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

  },
  navigate: function (e) {
    var url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: url
    });
  },
  getWholesales: function () {
    var self = this;

    wx.request({
      url: app.globalData.serverIp + 'selWholesaleOrder.do',
      data: {
        containerId:app.globalData.containerId,
        conditionParam: 'containerId'
      },
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        self.getWholesalesCallback(self, res.data);
        wx.stopPullDownRefresh();
      },
      fail: function (res) {
        console.log("faile");
      }
    })
  },
  getWholesalesCallback: function (self, wholesalesTemp) {
    wholesalesTemp = self.getHadPaidwholesales(wholesalesTemp);
    wholesalesTemp = self.processOrderTime(wholesalesTemp);

    var wholesalesPast = self.getWholesalesPast(wholesalesTemp);
    var wholesalesToday = self.getWholesalesToday(wholesalesTemp);

    var wholesales;
    var type = self.data.type;
    if (type == 'today') {
      wholesales = wholesalesToday;
    } else {
      wholesales = wholesalesPast;
    }
    console.log('wholesalesPast:', wholesalesPast);
    console.log('wholesalesToday:', wholesalesToday);
    console.log('wholesales:', wholesales);

    self.setData({
      wholesales: wholesales,
      wholesalesPast: wholesalesPast,
      wholesalesToday: wholesalesToday,
    })
  },
  getWholesalesPast: function (wholesalesTemp) {
    var wholesalesPast = [];
    for (var i = 0; i < wholesalesTemp.length; i++) {
      var wholesaleOrder = wholesalesTemp[i].wholesaleOrder;
      console.log(wholesaleOrder)
      if (wholesaleOrder.orderTime.substr(0, 8) != util.date2String(new Date()).substr(0, 8)) {
        wholesalesPast.push(wholesalesTemp[i])
      }
    }
    return wholesalesPast;
  },
  getWholesalesToday: function (wholesalesTemp){
    var wholesalesToday = [];
    for (var i = 0; i < wholesalesTemp.length;i++){
      var wholesaleOrder = wholesalesTemp[i].wholesaleOrder;
      console.log(wholesaleOrder)
      if (wholesaleOrder.orderTime.substr(0, 8) == util.date2String(new Date()).substr(0, 8)){
        wholesalesToday.push(wholesalesTemp[i])
      }
    }
    return wholesalesToday;
  },
  processOrderTime: function (wholesaleOrders) {
    for (var i = 0; i < wholesaleOrders.length; i++) {
      var wholesaleOrderItem = wholesaleOrders[i];
      wholesaleOrderItem.wholesaleOrder.orderTimeTime = util.getTimeFromDate(wholesaleOrderItem.wholesaleOrder.orderTime);
      wholesaleOrderItem.wholesaleOrder.orderTimeDay = util.getDayFromDate(wholesaleOrderItem.wholesaleOrder.orderTime);
    }
    return wholesaleOrders;
  },

  getHadPaidwholesales: function (wholesales) {

    var wholesalesTemp = [];
    for (var i = 0; i < wholesales.length; i++) {
      var wholesaleItem = wholesales[i];
      if (wholesaleItem.wholesaleOrder.orderStatus != '未支付') {
        wholesalesTemp.push(wholesaleItem);
      }
    }
    return wholesalesTemp.reverse();
  },

  callMe: function (e) {
    var phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone
    })
  },

  navigate: function (e) {
    var url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: url
    });
  },


  changeType: function (e) {
    let type = e.currentTarget.dataset.type;

    var wholesales;
    if (type == 'today') {
      wholesales = this.data.wholesalesToday;
    } else {
      wholesales = this.data.wholesalesPast;
    }

    this.setData({
      type: type,
      wholesales: wholesales
    });
  }
})