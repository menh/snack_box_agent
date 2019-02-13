// pages/logistics/orderSure/orderSure.js
const app = getApp()
const util = require('../../../utils/util.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cates: [],
    price: 0,
    mark: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var price = options.price;
    this.setData({
      cates: app.globalData.orderSureCates,
      price: price
    })
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
    console.log('cates:', this.data.cates)
    console.log('price:', this.data.price)
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

  editInputChange: function(e) {
    var value = e.detail.value;
    var name = e.currentTarget.dataset.name;
    if (name == 'mark') {
      this.data.mark = value;
    }
  },
  submit: function(e) {
    var self = this;
    wx.showNavigationBarLoading();
    wx.showLoading({
      title: '',
    })

    var body = '进货';
    var mark = this.data.mark;
    var orderDetail = this.getDetailByCates(self.data.cates);
    var containerId = app.globalData.containerId;
    var saleType = 'wholesale';
    var scheduledTime = util.date2String(new Date());

    console.log('openId:', app.globalData.openid);
    console.log('appId:', app.globalData.appid);
    console.log('mchId:', app.globalData.mchId);
    console.log('body:', body);
    console.log('mark:', mark);
    console.log('orderDetail:', orderDetail);
    console.log('saleType:', saleType);
    console.log('containerId:', containerId);
    console.log('scheduledTime:', scheduledTime);

    wx.request({
      url: app.globalData.serverIp + 'getPayParamers.do',
      data: {
        openId: app.globalData.openid,
        appId: app.globalData.appid,
        mchId: app.globalData.mchId,
        body: body,
        mark: mark,
        orderDetail: orderDetail,
        saleType: saleType,
        containerId: containerId,
        scheduledTime: scheduledTime
      },
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        console.log(res);
        if (res.statusCode == 200) {
          wx.hideNavigationBarLoading();
          wx.hideLoading();
          self.toPay(res.data);
        } else {
          wx.hideNavigationBarLoading();
          wx.hideLoading();
          wx.showToast({
            title: '' + res.data,
            icon: 'none'
          })
        }
      },
      fail: function(res) {
        wx.hideNavigationBarLoading();
        wx.hideLoading();
        wx.showToast({
          title: '' + res.data,
          icon: 'none'
        })
      }
    });

  },


  toPay: function (args) {
    console.log(args)
    const self = this;
    wx.requestPayment({
      'timeStamp': args.timeStamp,
      'nonceStr': args.nonceStr,
      'package': args.package,
      'signType': 'MD5',
      'paySign': args.paySign,
      'success': function (res) {
        wx.showModal({
          title: '下单成功',
          content: "稍后将会有工作人员与您确认配送信息",
          showCancel: false,
          confirmText: '返回主页面',
          success: function (res) {
            wx.navigateBack({
              delta: 2
            })
          }
        })
      },
      'fail': function (res) { },
      'complete': function (res) { }
    })
  },


  getDetailByCates: function(cates) {
    var detail = '';
    for (var i = 0; i < cates.length; i++) {
      var item = cates[i].good;
      for (var j = 0; j < item.length; j++) {
        var goodItem = item[j];
        if (goodItem.commodityNum > 0) {
          detail += 'goodId:' + goodItem.goodId + '&num:' + goodItem.commodityNum + '|'
        }
      }
    }
    detail = detail.substr(0, detail.length - 1);
    console.log(detail);
    return detail;
  },


})