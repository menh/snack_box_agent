// pages/box/boxStruct/boxStruct.js

const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    boxId: '',
    category: [],
    toCategory: 'category_0',
    isEdit: false,
    getInterfaceName: '',
    setInterfaceName: '',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var getInterfaceName = options.getInterfaceName;
    var setInterfaceName = options.setInterfaceName;
    var boxId = options.boxId;
    this.setData({
      getInterfaceName: getInterfaceName,
      setInterfaceName: setInterfaceName,
      boxId: boxId
    })
    wx.setNavigationBarTitle({
      title: boxId
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    wx.startPullDownRefresh({});
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
    this.getGoodList();
    this.getMemo();
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

  getMemo: function() {
    if (this.data.getInterfaceName != 'SelNextGoodStructDetail.do'){
      return;
    }
    var self = this;
    var boxId = self.data.boxId;
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
        wx.hideLoading();
        self.getBoxCallback(res.data[0]);
      },
      fail: function(res) {
        wx.hideLoading();
        console.log("faile");
      }
    })
  },

  getBoxCallback: function(box) {
    console.log('box:', box)
    var self = this;
    var self = this;
    if (box.boxId == null || box.boxId.length < 1) {
    } else {
      var state = box.state;
      console.log(state);
      if (state == '申请补货已确认') {
        self.showMemo(box.boxId);
      }
    }
  },

  showMemo: function (boxId) {
    var self = this;
    wx.request({
      url: app.globalData.serverIp + 'selApplyBoxData.do',
      data: {
        boxId: boxId,
        conditionParam: 'boxId'
      },
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        console.log('apply:', res.data);
        self.showMemoCallback(res.data);
      },
      fail: function (res) {

      }
    })
  },
  showMemoCallback: function (applys) {
    if (applys.length == 0) {
      return
    }
    var apply = applys[applys.length - 1];
    var mark = apply.mark;
    wx.showModal({
      title: '补货备注',
      content: mark,
      showCancel:false,
    })
    console.log('apply:', apply)
  },

  getGoodList: function() {
    const self = this;
    wx.request({
      url: app.globalData.serverIp + 'selCategoryGood.do',
      data: {
        categoryType: '零售',
        valid: '显示',
        conditionParam: 'categoryType|valid'
      },
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        console.log(res.data)
        self.getGoodListCallback(self, res.data);
        // wx.stopPullDownRefresh();
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

  getGoodListCallback: function(self, category) {
    category = self.priceAdjustment(category); //价格*100
    self.getStructure(self, category, self.data.boxId, self.data.getInterfaceName);
  },

  priceAdjustment: function(category) {
    var tempCategory = category;
    console.log('hello', tempCategory)
    for (var i = 0; i < tempCategory.length; i++) {
      var item = tempCategory[i].good;
      for (var j = 0; j < item.length; j++) {
        item[j].price *= 100;
      }
    }
    return tempCategory;
  },


  getStructure: function(self, category, boxId, interfaceName) {
    wx.request({
      url: app.globalData.serverIp + interfaceName,
      data: {
        boxId: boxId
      },
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        self.getStructureCallback(self, category, res.data); //处理商品结构数量
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


  getStructureCallback: function(self, category, structs) {
    console.log('structs:', structs)
    //将structs存在map中
    var structsMap = new Map();
    var goodNum = 0;

    for (var i = 0; i < structs.length; i++) {
      structsMap.set(structs[i].goodId, structs[i]);
    }

    //根据map来设置category
    for (var i = 0; i < category.length; i++) {
      var item = category[i].good;
      for (var j = 0; j < item.length; j++) {
        if (structsMap.has(item[j].goodId)) {
          item[j].commodityNum = parseInt(structsMap.get(item[j].goodId).goodNum);
          goodNum += parseInt(structsMap.get(item[j].goodId).goodNum);
        }

      }
    }
    self.setShowByCategory(category)
    console.log('category1:', category)
    self.setData({
      category: category
    })
    wx.setNavigationBarTitle({
      title: self.data.boxId + '(' + goodNum + ')'
    })
    wx.stopPullDownRefresh();
  },

  setShowByCategory: function(category) {
    var tempCategory = category;
    for (var i = 0; i < tempCategory.length; i++) {
      var isShow = false;
      var item = tempCategory[i].good;
      for (var j = 0; j < item.length; j++) {
        if (item[j].commodityNum > 0) {
          item[j].isShow = true;
          isShow = true;
        } else {
          item[j].isShow = false;
        }
      }
      tempCategory[i].isShow = isShow;
    }
  },

  getStructsByCategory: function(category) {
    var detail = '';
    for (var i = 0; i < category.length; i++) {
      var item = category[i].good;
      for (var j = 0; j < item.length; j++) {
        var good = item[j];
        if (good.commodityNum > 0) {
          detail += 'goodId:' + good.goodId + '&num:' + good.commodityNum + '|'
        }
      }
    }
    detail = detail.substr(0, detail.length - 1);
    console.log(detail);
    return detail;
  },

  chooseCategory: function(e) {
    let id = e.currentTarget.dataset.id;
    this.setData({
      toCategory: id,
    })
  },
  subtractGood: function(e) {
    var goodId = e.target.dataset.id;
    var goodItem = this.getGoodById(this.data.category, goodId);
    if (goodItem.commodityNum > 0) {
      goodItem.commodityNum--;
    }
    this.setShowByCategory(this.data.category);
    this.setData({
      category: this.data.category,
    })
  },

  addGood: function(e) {
    var goodId = e.target.dataset.id;
    var goodItem = this.getGoodById(this.data.category, goodId);
    goodItem.commodityNum = goodItem.commodityNum ? goodItem.commodityNum + 1 : 1;
    console.log(goodItem)
    this.setShowByCategory(this.data.category);
    this.setData({
      category: this.data.category,
    })
  },

  getGoodById: function(category, goodId) {
    var tempCategory = category;
    for (var i = 0; i < tempCategory.length; i++) {
      var item = tempCategory[i].good;
      for (var j = 0; j < item.length; j++) {
        if (item[j].goodId == goodId) {
          return item[j];
        }
      }
    }
    return '';
  },


  changeToEdit: function(e) {
    this.setData({
      isEdit: true
    })
    wx.setNavigationBarTitle({
      title: this.data.boxId
    })
  },

  saveCommodityStructure: function(e) {
    var self = this;
    wx.showModal({
      title: '商品结构',
      content: '是否保存',
      success: function(res) {
        if (res.confirm) {
          console.log('用户点击确定');
          self.setStructure(self, self.data.boxId, self.data.category, self.data.setInterfaceName);
        } else if (res.cancel) {
          console.log('用户点击取消');
        }
      }
    })
  },

  setStructure: function(self, boxId, category, interfaceName) {
    var goodStructDetail = self.getStructsByCategory(category);
    console.log("goodStructDetail:", goodStructDetail)
    wx.showLoading({
      title: '',
    })
    wx.request({
      url: app.globalData.serverIp + interfaceName,
      data: {
        boxId: boxId,
        goodStructDetail: goodStructDetail
      },
      method: 'POST',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },

      success: function(res) {
        wx.hideLoading();
        console.log(res.data);
        self.setData({
          isEdit: false,
          category: []
        });
        wx.startPullDownRefresh({})
      },
      fail: function(res) {
        wx.hideLoading();
        wx.showModal({
          title: '错误',
          content: res.data,
          showCancel: false,
          confirmText: '我知道了',
        })
      }
    })
  },

  navigate: function (e) {
    var url = e.currentTarget.dataset.url;
    wx.navigateTo({
      url: url
    });
  },


})