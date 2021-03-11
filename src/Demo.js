// import React, {Component} from 'react';
// import {Text, View} from 'react-native';

// export default class extends Component {
//   constructor() {
//     super();
//     this.state = {
//       date: '',
//       month: '',
//       months: ['01', '02', '03', '04', '05', '06'],
//       year: '',
//     };
//   }

//   componentDidMount = () => {
//     console.log('mengambil tanggal hari ini..');
//     var date = new Date().getDate();
//     var month = new Date().getMonth() + 1;
//     var year = new Date().getFullYear();
//     this.setState({date: date, month: month, year: year});
//   };

//   getMonth = () => {
//     console.log('mengambil bulan..');
//     return this.state.months
//       .filter((item, index) => this.state.month == index + 1)
//       .map((v, i) => {
//         return this.state.date + '-' + v + '-' + this.state.year;
//       });
//   };

//   render() {
//     return (
//       <View>
//         <Text>{this.state.date}</Text>
//         <Text>{this.state.month}</Text>
//         <Text>{this.state.year}</Text>
//         <Text>{this.getMonth()}</Text>
//       </View>
//     );
//   }
// }

import React, {Component} from 'react';
import {Text, View} from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';

export default class Demo extends Component {
  qrCode(code) {
    console.log(code);
    alert(code.data);
  }

  render() {
    return (
      <QRCodeScanner
        cameraStyle={{width: '100%'}}
        showMarker
        onRead={(code) => this.qrCode(code)}
      />
    );
  }
}
