// pages/bill/home/home.js
const app = getApp()
const util = require('../../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderType: 'today',
    info: {
      amount: 0,
      boxNum: 0
    },
    sortOrders: 'order',

    orders: [],
    ordersGood: [],
    ordersBox: [],


    bills: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    wx.startPullDownRefresh({})
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
  onPullDownRefresh: function () {
    this.getOrders();
    this.getBills();
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

  getBills: function () {
    var self = this;
    wx.request({
      url: app.globalData.serverIp + 'selContainerSaleController.do',
      data: {
        containerId: app.globalData.containerId,
        conditionParam:'containerId'
      },
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        // console.log(res.data)
        self.getBillsCallback(res.data.reverse());
        wx.stopPullDownRefresh();
      },
      fail: function (res) {
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


  getBillsCallback: function (bills) {
    bills = this.setServiceChargeOfBills(bills);
    bills = this.setDayOfBills(bills);
    console.log('bills:', bills)
    this.setData({
      bills: bills,
    })
  },

  setDayOfBills: function (bills) {
    for (var i = 0; i < bills.length; i++) {
      var bill = bills[i];
      var recordDate = util.string2Date(bill.recordDate);
      var date = new Date(recordDate);
      date.setDate(recordDate.getDate() - 1);
      bill.recordDateDay = util.getDayFromDate(util.date2String(date))
    }
    return bills;
  },
  setServiceChargeOfBills: function (bills) {
    for (var i = 0; i < bills.length; i++) {
      var bill = bills[i];
      bill.serviceCharge = (parseInt(bill.dayTrd * 100) - parseInt(bill.toCash * 100)) / 100;
    }
    return bills;
  },


  getOrders: function () {
    var beginDate = util.date2String(new Date).substr(0, 8) + '000000';
    var endDate = util.date2String(new Date);
    // var beginDate = '20190302000000';
    // var endDate = '20190303000000';
    var self = this;
    wx.request({
      url: app.globalData.serverIp + 'selContainerSnackOrderBetweenDate.do',
      data: {
        beginDate: beginDate,
        endDate: endDate,
        containerId: app.globalData.containerId
      },
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        // console.log(res.data)
        self.getOrdersCallback(res.data.reverse());
        wx.stopPullDownRefresh();
      },
      fail: function (res) {
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

  getOrdersCallback: function(orders) {
    console.log('orders:', orders)
    orders = this.priceAdjustment(orders);
    orders = this.processDateForOrders(orders);
    orders = this.processOpenidForOrders(orders);
    var ordersGood = this.getGoodFromOrders(orders);
    var ordersBox = this.getBoxFromOrders(orders);
    var info = this.getInfoFromBox(ordersBox);
    this.setData({
      orders: orders,
      ordersGood: ordersGood,
      ordersBox: ordersBox,
      info: info
    })
    console.log('orders:', orders)
    console.log('ordersGood:', ordersGood)
    console.log('ordersBox:', ordersBox)
  },

  getInfoFromBox: function(ordersBox) {
    var info = {
      amount: 0,
      boxNum: 0
    };
    for (var i = 0; i < ordersBox.length; i++) {
      info.amount += ordersBox[i].amount;
    }
    info.boxNum = ordersBox.length;

    return info
  },
  processDateForOrders: function(orders) {
    var temp = orders;
    for (var i = 0; i < orders.length; i++) {
      temp[i].orderDateDay = util.getDayFromDate(temp[i].orderTime);
      temp[i].orderDateTime = util.getTimeFromDate(temp[i].orderTime).substr(0, 5);
    }
    return temp;
  },
  processOpenidForOrders: function(orders) {
    var temp = orders;
    for (var i = 0; i < orders.length; i++) {
      if (temp[i].openid != undefined || temp[i].openid != null) {
        temp[i].openidCut = '**' + temp[i].openid.substr(temp[i].openid.length - 6);
      }
    }
    return temp;
  },
  //将good价格*100
  priceAdjustment: function(orders) {
    for (var i = 0; i < orders.length; i++) {
      var order = orders[i];
      order.price *= 100;
    }
    return orders;
  },
  getGoodFromOrders: function(orders) {

    var ordersGood = [];
    var ordersGoodMap = new Map();
    for (var i = 0; i < orders.length; i++) {
      var order = orders[i];
      if (ordersGoodMap.has(order.goodId)) {
        ordersGoodMap.get(order.goodId).sum++;
      } else {
        ordersGoodMap.set(order.goodId, {
          goodId: order.goodId,
          goodPic: order.goodPic,
          goodUnit: order.goodUnit,
          goodName: order.goodName,
          price: order.price,
          sum: 1
        })
      }
    }

    for (var order of ordersGoodMap) {
      ordersGood.push(order[1]);
    }

    return ordersGood.sort(function(order1, order2) {
      if (order1.sum > order2.sum) {
        return -1;
      } else if (order1.sum < order2.sum) {
        return 1;
      } else {
        return 0;
      }
    })
  },
  getBoxFromOrders: function(orders) {


    var ordersBox = [];
    var ordersBoxMap = new Map();

    for (var i = 0; i < orders.length; i++) {
      var order = orders[i];

      if (ordersBoxMap.has(order.boxBsn)) {
        ordersBoxMap.get(order.boxBsn).sum++;
        ordersBoxMap.get(order.boxBsn).amount += order.price;
      } else {
        ordersBoxMap.set(order.boxBsn, {
          boxBsn: order.boxBsn,
          amount: order.price,
          sum: 1
        })
      }
    }

    for (var order of ordersBoxMap) {
      ordersBox.push(order[1]);
    }

    return ordersBox.sort(function(order1, order2) {
      if (order1.amount > order2.amount) {
        return -1;
      } else if (order1.amount < order2.amount) {
        return 1;
      } else {
        return 0;
      }
    })


    return ordersBox
  },

  tapSort: function(e) {
    var sortOrders = e.currentTarget.dataset.value;
    this.setData({
      sortOrders: sortOrders
    });
  },
  tapCategory: function(e) {
    let category = e.currentTarget.dataset.category;
    this.setData({
      orderType: category
    });
  },



  navigate: function (e) {
    var url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: url
    });
  },
})