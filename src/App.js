import IwRangPickerPro from './components/iwRangPickerPro'
import moment from 'moment'

function App() {
  return (
    <div className="App">
      <IwRangPickerPro
        // showTime={false}
        // timeType="sec"
        // label={true}
        optionalDays={3}
        // value={[moment('2021-01-01'), moment('2021-01-31'), { isDynamic: false }]}
        format="YYYY/MM/DD HH:mm:ss"
        onChange={(a, b, c, d) => {
          console.log(a[0].format('YYYY-MM-DD HH:mm:ss'));
          console.log(a[1].format('YYYY-MM-DD HH:mm:ss'));
          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>', a);
          console.log(b);
          console.log(c);
          console.log(d);
        }}
        onOk={(a, b, c, d) => {
          console.log(a[0].format('YYYY-MM-DD HH:mm:ss'));
          console.log(a[1].format('YYYY-MM-DD HH:mm:ss'));
          console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>', a);
          console.log(b);
          console.log(c);
          console.log(d);
        }}
      />
      <div style={{ height: 5000, background: 'pink' }}></div>
    </div>
  );
}

export default App;
