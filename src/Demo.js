import React, {Component} from 'react';
import {Text, View} from 'react-native';
import DatePicker from 'react-native-datepicker';

export default class Demo extends Component {
  constructor() {
    super();
    this.state = {
      date: '2016-05-15',
    };
  }
  render() {
    console.log(this.state.date);
    return (
      <DatePicker
        date={this.state.date}
        mode="date"
        placeholder="pilih tanggal"
        format="YYYY-MM-DD"
        minDate="2016-05-01"
        maxDate="2021-02-25"
        confirmBtnText="Konfirmasi"
        cancelBtnText="Batal"
        customStyles={{
          dateIcon: {
            position: 'absolute',
            left: 0,
            top: 4,
            marginLeft: 0,
          },
          dateInput: {
            marginLeft: 36,
          },
        }}
        onDateChange={(date) => this.setState({date: date})}
      />
    );
  }
}
