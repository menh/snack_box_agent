// pages/box/boxDetail/boxDetail.js
const app = getApp()
const util = require('../../../utils/util.js')

Page({

  /**
   * 页面的初始数据
   */
  data: {
    box: {},
    orders: [],
    structs: [],
    records: [],
    category: 'orders',
    visitDateIndex: [0, 0, 0, 0, 0, 0],
    dateMultiArray: util.dateMultiArray,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var boxId = options.boxId;
    this.data.box.boxId = boxId;
    // this.data.box.boxId = '000000';
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
    wx.startPullDownRefresh({});
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
    //盒子信息与本期订单
    this.getBox(this.data.box.boxId);
    //本期库存
    this.getCurrentInventory(this.data.box.boxId);
    //补货记录
    this.getReplenishmentRecord(this.data.box.boxId);
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


  getCurrentInventory: function (boxId) {
    var self = this;
    wx.request({
      url: app.globalData.serverIp + 'GetBoxRemainGoodStructDetail.do',
      data: {
        boxId: boxId
      },
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        console.log('RemainGoodStructDetail:', res.data)
        self.getBoxRemainGoodStructDetailCallback(self, res.data);
        wx.stopPullDownRefresh();
      },
      fail: function (res) {
        wx.showModal({
          title: '错误',
          content: res.data,
          showCancel: false,
          confirmText: '我知道了',
        })
      }
    })

  },

  getBoxRemainGoodStructDetailCallback: function (self, category) {
    var structs = [];
    structs = self.getStructsForCategory(category); //筛选有用的商品
    structs = self.sortStructs(structs); //排序
    console.log('structs:', structs);
    self.setData({
      structs: structs
    })
  },

  getStructsForCategory: function (category) {
    var structs = [];
    for (var i = 0; i < category.length; i++) {
      var item = category[i].categoryItem;
      for (var j = 0; j < item.length; j++) {
        var good = item[j];
        if (parseInt(good.initGoodNum) != 0 || parseInt(good.sellGoodNum) != 0) {
          structs.push(good);
        }
      }
    }
    return structs;
  },

  sortStructs: function (structs) {

    var compare = function (order1, order2) { //比较函数
      var remainGoodNum1 = parseInt(order1.remainGoodNum);
      var remainGoodNum2 = parseInt(order2.remainGoodNum);
      if (remainGoodNum1 == 0) {
        return 1
      } else if (remainGoodNum2 == 0) {
        return -1
      } else if (remainGoodNum1 > remainGoodNum2) {
        return -1;
      } else if (remainGoodNum1 < remainGoodNum2) {
        return 1;
      } else {
        return 0;
      }
    }
    return structs.sort(compare);
  },

  getReplenishmentRecord: function (boxId) {
    var self = this;
    wx.request({
      url: app.globalData.serverIp + 'SelBoxSuplyLogByBoxId.do',
      data: {
        boxId: boxId
      },
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        self.getReplenishmentRecordCallback(self, res.data);
        wx.stopPullDownRefresh();
      },
      fail: function (res) {
        wx.showModal({
          title: '错误',
          content: res.data,
          showCancel: false,
          confirmText: '我知道了',
        })
      }
    })

  },


  getReplenishmentRecordCallback: function (self, records) {
    for (var i = 0; i < records.length; i++) {
      var item = records[i];
      item.placeTimeDay = util.getDayFromDate(item.placeTime);
      item.placeTimeTime = util.getTimeFromDate(item.placeTime);
      item.changeTimeDay = util.getDayFromDate(item.changeTime);
      item.changeTimeTime = util.getTimeFromDate(item.changeTime);
    }
    console.log('records:', records)
    self.setData({
      records: records
    })
  },

  getBox: function (boxId) {
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
      success: function (res) {
        console.log('box:', res.data)
        self.getBoxCallback(self, res.data[0]);
        wx.stopPullDownRefresh();
      },
      fail: function (res) {
        wx.showModal({
          title: '错误',
          content: res.data,
          showCancel: false,
          confirmText: '我知道了',
        })
      }
    })

  },

  getBoxCallback: function (self, box) {
    box = self.processDateForBox(box); //对时间进行处理
    box = self.processDataForBox(box); //对数据进行处理
    self.setData({ //更新box，及其显示模式
      box: box
    })

    //本期订单
    var now = util.date2String(new Date());
    self.getOneBoxOrders(self, box.boxId, box.lastSuppleDate, now);
  },


  getOneBoxOrders: function (self, boxId, beginDate, endDate) {
    wx.request({
      url: app.globalData.serverIp + 'GetBoxSnackOrderBetweenDate.do',
      data: {
        boxId: boxId,
        beginDate: beginDate,
        endDate: endDate
      },
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        console.log('orders:', res.data);
        self.getOneBoxOrdersCallback(self, res.data.reverse());
      },
      fail: function (res) {
        wx.showModal({
          title: '错误',
          content: res.data,
          showCancel: false,
          confirmText: '我知道了',
        })
      }
    })
  },

  getOneBoxOrdersCallback: function (self, orders) {
    orders = self.processDateForOrders(orders); //对时间进行处理
    orders = self.processDataForOrders(orders); //对时间进行处理
    self.setData({ //更新box，及其显示模式
      orders: orders
    })
  },

  processDateForOrders: function (orders) {
    var temp = orders;
    for (var i = 0; i < orders.length; i++) {
      temp[i].orderDateDay = util.getDayFromDate(temp[i].orderTime);
      temp[i].orderDateTime = util.getTimeFromDate(temp[i].orderTime).substr(0, 5);
    }
    return temp;
  },
  processDataForOrders: function (orders) {
    var temp = orders;
    for (var i = 0; i < orders.length; i++) {
      if (temp[i].openid != undefined || temp[i].openid != null) {
        temp[i].openid = '**' + temp[i].openid.substr(temp[i].openid.length - 6);
      }
    }
    return temp;
  },

  processDateForBox: function (box) { //为盒子处理时间
    var temp = box;
    temp.attendDateDay = util.getDayFromDate(temp.attendDate);
    temp.attendDateTime = util.getTimeFromDate(temp.attendDate);
    temp.lastSuppleDateDay = util.getDayFromDate(temp.lastSuppleDate);
    temp.lastSuppleDateTime = util.getTimeFromDate(temp.lastSuppleDate);
    temp.lastPurchaseDateDay = util.getDayFromDate(temp.lastPurchaseDate);
    temp.lastPurchaseDateTime = util.getTimeFromDate(temp.lastPurchaseDate);
    temp.visitDateDay = util.getDayFromDate(temp.visitDate);
    temp.visitDateTime = util.getTimeFromDate(temp.visitDate);
    return temp;
  },
  processDataForBox: function (box) { //处理剩余商品
    var temp = box;
    temp.residualNum = temp.goodsNum - temp.sellNum;
    return temp;
  },
  tapCategory: function (e) {
    let category = e.currentTarget.dataset.category;
    this.setData({
      category: category
    });
  },
  tapDeleteRecord: function (e) {
    var self = this;
    var boxSuplyLogId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '是否删除',
      content: '你确定要删除该补货记录吗',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定');
          self.delRecord(boxSuplyLogId);

        } else if (res.cancel) {
          console.log('用户点击取消');
        }
      }
    })
  },
  delRecord: function (boxSuplyLogId) {
    var self = this;
    wx.showLoading({
      title: '',
    });
    wx.request({
      url: app.globalData.serverIp + 'DelBoxSuplyLogByBoxSuplyLogId.do',
      data: {
        boxSuplyLogId: boxSuplyLogId
      },
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        wx.hideLoading();
        wx.startPullDownRefresh({})
        wx.showToast({
          title: '删除成功'
        })
      },
      fail: function (res) {
        wx.showModal({
          title: '错误',
          content: res.data,
          showCancel: false,
          confirmText: '我知道了',
        })
      }
    })
  },


  tapDelBox: function (e) {
    var self = this;
    var boxId = this.data.box.boxId;

    wx.showModal({
      title: '您确定要删除"' + boxId + '"吗',
      content: '该操作无法撤回',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定');
          self.delBox(self, boxId)
        } else if (res.cancel) {
          console.log('用户点击取消');
        }
      }
    })


  },

  delBox: function (self, boxId) {
    wx.showLoading({
      title: '',
    });
    wx.request({
      url: app.globalData.serverIp + 'DelBox.do',
      data: {
        boxId: boxId,
      },
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        wx.hideLoading();
        wx.navigateBack({});
      },
      fail: function (res) { }
    })
  },

  navigate: function (e) {
    var url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: url
    });
  },

  suplyBox: function (e) {
    var self = this;
    var boxId = this.data.box.boxId;
    var suplyDate = util.date2String(new Date());
    console.log('boxId:', boxId);
    console.log('suplyDate', suplyDate);
    wx.showModal({
      title: '验证',
      content: '确定补货吗',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定');
          wx.showLoading({
            title: '',
          });
          wx.request({
            url: app.globalData.serverIp + 'SuplyBox.do',
            data: {
              boxId: boxId,
              suplyDate: suplyDate
            },
            method: 'POST',
            header: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            success: function (res) {
              wx.hideLoading();
              wx.startPullDownRefresh({})
              wx.showToast({
                title: '刷新成功'
              })
            },
            fail: function (res) {
              console.log("faile");
            }
          })
          //调用删除接口
          //刷新cate
        } else if (res.cancel) {
          console.log('用户点击取消');
        }
      }
    })
  },

  setNowDate: function (e) {
    console.log('now:', util.getDateArrayByDate(new Date()))
    this.setData({
      visitDateIndex: util.getDateArrayByDate(new Date())
    })

  },


  changeVisitDate: function (e) {
    var self = this;
    var value = e.detail.value;
    var dateMultiArray = this.data.dateMultiArray;
    var visitDate = dateMultiArray[0][value[0]].substr(0, 4) + dateMultiArray[1][value[1]].substr(0, 2) + dateMultiArray[2][value[2]].substr(0, 2) + dateMultiArray[3][value[3]] + dateMultiArray[4][value[4]] + dateMultiArray[5][value[5]];
    var boxId = this.data.box.boxId;

    wx.showModal({
      title: '确认刷新回访时间',
      content: '时间:' + dateMultiArray[0][value[0]] + dateMultiArray[1][value[1]] + dateMultiArray[2][value[2]] + ' ' + dateMultiArray[3][value[3]] + ':' + dateMultiArray[4][value[4]] + ':' + dateMultiArray[5][value[5]],
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定');
          self.updVisitDate(self, boxId, visitDate);
        } else if (res.cancel) {
          console.log('用户点击取消');
        }
      }
    })
  },

  updVisitDate: function (self, boxId, visitDate) {
    console.log('boxId', boxId);
    console.log('visitDate', visitDate);
    wx.showLoading({
      title: '',
    })
    wx.request({
      url: app.globalData.serverIp + 'visitBox.do',
      data: {
        boxId: boxId,
        visitDate: visitDate,
      },
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        console.log(res.data);
        wx.hideLoading();
        wx.startPullDownRefresh({})
      },
      fail: function (res) {

      }
    })
  },


  call: function (e) {
    var self = this;
    wx.showLoading({
      title: '',
    })
    wx.request({
      url: app.globalData.serverIp + 'selApplyBoxData.do',
      data: {
        boxId: this.data.box.boxId,
        conditionParam: 'boxId'
      },
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        console.log('apply:', res.data);
        wx.hideLoading();
        self.callCallback(res.data);
      },
      fail: function (res) {

      }
    })
  },
  callCallback: function (applys) {
    if(applys.length == 0){
      wx.showToast({
        icon:'none',
        title: '找不到联系方式',
      })
      return
    }
    var apply = applys[applys.length - 1];
    var name = apply.name;
    var phone = apply.phone;
    wx.showModal({
      title: '申请人',
      content: '姓名:' + name + '\n电话:' + phone,
      confirmText: '呼叫',
      success: function (res) {
        if (res.confirm) {
          console.log('用户点击确定');
          wx.makePhoneCall({
            phoneNumber: phone
          })
        } else if (res.cancel) {
          console.log('用户点击取消');
        }
      }
    })
    console.log('apply:', apply)
  },
})