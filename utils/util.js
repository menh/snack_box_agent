var getDayFromDate = function (date) {
  var day = '';
  if (date == null || date.length < 8) {
    return day;
  }
  day += date.substr(4, 2);
  day += '月';
  day += date.substr(6, 2);
  day += '日'
  return day;
}

var getTimeFromDate = function (date) {
  var time = '';
  if (date == null || date.length < 14) {
    return time;
  }
  time += date.substr(8, 2);
  time += ':'
  time += date.substr(10, 2);
  time += ':'
  time += date.substr(12, 2);
  return time;
}

var date2String = function (date) {
  var year = formatNumber(date.getFullYear()); //获取完整的年份(4位,1970-????)
  var month = formatNumber(date.getMonth() + 1); //获取当前月份(0-11,0代表1月)
  var day = formatNumber(date.getDate()); //获取当前日(1-31)
  var hour = formatNumber(date.getHours()); //获取当前小时数(0-23)
  var minutes = formatNumber(date.getMinutes()); //获取当前分钟数(0-59)
  var seconds = formatNumber(date.getSeconds()); //获取当前秒数(0-59)
  return year + month + day + hour + minutes + seconds;
}

var getDateArrayByDate = function (date) {
  var year = date.getFullYear(); //获取完整的年份(4位,1970-????)
  var month = date.getMonth() + 1; //获取当前月份(0-11,0代表1月)
  var day = date.getDate(); //获取当前日(1-31)
  var hour = date.getHours(); //获取当前小时数(0-23)
  var minutes = date.getMinutes(); //获取当前分钟数(0-59)
  var seconds = date.getSeconds(); //获取当前秒数(0-59)

  return [year - 2018, month - 1, day - 1, hour, minutes, seconds]
}

var dateMultiArray = [
  ['2018年', '2019年'],
  ['01月', '02月', '03月', '04月', '05月', '06月', '07月', '08月', '09月', '10月', '11月', '12月'],
  ['01日', '02日', '03日', '04日', '05日', '06日', '07日', '08日', '09日', '10日', '11日', '12日', '13日', '14日', '15日', '16日', '17日', '18日', '19日', '20日', '21日', '22日', '23日', '24日', '25日', '26日', '27日', '28日', '29日', '30日', '31日'],
  ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'],
  ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59'],
  ['00', '01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59']
]

var string2Date = function (date) {
  var year = parseInt(date.substr(0, 4));
  var month = parseInt(date.substr(4, 2)) - 1;
  var day = parseInt(date.substr(6, 2));
  var hour = parseInt(date.substr(8, 2));
  var minutes = parseInt(date.substr(10, 2));
  var seconds = parseInt(date.substr(12, 2));
  return new Date(year, month, day, hour, minutes, seconds);
}


var formatNumber = function (n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}


module.exports = {
  getDayFromDate: getDayFromDate,
  getTimeFromDate: getTimeFromDate,
  date2String: date2String,
  string2Date: string2Date,
  getDateArrayByDate: getDateArrayByDate,
  dateMultiArray: dateMultiArray
}