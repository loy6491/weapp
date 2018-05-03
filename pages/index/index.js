const util = require('../../utils/util.js')
const app = getApp()
const url = 'http://invite.m960.cn/tb/'

Page({
  onShareAppMessage: function (res) {
    console.log(res)
    return {
      title: '注册领取TB币',
      path: '/pages/index/index?code=' + this.data.inviteCode,
      success: function (res) {
        console.log(res)
      },
      fail: function (res) {
        console.log(res)
      }
    }
  },
  data: {
    step: 0,
    phone: '',
    code: '',
    invitor: '',
    focus: false,
    codeDisable: false,
    regionIndex: 1,
    balance: 0,
    inviteCode: 'xxx',
    regionList: util.regionList,
    countDown: -1
  },
  bindRegionChange: function (event) {
    this.setData({
      regionIndex: event.detail.value
    })
  },
  onInput: function (event) {
    this.setData({
      phone: event.detail.value
    })
  },
  onCodeInput: function (event) {
    this.setData({
      code: event.detail.value
    })
    if (event.detail.value.length === 4) {
      this.setData({
        focus: false
      })
      this.submit()
    }
  },
  shareInviteCode: function () {
    wx.navigateTo({
      url: '../tg/tg'
    })
  },
  copyInviteCode: function () {
    wx.setClipboardData({
      data: this.data.inviteCode,
      success: function(res) {
        wx.getClipboardData({
          success: function(res) {
            wx.showToast({title: '已复制'})
          }
        })
      }
    })
  },
  count: function () {
    var vm = this
    setTimeout(function () {
      vm.setData({
        countDown: vm.data.countDown - 1
      })
      if (vm.countDown > 0) {
        vm.count()
      }
    }, 1000)
  },
  onFocus: function () {
    this.setData({
      focus: true
    })
  },
  getCode: function () {
    if (!this.data.phone) {
      return wx.showToast({
        icon: 'none',
        title: '请输入手机号码'
      })
    }
    wx.showLoading()
    var vm = this
    setTimeout(function () {
      wx.hideLoading()
      vm.setData({
        step: 2,
        focus: true,
        countDown: 60
      })
      vm.count()
    }, 1000)
  },
  submit: function () {
    wx.showLoading()
    var vm = this
    vm.setData({
      codeDisable: true
    })
    setTimeout(function () {
      wx.hideLoading()
      if (0) {
        wx.showToast({
          icon: 'none',
          title: '验证码错误'
        })
        return vm.setData({
          codeDisable: false
        })
      }
      vm.setData({
        step: 3
      })
    }, 1000)
  },
  openRule: function () {
    wx.navigateTo({
      url: '../rule/rule'
    })
  },
  onLoad: function (options) {
    var vm = this
    if (options.code) {
      this.setData({
        invitor: options.code
      })
    }
    wx.request({
      url: url + 'profile',
      method: 'POST',
      dataType: 'json',
      success: function (response) {
        var res = response.data
        console.log(res)
        if (res.code) {
          vm.setData({
            step: 1
          })
        } else {
          vm.setData({
            step: 3,
            inviteCode: res.data.invator,
            balance: 500,
            list: [],
            list2: []
          })
        }
      },
      fail: function (res) {
        vm.setData({
          step: 1
        })
      }
    })
  }
})
