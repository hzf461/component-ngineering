import React, { useState, useEffect } from 'react'
import IwRangPickerPro from './components/iwRangPickerPro'
import moment from 'moment'
import Calendar from 'rc-calendar';
const dateFormat = 'YYYY-MM-DD HH:mm:ss';
const localValue = localStorage.getItem('localValue') ? JSON.parse(localStorage.getItem('localValue')) : {}

function App() {
  const [from_date, setFrom_date] = useState("2021-07-07 00:00:00")
  const [to_date, setTo_date] = useState("2021-07-07 23:59:59")
  const [dynamic_time, setDynamic_time] = useState(localValue.dynamic_time === undefined ? true : localValue.dynamic_time)
  const [dynamic_time_param, setDynamic_time_param] = useState(localValue.dynamic_time_param || { name: '过去7天', time: [7, 1], certainDate: false })

  function onChangeDate(date, dateString, dynamicObj, customTime) {
    // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    // console.log(date[0].format('YYYY-MM-DD HH:mm:ss'));
    // console.log(date[1].format('YYYY-MM-DD HH:mm:ss'));
    // console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>', date);
    // console.log(dateString);
    // console.log(dynamicObj);
    // console.log(customTime);
    if (!!(dynamicObj && dynamicObj.time)) {
      setFrom_date(date[0].format(dateFormat))
      setTo_date(date[1].format(dateFormat))
      setDynamic_time(dynamicObj.isDynamic)
      setDynamic_time_param({ name: dynamicObj.rangeName, time: dynamicObj.time,  certainDate: !!dynamicObj.certainDate })

      // 保存本地
      localStorage.setItem('localValue', JSON.stringify({
        from_date: date[0].format(dateFormat),
        to_date: date[1].format(dateFormat),
        dynamic_time: dynamicObj.isDynamic,
        dynamic_time_param: { name: dynamicObj.rangeName, time: dynamicObj.time, certainDate: !!dynamicObj.certainDate }
      }))
    }

  }

  return (
    <div className="App">
      {/* <Calendar /> */}
      <IwRangPickerPro />
      <hr></hr>
      <IwRangPickerPro
        showTime={true}
        timeType="sec"
        label={true}
        // noDynamic={true}

        // optionalDays={3}
        // value={[moment('2021-01-01'), moment('2021-01-31'), { isDynamic: false }]}
        // value={[
        //   moment("2021-02-12 00:00:00", dateFormat),
        //   moment("2021-02-18 23:59:59", dateFormat),
        //   {
        //     isDynamic: true,
        //     rangeName: '过去7天',
        //     time: [7, 1],
        //   },
        // ]}
        value={[
          moment(from_date, dateFormat),
          moment(to_date, dateFormat),
          // {
          //   isDynamic: !!dynamic_time,
          //   rangeName: dynamic_time_param.name,
          //   time: dynamic_time_param.time,
          //   // 自某日至今
          //   certainDate: dynamic_time_param.certainDate
          // },
        ]}
        format="YYYY/MM/DD HH:mm:ss"
        onChange={onChangeDate}
        onOk={onChangeDate}
      />
      <div style={{ height: 5000, background: 'pink', opacity: 0.1 }}></div>
    </div>
  );
}

export default App;
