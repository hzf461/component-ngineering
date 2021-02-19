/***
 * wiki:http://wiki.iwgame.tec/display/SJPT/IwRangPickerPro#IwRangPickerPro-API
 * 参数说明: 
 * value	日期	array[moment,moment,dynamicObj]	
 * 默认值 无
 * 
 * className	选择器 className	string	 
 * 默认值 antd-pro\components\pages-components\components\iw-rang-picker-pro\index-iwRangPickerPro
 * 
 * id	id	string	
 * 默认值 无
 * 
 * format	日期对象format字符串	string	
 * 默认值 YYYY/MM/DD HH:mm
 * 
 * selectNum	日期最小单位	string：hour、min、sec	
 * 默认值 min
 * 
 * showTime	是否显示时分秒选择	boolean	
 * 默认值 true
 * 
 * noDynamic	不显示动态时间选项	boolean	
 * 默认值 false
 * 
 * onClik	组件按钮被点击时触发	function(e)	
 * 默认值 无
 * 
 * onChange	日期发生改变时触发	function(array[moment,moment], array[momentString,momentString], dynamicObj)	
 * 默认值 无
 * 
 * onOk	日期选择弹窗点击确定时触发	function(array[moment,moment], array[momentString,momentString], dynamicObj)	
 * 默认值 无
 * 
 * getCalendarContainer	浮层渲染父节点，默认渲染到 body 上	Function(triggerNode)	
 * 默认值 () => document.body
 * 
 * placement	浮层渲染相对于按钮位置 可选 top left right bottom topLeft topRight bottomLeft bottomRight leftTop leftBottom rightTop rightBottom	string	
 * 默认值 bottomLeft
 * 
 * trigger	触发行为，可选 hover/focus/click/contextMenu	string	
 * 默认值 click
 * 
 * isCustom	是否为自定义状态	boolean	
 * 默认值 false
 * 
 * extCustomVal	自定义时间值	string	
 * 默认值 无
 * 
 * extCustomValName	自定义时间值对应显示名	string	
 * 默认值 无
 * 
 * contrast	是否显示对比时间勾选	boolean	
 * 默认值 false
 * 
 * onChangeContrast	对比时间选择回调	function(contrastObj)	
 * 默认值 无
 * 
 * contrastObj	对比时间对象	Object	
 * 默认值 { isContrast: false, time: [] }
 * 
 */


/**
 * 
 * onOk(marr, timearr, dynamicObj,customTime) 事件返回值
 * {
 * marr,//时间moment数组 [moment(),moment()] 
 * timearr,//时间format后的字符串数组 [string,string] 
 * dynamicObj,//动态时间对象{
           time: [],//动态时间相对于今天差值 日为单位
           rangeName: "",//动态时间名 eg：过去12天至过去4天
           isDynamic: false//是否启用了动态时间
       }
 * customTime,//自定义时间对象  { 
     isCustom,是否启用了自定义时间 
     extCustomVal: 当前选中的自定义时间值, 
     extCustomValName: 自定义时间显示名  eg:开服7天 
    }
 * } 
 * 
 * 
 * 
 * 
 * 
 * onChange 事件返回值 同onOk返回值
 * 
 * 
 * 
 * 
 * onChangeContrast 事件返回值 {
 * isContrast: false, //是否启用了对比时间
 * time: [-10,-10],相对时间开始和结束时间 相对于当前已选中时间的开始和结束时间的差值  eg: 动态/静态时间选中的是  2月11号到2月15号 [-10,-10] 代表对比时间是 2月1号到2月5号
 * }
 * 
 */

import React, { PureComponent } from 'react';
import {
  DatePicker,
  Select,
  Button,
  message,
  Icon,
  Popover,
  Divider,
  Tooltip,
  Checkbox,
  Input
} from 'antd';
import moment from 'moment';
import './index.css'
import { cloneDeep } from 'lodash';
import 'moment/locale/zh-cn';
import locale from 'antd/es/date-picker/locale/zh_CN';
import classNames from 'classnames'

let size = "small";
const { RangePicker } = DatePicker;
const { Option, OptGroup } = Select;

let format = "YYYY/MM/DD HH:mm";

function guid() {//生成唯一id

  function S4() {
    return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
  }

  return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
}

let rangesObj = {//快速选择时间范围对象
  '昨天': [moment().subtract(1, 'days').startOf('day'), moment().subtract(1, 'days').endOf('day'), "s"],
  '今天': [moment().startOf('day'), moment().endOf('day'), "s"],
  '上周': [moment().subtract(1, 'week').startOf('week'), moment().subtract(1, 'week').endOf('week'), "s"],
  '本周': [moment().startOf('week'), moment().endOf('day'), "s"],
  '上月': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month'), "s"],
  '本月': [moment().startOf('month'), moment().endOf('day'), "s"],
  '上年': [moment().subtract(1, 'year').startOf('year'), moment().subtract(1, 'year').endOf('year'), "s"],
  '本年': [moment().startOf('year'), moment().endOf('day'), "s"],
  '过去7天': [moment().subtract(7, 'days').startOf('days'), moment().endOf('days'), "m"],
  '过去30天': [moment().subtract(30, 'days').startOf('days'), moment().endOf('days'), "m"],
  // '上线至今': [moment(getStartServerTime()[pid] || '1970/01/01 00:00:00'), moment().endOf('day'), "m"]
};


let snMap = {
  "hour": 1,
  "min": 2,
  "sec": 3
}

function getTimeType(str) {
  if (str.indexOf("HH:mm:ss") != -1) {
    return "sec"
  } else if (str.indexOf("HH:mm") != -1) {
    return "min"
  } else if (str.indexOf("HH") != -1) {
    return "hour"
  } else {
    return "min"
  }
}

let _this = "";

function checkparent(e) {
  let needClose = true;
  if (e.path) {
    for (let i = 0; i < e.path.length; i++) {
      if (e.path[i].className && (typeof e.path[i].className == "string") && (e.path[i].className.indexOf("timeContentMk") != -1)) {
        needClose = false;
      }
    }
  }

  if (_this) {
    _this.setState({
      timeContentShow: !needClose
    })
  }

}

export default class iwRangPickerPro extends PureComponent {
  state = {
    open: false,
    rootId: guid(),
    time0: [0, 0, 0],
    time1: [23, 59, 59],
    timearr: this.props.value && this.props.value.length >= 2 ? [this.props.value[0].format(format), this.props.value[1].format(format)] : [],
    timeType: this.props.format ? getTimeType(this.props.format) : "min",//hour 精确到时；min精确到分；sec精确到秒
    selectNum: this.props.timeType ? (snMap[this.props.timeType + ""] || "min") : 2,
    value: this.props.value || [],
    selectDate: null,
    dynamic: (this.props.value && this.props.value[2] ? this.props.value[2].isDynamic : false),//是否为动态时间
    dynamicObj: (this.props.value && this.props.value[2] ? this.props.value[2] : {
      time: [],
      rangeName: "",
      isDynamic: false
    }),
    containToday: true,
    timeContentShow: false,//是否显示时间选择弹窗
    presetStr: this.props.value && this.props.value[2] && this.props.value[2].rangeName ? this.props.value[2].rangeName : "",//匹配快速选择时显示对应时间段名称
    noDynamic: this.props.noDynamic || false,//是否显示动态时间按钮
    showTime: this.props.showTime,//是否显示时分秒选择
    extCustomVal: this.props.extCustomVal || "",//当前选中的自定义值
    extCustomValName: this.props.extCustomValName || "",//当前选中自定值的显示名
    isCustom: this.props.isCustom,//当前是否使用自定义值
    contrastObj: this.props.contrastObj || { isContrast: false, time: [] },//对比时间对象
    contrastSelectChangeValue: "自定义"//对比时间selectValue
  };
  pickContainer = React.createRef()
  componentDidUpdate = (oldProps, oldState) => {
    if (!(this.props.value && this.props.value.length == 3)) {
      return false;
    } else if (JSON.stringify(this.props.value) == JSON.stringify(oldProps.value) && ((this.props.extCustomValName == oldState.extCustomValName) || (!this.props.extCustomValName == !oldState.extCustomValName))) {
      return false;
    }
    let newPropsValueDynamicObjStr = this.props.value && this.props.value[2] ? JSON.stringify(this.props.value[2]) : "";
    let oldPropsValueDynamicObjStr = oldProps.value && oldProps.value[2] ? JSON.stringify(oldProps.value[2]) : "";
    let noTimeArr = oldProps.value && oldProps.value[2] && oldProps.value[2].time ? false : true;
    let timechange = false;
    let contrastObj = this.props.contrastObj ? this.props.contrastObj : { isContrast: false, }
    if (oldProps.value && oldProps.value[0] && oldProps.value[1]) {
      if (this.props.value[0].isSame(oldProps.value[0]) && this.props.value[1].isSame(oldProps.value[1])) {

      } else {
        timechange = true;
      }

      if (this.state.timearr && this.state.timearr[0] && this.state.timearr[1]) {
        if ((this.state.timearr[0] != this.props.value[0].format(format)) || (this.state.timearr[1] != this.props.value[1].format(format))) {
          timechange = true;
        }
      }

      if (
        // (this.props.extCustomValName != oldState.extCustomValName)
        // ||
        (this.props.extCustomValName != oldProps.extCustomValName)
      ) {
        // timechange = true;
      }
    }

    if ((noTimeArr && oldPropsValueDynamicObjStr != newPropsValueDynamicObjStr) || (timechange)) {
      let stime = "";
      let etime = "";
      let value = this.props.value;
      if (this.props.value[0] && this.props.value[1] && this.props.value[2] && this.props.value[2].time) {
        if ((this.props.value[2].rangeName) && (rangesObj[this.props.value[2].rangeName])) {
          let tagRange = rangesObj[this.props.value[2].rangeName];
          stime = tagRange[0].format(format).toString();
          etime = tagRange[1].format(format).toString();
          stime = moment(stime.split(" ")[0] + " " + this.props.value[0].format(format).toString().split(" ")[1]);
          etime = moment(etime.split(" ")[0] + " " + this.props.value[1].format(format).toString().split(" ")[1]);
        } else {
          stime = moment().subtract(this.props.value[2].time[0], "days").format(format).toString();
          etime = moment().subtract(this.props.value[2].time[1], "days").format(format).toString();
          stime = moment(stime.split(" ")[0] + " " + this.props.value[0].format(format).toString().split(" ")[1]);
          etime = moment(etime.split(" ")[0] + " " + this.props.value[1].format(format).toString().split(" ")[1]);
        }

      }


      let contrastObjValue = (
        (
          contrastObj
          &&
          contrastObj.time
          &&
          contrastObj.time.length == 2
        )
        &&
        (
          value
          &&
          value.length >= 2
        )
      )
        ?
        [moment(cloneDeep(value[0])).subtract(contrastObj.time[0] * -1, "days").startOf("day"), moment(cloneDeep(value[1])).subtract(contrastObj.time[1] * -1, "days").endOf("day")] : [moment().startOf("day"), moment().endOf("day")];


      let datas = this.getContrastObj(contrastObjValue);



      this.setState({
        timearr: [this.props.value[0].format(format), this.props.value[1].format(format)],
        value: this.props.value && this.props.value[2] ? [stime, etime, this.props.value[2] || {}] : (this.props.value || []),
        dynamic: this.props.value[2].isDynamic,//是否为动态时间
        dynamicObj: this.props.value[2],
        presetStr: ((rangesObj[this.props.value[2].rangeName]) ? this.props.value[2].rangeName : (this.props.extCustomValName ? this.props.extCustomValName : "")),
        extCustomVal: this.props.extCustomVal || "",//当前选中的自定义值
        extCustomValName: this.props.extCustomValName || "",//当前选中自定值的显示名
        isCustom: this.props.isCustom,//当前是否使用自定义值
        contrastObj: contrastObj,
        contrastSelectChangeValue: datas.contrastSelectChangeValue
      }, () => {
        if (this.props.value && this.props.value[0] && this.props.value[1] && this.props.value[2]) {
          let tempvalue = this.props.value && this.props.value[2] ? [stime || this.props.value[0], etime || this.props.value[1], this.props.value[2] || {}] : (this.props.value || []);
          this.handlePreset(tempvalue, (this.props.value[2] && (this.props.value[2].time || this.props.value[2].rangeName) ? this.props.value[2].rangeName : (this.state.presetStr || "")));
          this.onChange(tempvalue, [tempvalue[0].format(format), tempvalue[1].format(format)], (this.props.value[2] && (this.props.value[2].time || this.props.value[2].rangeName) ? this.props.value[2].rangeName : ""));
        }

      });
    }
  }

  componentDidMount() {
    if (this.props.value) {
      if (this.props.value[2] && (this.props.value[2].time || this.props.value[2].rangeName)) {

        let newPropsValueDynamicObjStr = this.props.value && this.props.value[2] ? JSON.stringify(this.props.value[2]) : "";
        if (newPropsValueDynamicObjStr) {
          let stime = "";
          let etime = "";
          if (this.props.value[0] && this.props.value[1] && this.props.value[2] && this.props.value[2].time) {
            if ((this.props.value[2].rangeName) && (rangesObj[this.props.value[2].rangeName])) {
              let tagRange = rangesObj[this.props.value[2].rangeName];
              stime = tagRange[0].format(format).toString();
              etime = tagRange[1].format(format).toString();
              stime = moment(stime.split(" ")[0] + " " + this.props.value[0].format(format).toString().split(" ")[1]);
              etime = moment(etime.split(" ")[0] + " " + this.props.value[1].format(format).toString().split(" ")[1]);
            } else {
              stime = moment().startOf("day").subtract(this.props.value[2].time[0], "days").format(format).toString();
              etime = moment().startOf("day").subtract(this.props.value[2].time[1], "days").format(format).toString();
              stime = moment(stime.split(" ")[0] + " " + this.props.value[0].format(format).toString().split(" ")[1]);
              etime = moment(etime.split(" ")[0] + " " + this.props.value[1].format(format).toString().split(" ")[1]);
            }

          }
          this.setState({
            timearr: [this.props.value[0].format(format), this.props.value[1].format(format)],
            value: this.props.value && this.props.value[2] ? [stime, etime, this.props.value[2] || {}] : (this.props.value || []),
            dynamic: this.props.value[2].isDynamic,//是否为动态时间
            dynamicObj: this.props.value[2],
            presetStr: ((rangesObj[this.props.value[2].rangeName]) ? this.props.value[2].rangeName : (this.props.extCustomValName ? this.props.extCustomValName : "")),

          }, () => {
            if (this.props.value && this.props.value[0] && this.props.value[1] && this.props.value[2]) {
              let tempvalue = this.props.value && this.props.value[2] ? [stime || this.props.value[0], etime || this.props.value[1], this.props.value[2] || {}] : (this.props.value || []);
              this.handlePreset(tempvalue, (this.props.value[2] && (this.props.value[2].time || this.props.value[2].rangeName) ? this.props.value[2].rangeName : ""));
              this.onChange(tempvalue, [tempvalue[0].format(format), tempvalue[1].format(format)], (this.props.value[2] && (this.props.value[2].time || this.props.value[2].rangeName) ? this.props.value[2].rangeName : ""));
            }
          });
        }

      } else {

      }

      if ((!this.props.value[2]) || (!this.props.value[2].time)) {
        this.handlePreset(this.props.value, (this.props.value[2] && (this.props.value[2].time || this.props.value[2].rangeName) ? this.props.value[2].rangeName : ""));
        this.onChange(this.props.value, [this.props.value[0].format(format), this.props.value[1].format(format)])
      }
    }
  }

  handlePreset = (dates, timestr) => {
    if ((!dates) || (!dates.length) || (!dates[0]) || (!dates[1])) {
      return "";
    }
    let format = 'YYYY-MM-DD';
    let start = dates.length && dates[0].format(format) && dates[0].format(format).split(" ")[0];
    let end = dates.length && dates[1].format(format) && dates[1].format(format).split(" ")[0];
    let { ranges } = rangesObj;
    let presetStr = "";
    if (timestr) {
      presetStr = timestr
    } else if (this.state.dynamic) {
      for (let k in ranges) {
        if (start === ranges[k][0].format(format).split(" ")[0] && end === ranges[k][1].format(format).split(" ")[0]) {
          presetStr = k;

          break;
        }
      }
      if (presetStr != "今天" && presetStr != "昨天") {
        presetStr = ""
      }
    }

    this.setState({
      presetStr
    });
    return presetStr;
  };
  componentWillUpdate(nextProps, nextState, nextContext) {

  }

  componentWillMount = () => {
    _this = this;

    if (this.props.format) {
      format = this.props.format
    }

    //document.body.addEventListener("click", checkparent)

  }

  componentWillUnmount = () => {
    //document.body.removeEventListener("click", checkparent)
  }


  getRootDom = () => {
    return document.getElementById(this.state.rootId);
  }



  getContrastObj = (marr) => {
    let contrastObj = cloneDeep(this.state.contrastObj);
    let value = this.state.value && this.state.value.length >= 2 ? cloneDeep(this.state.value) : [moment().startOf("day"), moment().endOf("day")];
    let time0 = moment(value[0]).endOf("day");
    let time1 = moment(value[1]).endOf("day");
    let dura0 = new Date(marr[0].endOf("day").format(format)).getTime() - new Date(time0.format(format).toString()).getTime();
    let dura1 = new Date(marr[1].endOf("day").format(format)).getTime() - new Date(time1.format(format).toString()).getTime();
    let tempTime0 = Math.floor(dura0 / 1000 / 60 / 60 / 24);
    let tempTime1 = Math.floor(dura1 / 1000 / 60 / 60 / 24);
    let timeStrArr = [tempTime0, tempTime1];

    contrastObj.time = timeStrArr;



    let lastDaysArr = [];
    let lastYearArr = [];
    let valueDiffDay = Math.floor((new Date(time0.format(format).toString()).getTime() - new Date(time1.format(format).toString()).getTime()) / 1000 / 60 / 60 / 24);
    //区间内是否包含闰二月29
    let t0Leap = 0;//包含就标记为1 下面计算多减1天
    let t1Leap = 0;
    if (time0.isAfter(time0.format(format).split("/")[0] + "/02/28 23:59:59")) {
      if (
        new Date(
          new Date((time0.format(format).toString())).getFullYear() + "/02/29"
        ).getDate() != 1
      ) {
        t0Leap = 1
      }
    } else {
      if (
        new Date(
          new Date((time0.format(format).toString())).getFullYear() * 1 - 1 + "/02/29"
        ).getDate() != 1
      ) {
        t0Leap = 1
      }
    }

    if (time1.isAfter(time1.format(format).split("/")[0] + "/02/28 23:59:59")) {
      if (
        new Date(
          new Date((time1.format(format).toString())).getFullYear() + "/02/29"
        ).getDate() != 1
      ) {
        t1Leap = 1
      }
    } else {
      if (
        new Date(
          new Date((time1.format(format).toString())).getFullYear() * 1 - 1 + "/02/29"
        ).getDate() != 1
      ) {
        t1Leap = 1
      }
    }


    lastDaysArr = [valueDiffDay - 1, valueDiffDay - 1];
    lastYearArr = [- 365 - t0Leap, - 365 - t1Leap];
    let selectvalue = "自定义"
    if (lastDaysArr.toString() == contrastObj.time.toString()) {
      selectvalue = "lastDays"
    } else if (lastYearArr.toString() == contrastObj.time.toString()) {
      selectvalue = "lastYear"
    }

    return {
      contrastObj: contrastObj,
      contrastSelectChangeValue: selectvalue
    }
  }


  onChangeContrast = (marr) => {

    let datas = this.getContrastObj(marr)
    this.setState({
      ...datas
    }, () => {
      if (this.props.onChangeContrast) {
        this.props.onChangeContrast(datas.contrastObj)
      }
    })

  }


  //动态静态时间触发onClick
  onClick = (e) => {
    if (this.props.onClick) {
      this.props.onClick(e)
    } else {

    }
  }
  //动态静态时间触发onChange
  onChange = (marr, sarr, timestr, send) => {
    // console.log(marr[0].format('YYYY-MM-DD HH:mm:ss'));
    // console.log(marr[1].format('YYYY-MM-DD HH:mm:ss'));
    // console.log('==============>',marr);
    // console.log(sarr);
    // console.log(timestr);
    // console.log(send);
    // marr = [marr[0], moment(marr[1].format('YYYY-MM-DD') + ' 23:59:59')]
    let { timearr, dynamicObj, isCustom, showTime } = this.state;

    if (marr.length == 0 && sarr.length == 0) {
      this.setState({
        timearr: [],
        value: []
      })
      if (this.props.onChange) {
        this.props.onChange([], [], {
          time: [],
          rangeName: "",
          isDynamic: dynamicObj.isDynamic
        })
      };
      return false;
    }
    if ((this.state.value[0] && this.state.value[1]) && marr[0].isSame(this.state.value[0]) && marr[1].isSame(this.state.value[1]) && timestr == (this.state.value[2] && this.state.value[2].rangeName ? this.state.value[2].rangeName : "")) {
      return false;
    }

    let _this = this;
    let extCustomVal = "";
    let extCustomValName = "";
    let { newHeads = {} } = this.props;
    let customTime = false;//自定义时间对象
    if (isCustom) { // 判断是否使用自定义时间
      timestr = timestr || this.props.extCustomValName;//初始化时 如果传入的是自定义时间 timester是为空的 这时取props.extCustomValName 作为timestr
      extCustomValName = timestr;
      extCustomVal = this.props.extCustomVal;//同初始化时无值原因赋值
      let customVal = newHeads && newHeads.rangesObj ? newHeads.rangesObj[timestr] : {};
      if (customVal && (customVal[3] || customVal[3] === 0)) {//如果是从左侧快捷选择触发  timestr则为正确字符串 通过对名找到正确值 给extCustomVal 重新赋值
        customTime = { isCustom: isCustom, extCustomVal: customVal[3], extCustomValName: timestr }
        extCustomVal = customVal[3];
      } else {
        customTime = { isCustom: isCustom, extCustomVal: extCustomVal, extCustomValName: extCustomValName }

      }

    }


    if (isCustom && extCustomValName) {
      let { rangesObj } = newHeads;
      if (rangesObj) {
        let customVal = rangesObj[extCustomValName];
        if (customVal && customVal[3]) {
          customTime = { isCustom: isCustom, extCustomVal: extCustomVal, extCustomValName: extCustomValName }
        }
      }
    }

    if (marr.length == 0 && sarr.length == 0) {
      this.setState({
        timearr: [],
        value: []
      })
      if (this.props.onChange) {
        this.props.onChange([], [], {
          time: [],
          rangeName: "",
          isDynamic: dynamicObj.isDynamic
        })
      };
      return false;
    }

    if (showTime === false) {
      marr = [moment(marr[0].format('YYYY-MM-DD') + ' 00:00:00'), moment(marr[1].format('YYYY-MM-DD') + ' 23:59:59'), marr[2]]
      sarr = [marr[0].format(format), marr[1].format(format)]
    }

    if ((!sarr) && marr && marr[0]) {
      sarr = [marr[0].format(format), marr[1].format(format)]
    }

    if ((JSON.stringify(timearr) != JSON.stringify(sarr)) || (dynamicObj.rangeName != timestr) || (timestr === false)) {

      let time0 = moment(sarr[0]);
      let time1 = moment(sarr[1]);
      let dura0 = new Date(moment().endOf("days").format(format).toString()).getTime() - new Date(time0.format(format).toString()).getTime();
      let dura1 = new Date(moment().endOf("days").format(format).toString()).getTime() - new Date(time1.format(format).toString()).getTime();
      let tempTime0 = Math.floor(dura0 / 1000 / 60 / 60 / 24);
      let tempTime1 = Math.floor(dura1 / 1000 / 60 / 60 / 24);
      let timeStrArr = [tempTime0, tempTime1];
      let presetStr = "";


      if (marr[0].isSameOrAfter(marr[1])) {
        message.info("开始时间与结束时间一致！")
        // return false;
      }
      presetStr = this.handlePreset(marr, timestr);
      let dynamicObj = {
        time: (presetStr == "上线至今" ? [-1, timeStrArr[1]] : timeStrArr),
        rangeName: (presetStr ? presetStr : (
          this.state.dynamic ?
            "过去" + timeStrArr[0] + "天 - "
            +
            "过去" + timeStrArr[1] + "天" :
            ""
        )),
        isDynamic: this.state.dynamic
      }
      marr[2] = cloneDeep(dynamicObj);

      // 赋值
      this.setState({
        timearr: sarr,
        value: marr,
        dynamicObj: cloneDeep(dynamicObj),
        extCustomVal: extCustomVal,
        extCustomValName: extCustomValName,
      }, () => {
        time0 = "";
        time1 = "";
        let _ud = {};

        if (sarr[0]) {
          time0 = sarr[0].split(" ")[1];
        }

        if (sarr[1]) {
          time1 = sarr[1].split(" ")[1];
        }

        if (time0) {
          time0 = time0.split(":");
          _ud.time0 = time0;
        }
        // if (time1) {

        //     if (moment().isSame(moment(sarr[1]), "day")) {
        //         time1 = moment().format("YYYY/MM/DD HH:mm").split(" ")[1].split(":");
        //         _ud.time1 = time1;
        //     } else {
        //         time1 = time1.split(":");
        //         _ud.time1 = time1;
        //     }


        // }
        if (time1) {
          time1 = time1.split(":");
          _ud.time1 = time1;
        }
        _this.setState(_ud);
      });

    }


    if (send && this.props.onOk) {
      this.props.onOk(marr, timearr, marr[2], customTime)
    } else if (this.props.onChange) {
      this.props.onChange(marr, sarr, marr[2], customTime)
    };

  }

  disabledTaskDate = (current) => {
    const { selectDate } = this.state
    if (!current || !selectDate) return false;
    const offsetV = 7 * 24 * 60 * 60 * 1000;                 //30天转换成ms
    const selectV = selectDate.valueOf();
    const currenV = current.valueOf();

    console.log('currenVcurrenV', currenV);
    function calcMinus(a, b) {
      return a - b
    }
    function calcAdd(a, b) {
      return a + b
    }
    return (calcMinus(currenV, offsetV) > selectV || calcAdd(currenV, offsetV) < selectV) ? true : false;
  }

  //动态静态时间触发onOk
  onOk = () => {

    let rootDom = this.getRootDom();
    let _this = this;

    let { timearr, extCustomVal, extCustomValName, isCustom, value } = this.state;
    let { newHeads } = this.props;
    if (isCustom && extCustomValName && newHeads) {
      let customTime = false;
      let { rangesObj } = newHeads;
      let customVal = rangesObj[extCustomValName];
      if (customVal && customVal[3]) {
        customTime = {
          isCustom: isCustom,
          extCustomVal: extCustomVal,
          extCustomValName: extCustomValName
        }
      }

      let marr = value;
      this.props.onOk(marr, timearr, marr[2], customTime);
      this.setState({
        timeContentShow: false
      })
      return false
    }

    let dynamicObj = cloneDeep(this.state.dynamicObj);
    if (timearr.length == 0) {
      this.setState({
        timeContentShow: false
      })
      if (this.props.onOk) {
        this.props.onOk([], [], {
          time: [],
          rangeName: "",
          isDynamic: dynamicObj.isDynamic
        })
      }


      return false;
    }
    let marr = [moment(timearr[0]), moment(timearr[1])];
    if (this.props.onOk) {
      this.props.onOk(marr, timearr, dynamicObj)
    }
    marr[2] = cloneDeep(dynamicObj);
    this.setState({
      value: marr,
      timeContentShow: false
    }, () => {
      let timesInput = rootDom.getElementsByClassName("ant-calendar-input");
      let time0 = "";
      let time1 = "";
      let _ud = {};

      if (timesInput[0]) {
        time0 = timesInput[0].value.split(" ")[1];
        time1 = timesInput[1].value.split(" ")[1];
      }

      if (time0) {
        time0 = time0.split(":");
        _ud.time0 = time0;
      }
      if (time1) {
        time1 = time1.split(":");
        _ud.time1 = time1;
      }

      _this.setState(_ud, () => {
        this.handlePreset(marr, this.state.presetStr)
      });
    });





  }
  //动态静态时间触发onOpenChange
  onOpenChange = (shstate) => {
    let _this = this;
    if (this.props.onOpenChange) {
      this.props.onOpenChange(shstate);
    }
    this.setState({
      open: shstate
    })
    if (shstate) {
      let timerArr = this.props.value || this.state.value;
      let time0 = "";
      let time1 = "";
      let _ud = {};


      if (timerArr[0]) {
        time0 = timerArr[0].hour() + ":" + timerArr[0].minutes();
      }

      if (timerArr[1]) {
        time1 = timerArr[1].hour() + ":" + timerArr[1].minutes();
      }


      if (time1) {
        time1 = time1.split(":");
        _ud.time1 = time1;
      } else {
        _ud.time1 = ["00", "00"];
      }

      if (time0) {
        time0 = time0.split(":");
        _ud.time0 = time0;
      } else {
        _ud.time0 = ["00", "00"];
      }

      _this.setState(_ud);
    }
  }

  //动态静态时间时分秒触发selectChange
  selectChange = (index, value) => {
    let timerArr = this.props.value || this.state.value;
    if (timerArr[0] && timerArr[1]) {
      let _timei = Math.floor(index / this.state.selectNum);
      let _arri = index % this.state.selectNum;
      let timearr = this.state.timearr;
      let dynamicObj = cloneDeep(this.state.dynamicObj);
      if (timearr.length == 0) {
        timearr = [moment().startOf('day'), moment().endOf('day')];
      }
      let _data = {};
      _data["time0"] = JSON.parse(JSON.stringify(this.state["time0"]));
      _data["time1"] = JSON.parse(JSON.stringify(this.state["time1"]));

      _data["time" + _timei][_arri] = value;
      _data = JSON.parse(JSON.stringify(_data));


      let timearr0 = timearr[0];
      let timearr1 = timearr[1];
      timearr0 = timearr0.split(" ")[0] + " " + _data.time0.join(":");
      timearr1 = timearr1.split(" ")[0] + " " + _data.time1.join(":");

      _data.timearr = [timearr0, timearr1];
      _data.value = [moment(timearr0), moment(timearr1), dynamicObj];

      if (moment(timearr0).isSameOrAfter(moment(timearr1))) {
        message.error("开始时间必须小于结束时间！")
        return false;
      }
      this.onChange([moment(timearr0), moment(timearr1)], [timearr0, timearr1], this.state.presetStr)
    } else {
      message.error("请先选择时间区间！")
    }


  }

  showTimePopBtn = () => {
    let timeContentShow = !this.state.timeContentShow
    this.setState({
      timeContentShow
    })
  }

  dynamicStateChange = (dynamicState, isCustom) => {
    let dynamicObj = cloneDeep(this.state.dynamicObj);
    dynamicObj.isDynamic = dynamicState;
    let extCustomVal = "";
    let extCustomValName = "";
    let contrastObj = cloneDeep(this.state.contrastObj);
    if (isCustom) {
      if (this.props.newHeads && this.props.newHeads.rangesObj) {
        for (let key in this.props.newHeads.rangesObj) {

          if (extCustomVal === "") {
            extCustomValName = key;
            extCustomVal = this.props.newHeads.rangesObj[key][3]
          }
        }
      }
      contrastObj.isContrast = false;
    }
    this.setState({ contrastObj: contrastObj, dynamic: dynamicState, dynamicObj, isCustom: isCustom || false, extCustomVal: extCustomVal, extCustomValName: extCustomValName }, () => {
      if (this.state.value && this.state.value[0] && this.state.value[1]) {
        // let timestr = (isCustom && extCustomValName) ? extCustomValName : this.handlePreset(this.state.value);
        // this.onChange(this.state.value, [this.state.value[0].format(format), this.state.value[1].format(format)], timestr);
      }

    })
  }

  /**清空时间 */
  clearTime = () => {
    this.onChange([], []);
  }

  /**是否包含当天 */
  changeContainToday = () => {
    this.setState({ containToday: !this.state.containToday });
  }

  /**修改对比时间开启状态 */

  changeisContrast = (dom) => {
    let checked = dom.target.checked;
    let { contrastObj } = this.state;
    contrastObj.isContrast = checked;
    contrastObj = cloneDeep(contrastObj);
    let contrastSelectChangeValue = "lastDays";

    let value = this.state.value && this.state.value.length >= 2 ? cloneDeep(this.state.value) : [moment().startOf("day"), moment().endOf("day")];
    let time0 = moment(value[0]).endOf("day");
    let time1 = moment(value[1]).endOf("day");
    let valueDiffDay = Math.floor((new Date(time0.format(format).toString()).getTime() - new Date(time1.format(format).toString()).getTime()) / 1000 / 60 / 60 / 24);

    let timeStrArr = [valueDiffDay - 1, valueDiffDay - 1];
    contrastObj.time = timeStrArr;
    this.setState({
      contrastObj,
      contrastSelectChangeValue
    })
  }

  /** 对比时间select选择变更 */
  contrastSelectChange = (selectvalue) => {
    let { contrastObj } = this.state;
    contrastObj = cloneDeep(contrastObj);

    let value = (this.state.value && this.state.value.length >= 2) ? cloneDeep(this.state.value) : [moment().startOf("day"), moment().endOf("day")];
    let time0 = moment(value[0]).endOf("day");
    let time1 = moment(value[1]).endOf("day");
    let valueDiffDay = Math.floor((new Date(time0.format(format).toString()).getTime() - new Date(time1.format(format).toString()).getTime()) / 1000 / 60 / 60 / 24);

    //区间内是否包含闰二月29
    let t0Leap = 0;//包含就标记为1 下面计算多减1天
    let t1Leap = 0;
    if (time0.isAfter(time0.format(format).split("/")[0] + "/02/28 23:59:59")) {
      if (
        new Date(
          new Date((time0.format(format).toString())).getFullYear() + "/02/29"
        ).getDate() != 1
      ) {
        t0Leap = 1
      }
    } else {
      if (
        new Date(
          new Date((time0.format(format).toString())).getFullYear() * 1 - 1 + "/02/29"
        ).getDate() != 1
      ) {
        t0Leap = 1
      }
    }

    if (time1.isAfter(time1.format(format).split("/")[0] + "/02/28 23:59:59")) {
      if (
        new Date(
          new Date((time1.format(format).toString())).getFullYear() + "/02/29"
        ).getDate() != 1
      ) {
        t1Leap = 1
      }
    } else {
      if (
        new Date(
          new Date((time1.format(format).toString())).getFullYear() * 1 - 1 + "/02/29"
        ).getDate() != 1
      ) {
        t1Leap = 1
      }
    }



    if (selectvalue == "lastDays") {
      let timeStrArr = [valueDiffDay - 1, valueDiffDay - 1];
      contrastObj.time = timeStrArr;
    } else if (selectvalue == "lastYear") {
      let timeStrArr = [- 365 - t0Leap, - 365 - t1Leap];
      contrastObj.time = timeStrArr;
    } else {

    }

    this.setState({
      contrastObj,
      contrastSelectChangeValue: selectvalue
    }, () => {
      if (this.props.onChangeContrast) {
        this.props.onChangeContrast(contrastObj)
      }
    })
  }

  render() {

    let { rootId, selectNum, open, timearr, timeContentShow, presetStr, dynamic, extCustomVal, isCustom, showTime, selectDate, noDynamic, extCustomValName, contrastObj } = this.state;
    let { value, extBtn, id, getCalendarContainer, placement, trigger, label, newHeads, ...propsTemp } = this.props;
    let ranges = rangesObj;
    if (isCustom && newHeads) {
      ranges = newHeads.rangesObj
    }
    let createOption = (type, tagi) => {
      let temp = "";
      let _arr = [];
      let _timei = Math.floor(tagi / selectNum);
      let _arri = tagi % selectNum;
      if (type == "hour") {
        _arr = new Array(24).fill(0);
      } else {
        _arr = new Array(60).fill(0);
      }

      temp = <Select disabled={isCustom && newHeads && newHeads.timeDisabled ? newHeads.timeDisabled : false} size={size} value={(this.state["time" + _timei][_arri] * 1 || 0)} onChange={this.selectChange.bind(this, tagi)}>
        {
          _arr.map((item, index) => {
            return <Option className="timeContentMk" key={"a" + index} value={index}>{index < 10 ? ("0" + index) : index}</Option>
          })
        }
      </Select>
      return temp;
    }

    //快捷时间选择按钮
    let footerTimeChoiceBtn = () => {
      let buttonArr = [];
      for (let key in ranges) {
        buttonArr[buttonArr.length] = <Button
          key={key}
          onMouseEnter={footerTimeEnter.bind(this, ranges[key])}
          onMouseLeave={footerTimeLeave.bind(this, ranges[key])}
          className={classNames("footerBtn", "ant-tag-blue", "rangesBtnType", { rangesBtnTypem: key == '过去7天' || key == '过去30天' })}
          size={size}
          onClick={footerTimeChoice.bind(this, ranges[key], key)}>{key}</Button>
      }
      if (extBtn && extBtn.length != 0) {
        buttonArr = extBtn;
      }

      return buttonArr;
    }

    //快捷时间选择点击
    let footerTimeChoice = (momentArr, timestr) => {
      if (this.props.onOk) {
        this.onChange([moment(momentArr[0].format(format)), moment(momentArr[1].format(format))], [momentArr[0].format(format), momentArr[1].format(format)], timestr, true)
      } else {
        this.onChange([moment(momentArr[0].format(format)), moment(momentArr[1].format(format))], [momentArr[0].format(format), momentArr[1].format(format)], timestr)

      }
      footerTimeLeave();
      this.setState({
        timeContentShow: false
      })
    }

    //快捷时间选择鼠标移入
    let footerTimeEnter = (momentArr) => {
      let timeStrArr = [momentArr[0].format(format).split(" ")[0], momentArr[1].format(format).split(" ")[0]];//需要标记的时间范围
      let yearArr = document.getElementsByClassName("ant-calendar-year-select");//当前时间table显示的年
      let monthArr = document.getElementsByClassName("ant-calendar-month-select");//当前时间table显示的月
      let needSetState = [];//需要标记的时间table index
      let calendarTbody = document.getElementsByClassName("ant-calendar-tbody");//时间table的tbody


      if (yearArr.length != 2 || calendarTbody.length != 2) {
        return false;
      } else {
        yearArr = [yearArr[0].innerHTML, yearArr[1].innerHTML];
        monthArr = [monthArr[0].innerHTML, monthArr[1].innerHTML];
        if (timeStrArr[0].indexOf("-") != -1) {
          timeStrArr = [timeStrArr[0].split("-"), timeStrArr[1].split("-")];

        } else {
          timeStrArr = [timeStrArr[0].split("/"), timeStrArr[1].split("/")];

        }
        yearArr = [yearArr[0].replace("年", ""), yearArr[1].replace("年", "")];
        monthArr = [monthArr[0].replace("月", ""), monthArr[1].replace("月", "")];


        for (let i = 0; i < 2; i++) {
          let tempState = false;

          if (
            (moment(timeStrArr[0][0] + "-" + timeStrArr[0][1]).isBefore(yearArr[i] + "-" + monthArr[i]) || moment(timeStrArr[0][0] + "-" + timeStrArr[0][1]).isSame(yearArr[i] + "-" + monthArr[i]))
            &&
            (moment(timeStrArr[1][0] + "-" + timeStrArr[1][1]).isAfter(yearArr[i] + "-" + monthArr[i]) || moment(timeStrArr[1][0] + "-" + timeStrArr[1][1]).isSame(yearArr[i] + "-" + monthArr[i]))
          ) {
            tempState = true;
          }
          if (tempState) {
            needSetState[needSetState.length] = i;
          }
        }
        for (let i = 0; i < needSetState.length; i++) {
          let tds = calendarTbody[needSetState[i]].getElementsByTagName("td");
          for (let i2 = 0; i2 < tds.length; i2++) {
            if (tds[i2].className.indexOf("ant-calendar-last-month-cell") == -1 && tds[i2].className.indexOf("ant-calendar-next-month-btn-day") == -1) {

              if (timeStrArr[0][1] == timeStrArr[1][1] && timeStrArr[0][0] == timeStrArr[1][0]) {
                if (tds[i2].innerText * 1 >= timeStrArr[0][2] * 1 && tds[i2].innerText * 1 <= timeStrArr[1][2] * 1) {
                  tds[i2].className = tds[i2].className + " " + "iwRangePickerRangeMark" + " ";
                }
              } else {

                for (let i3 = 0; i3 < 2; i3++) {
                  if (
                    (moment(timeStrArr[0].join("-")).isBefore(yearArr[needSetState[i]] + "-" + monthArr[needSetState[i]] + "-" + tds[i2].innerText) || moment(timeStrArr[0].join("-")).isSame(yearArr[needSetState[i]] + "-" + monthArr[needSetState[i]] + "-" + tds[i2].innerText))
                    &&
                    (moment(timeStrArr[1].join("-")).isAfter(yearArr[needSetState[i]] + "-" + monthArr[needSetState[i]] + "-" + tds[i2].innerText) || moment(timeStrArr[1].join("-")).isSame(yearArr[needSetState[i]] + "-" + monthArr[needSetState[i]] + "-" + tds[i2].innerText))
                  ) {
                    tds[i2].className = tds[i2].className + " " + "iwRangePickerRangeMark" + " ";
                  }

                }
              }
            }
          }
        }



      }
    }

    //快捷时间选择鼠标离开
    let footerTimeLeave = (momentArr) => {
      let calendarTbody = document.getElementsByClassName("ant-calendar-tbody");
      for (let i = 0; i < calendarTbody.length; i++) {
        let tds = calendarTbody[i].getElementsByTagName("td");
        for (let i2 = 0; i2 < tds.length; i2++) {
          tds[i2].className = tds[i2].className.replace("iwRangePickerRangeMark", "");
          tds[i2].className = tds[i2].className.replace("iwRangePickerRangeMark", "");
          tds[i2].className = tds[i2].className.replace("iwRangePickerRangeMark", "");
        }
      }
    }

    //对比时间显示时标记动静态时间选择值

    let valuesMark = (momentArr) => {
      let timeStrArr = [momentArr[0].format(format).split(" ")[0], momentArr[1].format(format).split(" ")[0]];//需要标记的时间范围
      let yearArr = document.getElementsByClassName("ant-calendar-year-select");//当前时间table显示的年
      let monthArr = document.getElementsByClassName("ant-calendar-month-select");//当前时间table显示的月
      let needSetState = [];//需要标记的时间table index
      let calendarTbody = document.getElementsByClassName("ant-calendar-tbody");//时间table的tbody


      if (yearArr.length != 2 || calendarTbody.length != 2) {
        return false;
      } else {
        yearArr = [yearArr[0].innerHTML, yearArr[1].innerHTML];
        monthArr = [monthArr[0].innerHTML, monthArr[1].innerHTML];
        if (timeStrArr[0].indexOf("-") != -1) {
          timeStrArr = [timeStrArr[0].split("-"), timeStrArr[1].split("-")];

        } else {
          timeStrArr = [timeStrArr[0].split("/"), timeStrArr[1].split("/")];

        }
        yearArr = [yearArr[0].replace("年", ""), yearArr[1].replace("年", "")];
        monthArr = [monthArr[0].replace("月", ""), monthArr[1].replace("月", "")];


        for (let i = 0; i < 2; i++) {
          let tempState = false;

          if (
            (moment(timeStrArr[0][0] + "-" + timeStrArr[0][1]).isBefore(yearArr[i] + "-" + monthArr[i]) || moment(timeStrArr[0][0] + "-" + timeStrArr[0][1]).isSame(yearArr[i] + "-" + monthArr[i]))
            &&
            (moment(timeStrArr[1][0] + "-" + timeStrArr[1][1]).isAfter(yearArr[i] + "-" + monthArr[i]) || moment(timeStrArr[1][0] + "-" + timeStrArr[1][1]).isSame(yearArr[i] + "-" + monthArr[i]))
          ) {
            tempState = true;
          }
          if (tempState) {
            needSetState[needSetState.length] = i;
          }
        }
        for (let i = 0; i < needSetState.length; i++) {
          let tds = calendarTbody[needSetState[i]].getElementsByTagName("td");
          for (let i2 = 0; i2 < tds.length; i2++) {
            if (tds[i2].className.indexOf("ant-calendar-last-month-cell") == -1 && tds[i2].className.indexOf("ant-calendar-next-month-btn-day") == -1) {

              if (timeStrArr[0][1] == timeStrArr[1][1] && timeStrArr[0][0] == timeStrArr[1][0]) {
                if (tds[i2].innerText * 1 >= timeStrArr[0][2] * 1 && tds[i2].innerText * 1 <= timeStrArr[1][2] * 1) {
                  tds[i2].className = tds[i2].className + " " + "iwRangePickerRangeMark" + " ";
                }
              } else {

                for (let i3 = 0; i3 < 2; i3++) {
                  if (
                    (moment(timeStrArr[0].join("-")).isBefore(yearArr[needSetState[i]] + "-" + monthArr[needSetState[i]] + "-" + tds[i2].innerText) || moment(timeStrArr[0].join("-")).isSame(yearArr[needSetState[i]] + "-" + monthArr[needSetState[i]] + "-" + tds[i2].innerText))
                    &&
                    (moment(timeStrArr[1].join("-")).isAfter(yearArr[needSetState[i]] + "-" + monthArr[needSetState[i]] + "-" + tds[i2].innerText) || moment(timeStrArr[1].join("-")).isSame(yearArr[needSetState[i]] + "-" + monthArr[needSetState[i]] + "-" + tds[i2].innerText))
                  ) {
                    tds[i2].className = tds[i2].className + " " + "iwRangePickerRangeMark" + " ";
                  }

                }
              }
            }
          }
        }



      }
    }

    let cls = this.props.className ? this.props.className : '';

    let time0 = moment(timearr[0]);
    let time1 = moment(timearr[1]);
    let dura0 = new Date(moment().endOf("days").format(format).toString()).getTime() - new Date(time0.format(format).toString()).getTime();
    let dura1 = new Date(moment().endOf("days").format(format).toString()).getTime() - new Date(time1.format(format).toString()).getTime();
    let tempTime0 = Math.floor(dura0 / 1000 / 60 / 60 / 24);
    let tempTime1 = Math.floor(dura1 / 1000 / 60 / 60 / 24);


    function getTimeStr() {
      if (dynamic) {
        if (presetStr) {
          return <span>{presetStr}</span>
        } else {
          return (
            (tempTime1) == 0 ? "今" : "过去" + (tempTime1)
          ) + "天 - "
            +
            (
              (tempTime0) == 0 ? "今" : "过去" + (tempTime0)
            ) + "天"
        }
      } else {
        if (timearr && timearr[0] && timearr[1]) {
          return timearr[0].split(" ")[0] + " 至 " + timearr[1].split(" ")[0]
        } else {
          return ""
        }

      }

    }

    let contrastObjValue = (
      (
        contrastObj
        &&
        contrastObj.time
        &&
        contrastObj.time.length == 2
      )
      &&
      (
        value
        &&
        value.length >= 2
      )
    )
      ?
      [moment(cloneDeep(value[0])).subtract(contrastObj.time[0] * -1, "days").startOf("day"), moment(cloneDeep(value[1])).subtract(contrastObj.time[1] * -1, "days").endOf("day")] : [];



    return (
      <div className={classNames("iwRangPickerPro", cls)} id={id} onClick={this.onClick} value={this.props.value}>

        <Popover
          overlayClassName="iwRangPickerProPopover"
          onVisibleChange={(visible) => { this.setState({ timeContentShow: visible }) }}
          visible={timeContentShow}
          trigger={this.props.trigger || "click"}
          getPopupContainer={this.props.getCalendarContainer || (() => document.body)}
          placement={this.props.placement || "bottomLeft"}
          content={
            <div className="timeContent timeContentShow" >
              <div className="timeContentHead">
                <div className={classNames("timeContentHeadBtn", { on: !!(dynamic && (!isCustom)) })} style={noDynamic ? { display: "none" } : {}} onClick={() => { this.dynamicStateChange(true) }}>动态时间</div>
                <div className={classNames("timeContentHeadBtn", { on: !!((!dynamic) && (!isCustom)) })} onClick={() => { this.dynamicStateChange(false) }}>静态时间</div>
                {
                  newHeads && newHeads.name
                    ?
                    <div className={classNames("timeContentHeadBtn", { on: !!isCustom })} onClick={() => { this.dynamicStateChange(false, true) }}>{newHeads.name}</div>
                    : ""
                }
                <Tooltip placement="top" title={<span>
                  <Icon type="swap" /> 为动态时间，
                                     <Icon type="calendar" /> 为静态时间
                                </span>}>
                  <Icon style={noDynamic ? { display: "none" } : {
                    color: "#1890ff", fontSize: "16px", position: "absolute",
                    top: "15px",
                    left: "208px"
                  }} type="question-circle" />
                </Tooltip>
                <div className="timeContentHeadTimeStr">
                  {isCustom && extCustomValName ? extCustomValName : getTimeStr()}
                  {this.props.allowClear && value && value[0] && value[1] ? <Icon type="close" onClick={this.clearTime} style={{ color: "red", marginLeft: "5px" }} /> : ""}
                </div>
              </div>
              <div className="timeContentMid">
                {/* 左边快速选择 */}
                <div className="fastTimeChoice">
                  {footerTimeChoiceBtn()}
                  {
                    (contrastObj.isContrast)
                      ?
                      <div className="contrastMask"></div>
                      :
                      ""
                  }
                </div>
                {/* 日历面板区域 */}
                <div className="rangePickerDiv" ref={this.pickContainer} id={rootId}>
                  {
                    (contrastObj.isContrast && (!isCustom))
                      ?
                      <RangePicker /** 相对时间rangepicker*/
                        className="contrasRangPicker"
                        disabledDate={current => (current && current > moment().endOf('day'))}
                        locale={locale}
                        open={true}
                        defaultValue={this.props.defaultValue || this.props.initialValue}
                        showTime={showTime}
                        format="YYYY/MM/DD HH:mm"
                        ranges={false}
                        value={contrastObjValue}
                        onChange={this.onChangeContrast}
                        getCalendarContainer={() => {
                          let rootdom = this.getRootDom();
                          if (rootdom.className.indexOf('outbox') == -1) {
                            rootdom.className = rootdom.className + " outbox";
                          }
                          return rootdom
                        }}
                      />
                      :
                      <RangePicker /** 动静态时间rangepicker*/
                        disabledDate={
                          isCustom && newHeads && newHeads.disabledDate
                            ?
                            newHeads.disabledDate
                            :
                            this.disabledTaskDate
                        }
                        dropdownClassName="_dropdownClassName"
                        locale={locale}
                        open={true}
                        defaultValue={this.props.defaultValue || this.props.initialValue}
                        showTime={(isCustom && newHeads && (newHeads.showTime === true || newHeads.showTime === false)) ? newHeads.showTime : true}
                        format="YYYY/MM/DD HH:mm"
                        {...propsTemp}
                        ranges={false}
                        value={value && value.length == 2 ? value : this.state.value}
                        onCalendarChange={dates => {
                          if (!dates || !dates.length) return;
                          // setSelectDate(dates[0]);
                          console.log('<>>>>>>>>>>>>>>>>> dates=', dates);
                          this.setState({ selectDate: dates[0] || dates[1] })
                        }}
                        onChange={this.onChange}
                        // onOpenChange={this.onOpenChange}
                        onOpenChange={() => {
                          this.setState({ selectDate: null })
                        }}
                        getCalendarContainer={() => {
                          let rootdom = this.getRootDom();
                          if (rootdom.className.indexOf('outbox') == -1) {
                            rootdom.className = rootdom.className + " outbox";
                          }
                          return rootdom
                        }}
                        renderExtraFooter={
                          () => {
                            if (showTime === false) {
                              return null;
                            }
                            return <div className="extraFooter">
                              <div className="timedivout" >
                                <div className="timediv0">
                                  {createOption("hour", 0)}
                                  {selectNum > 1 ? " : " : ""}
                                  {selectNum > 1 ? createOption("min", 1) : ""}
                                  {selectNum > 2 ? " : " : ""}
                                  {selectNum > 2 ? createOption("sec", 2) : ""}
                                </div>
                                <div className="timediv1">
                                  {createOption("hour", selectNum)}
                                  {selectNum > 1 ? " : " : ""}
                                  {selectNum > 1 ? createOption("min", selectNum + 1) : ""}
                                  {selectNum > 2 ? " : " : ""}
                                  {selectNum > 2 ? createOption("sec", selectNum + 2) : ""}
                                </div>
                              </div>
                            </div>
                          }
                        }
                      />

                  }

                </div>

              </div>
              <div className="timeContentFoot">
                {
                  this.props.contrast
                    ?
                    <span className="contrastSpan">
                      {
                        contrastObj.isContrast
                          ?
                          <span style={{ display: "inline-block", marginTop: "-3px" }}>
                            <Select size="small" onChange={this.contrastSelectChange} className="contrastSelect" value={this.state.contrastSelectChangeValue}>
                              <Option value="lastDays">上一时段</Option>
                              <Option value="lastYear">去年同期</Option>
                            </Select>
                            <Input size="small" value={contrastObjValue[0] ? contrastObjValue[0].format(format).split(" ")[0] : ""} style={{ display: "inline-block", width: "100px", textAlign: "center" }} /> - <Input size="small" value={contrastObjValue[1] ? contrastObjValue[1].format(format).split(" ")[0] : ""} style={{ display: "inline-block", width: "100px", textAlign: "center" }} />
                          </span>
                          :
                          ""
                      }

                    </span>
                    :
                    ""
                }

                <Button type="link" style={{ border: 0, boxShadow: "none" }} onClick={() => {
                  _this.setState({
                    timeContentShow: false
                  })
                }}>取消</Button>
                <Button onClick={this.onOk}>确定</Button>
              </div>
            </div>
          } >
          {/* 触发按钮 */}
          <div className="timeStrLine">
            <Button onClick={this.showTimePopBtn} disabled={this.props.disabledRangePickerBtn} >
              {dynamic ? <Icon type="swap" /> : <Icon type="calendar" />}
              {label && presetStr ? (<span>{extCustomValName ? extCustomValName : presetStr}{!(isCustom && extCustomValName) ? <Divider type="vertical" style={{ background: "#566c92" }} /> : ""}</span>) : ""}
              {(label && dynamic && (!presetStr) && !(isCustom && extCustomValName)) ? <span>{getTimeStr()}<Divider type="vertical" style={{ background: "#566c92" }} /></span> : ""}
              {(isCustom && extCustomValName) ? "" : (timearr && timearr[0] && timearr[1] ? (timearr[0].split(" ")[0] + " 至 " + timearr[1].split(" ")[0]) : "开始日期 - 结束日期")}
            </Button>
            {
              contrastObj.isContrast && (!this.props.notShowContrastSpan) && (contrastObjValue.length >= 2)
                ?
                <span className="btnContrastSpan">
                  <span className="btnContrastText">对比时间：</span>
                  <span className="btnContrastTime">{contrastObjValue[0].format(format).split(" ")[0]} - {contrastObjValue[1].format(format).split(" ")[0]}</span>
                </span>
                :
                ""
            }
          </div>
        </Popover>

      </div >

    )
  }
}   