import React, { useState, useEffect } from 'react'
import IwRangPickerPro from './components/iwRangPickerPro'
import moment from 'moment'
const dateFormat = 'YYYY-MM-DD HH:mm:ss';

function App() {
  const [from_date, setFrom_date] = useState("2021-02-12 00:00:00")
  const [to_date, setTo_date] = useState("2021-02-18 23:59:59")
  const [dynamic_time, setDynamic_time] = useState(true)
  const [dynamic_time_param, setDynamic_time_param] = useState({ name: '过去7天', time: [7, 1] })

  function onChangeDate(date, dateString, dynamicObj, customTime) {
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
    console.log(date[0].format('YYYY-MM-DD HH:mm:ss'));
    console.log(date[1].format('YYYY-MM-DD HH:mm:ss'));
    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>', date);
    console.log(dateString);
    console.log(dynamicObj);
    console.log(customTime);
    if (!!(dynamicObj && dynamicObj.time)) {
      setFrom_date(date[0].format(dateFormat))
      setTo_date(date[1].format(dateFormat))
      setDynamic_time(dynamicObj.isDynamic)
      setDynamic_time_param({ name: dynamicObj.rangeName, time: dynamicObj.time })
    }

  }

  return (
    <div className="App">
      <IwRangPickerPro
        // showTime={false}
        // timeType="sec"
        label={true}
        noDynamic={true}

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
          {
            isDynamic: !!dynamic_time,
            rangeName: dynamic_time_param.name,
            time: dynamic_time_param.time,
          },
        ]}
        // format="YYYY/MM/DD HH:mm:ss"
        onChange={onChangeDate}
        onOk={onChangeDate}
      />
      <div style={{ height: 5000, background: 'pink', opacity: 0.1 }}></div>
    </div>
  );
}

export default App;
