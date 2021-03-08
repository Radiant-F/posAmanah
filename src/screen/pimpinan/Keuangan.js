import AsyncStorage from '@react-native-community/async-storage';
import React, {Component} from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableNativeFeedback,
  View,
} from 'react-native';
import DatePicker from 'react-native-datepicker';

export default class Keuangan extends Component {
  constructor() {
    super();
    this.state = {
      token: this.getToken(),
      keuangan: [],
      keuangan_tgl: [],
      awal: '2021-01-01',
      akhir: '2021-01-01',
      total: 0,
      view_tgl: false,
      view_keuangan: true,
      loading: true,
    };
  }

  getToken() {
    AsyncStorage.getItem('token')
      .then((value) => {
        this.setState({token: value});
        this.getKeuangan();
      })
      .catch((err) => console.log(err));
  }

  getKeuangan() {
    this.setState({loading: true});
    console.log('memuat data keuangan..');
    fetch(`https://amanah-mart.herokuapp.com/api/keuangan`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.state.token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        if (responseJSON.status == 'Success') {
          console.log('data dimuat');
          this.setState({keuangan: responseJSON.data, loading: false});
        } else {
          this.setState({keuangan: null, loading: false});
          console.log('data gagal diambil');
        }
      })
      .catch((err) => this.fatal(err));
  }

  getKeuanganTgl() {
    this.setState({view_keuangan: false, loading: true});
    console.log('memuat data keuangan berdasarkan tanggal..');
    fetch(
      `https://amanah-mart.herokuapp.com/api/perwaktu/${this.state.awal}/${this.state.akhir}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.state.token}`,
          'Content-Type': 'application/json',
        },
      },
    )
      .then((response) => response.json())
      .then((responseJSON) => {
        console.log(responseJSON);
        if (responseJSON.status == 'Success') {
          console.log('data dimuat');
          this.setState({
            keuangan_tgl: responseJSON.data.row,
            total: responseJSON.data.data[0],
            loading: false,
          });
          console.log(this.state.total);
        } else {
          this.setState({keuangan_tgl: null, loading: false});
          console.log('data gagal dimuat');
        }
      })
      .catch((err) => this.fatal(err));
  }

  fatal(err) {
    this.setState({keuangan: null, keuangan_tgl: null, loading: false});
    console.log(err);
    Alert.alert(
      'Waktu Permintaan Habis',
      'Harap periksa koneksi Anda lalu coba lagi.',
      [{text: 'Ok'}, {text: 'Ulangi', onPress: () => this.getToken()}],
      {cancelable: true},
    );
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <View style={{padding: 10}}>
          <TouchableNativeFeedback
            onPress={() => this.setState({view_tgl: !this.state.view_tgl})}>
            <View style={{...styles.viewKeuangan}}>
              <Text style={{textAlign: 'center'}}>
                Tampilkan Berdasarkan Tanggal
              </Text>
            </View>
          </TouchableNativeFeedback>
          {this.state.view_tgl ? (
            <View style={styles.viewTgl}>
              <TouchableNativeFeedback
                onPress={() => this.setState({view_keuangan: true})}>
                <View style={{...styles.buttonRefresh}}>
                  <Image
                    source={require('../../assets/refresh-button-1.png')}
                    style={{width: 30, height: 30}}
                  />
                </View>
              </TouchableNativeFeedback>
              <DatePicker
                style={{width: 90}}
                showIcon={false}
                date={this.state.awal}
                mode="date"
                placeholder="pilih tanggal"
                format="YYYY-MM-DD"
                minDate="2016-05-01"
                maxDate="2021-12-31"
                confirmBtnText="Konfirmasi"
                cancelBtnText="Batal"
                onDateChange={(date) => this.setState({awal: date})}
              />
              <Text>-</Text>
              <DatePicker
                style={{width: 90}}
                showIcon={false}
                date={this.state.akhir}
                mode="date"
                placeholder="pilih tanggal"
                format="YYYY-MM-DD"
                minDate="2016-05-01"
                maxDate="2021-12-31"
                confirmBtnText="Konfirmasi"
                cancelBtnText="Batal"
                onDateChange={(date) => this.setState({akhir: date})}
              />
              <TouchableNativeFeedback onPress={() => this.getKeuanganTgl()}>
                <View style={styles.buttonRefresh}>
                  <Image
                    source={require('../../assets/refresh-button.png')}
                    style={{width: 35, height: 35}}
                  />
                </View>
              </TouchableNativeFeedback>
            </View>
          ) : (
            <View style={{marginBottom: -20}}></View>
          )}
        </View>
        {this.state.loading ? (
          <ActivityIndicator
            size="large"
            color="tomato"
            style={{padding: 10}}
          />
        ) : (
          <View>
            {this.state.view_keuangan ? (
              <View>
                {this.state.keuangan == null ? (
                  <Text> Data Kosong </Text>
                ) : (
                  <ScrollView>
                    <View style={{padding: 10}}>
                      {this.state.keuangan.map((value, index) => (
                        <View key={index} style={styles.viewKeuangan}>
                          <Text>Keterangan: {value.keterangan}</Text>
                          <Text>Debit: {value.debit}</Text>
                          <Text>Kredit: {value.kredit}</Text>
                          <Text>Saldo: {value.saldo}</Text>
                          <Text style={{color: 'grey'}}>
                            {value.created_at}
                          </Text>
                        </View>
                      ))}
                      <View style={{margin: 20}}></View>
                    </View>
                  </ScrollView>
                )}
              </View>
            ) : (
              <ScrollView>
                <View style={{padding: 10}}>
                  {this.state.keuangan_tgl == null ? (
                    <Text>Data Kosong</Text>
                  ) : (
                    <View>
                      {this.state.keuangan_tgl.map((value, index) => (
                        <View style={styles.viewKeuangan} key={index}>
                          <Text style={{textAlign: 'center'}}>
                            {value.tanggal}
                          </Text>
                          <Text>Pendapatan: {value.pendapatan}</Text>
                          <Text>Pembelian: {value.pembelian}</Text>
                          <Text>Pengeluaran: {value.pengeluaran}</Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </ScrollView>
            )}
          </View>
        )}
      </View>
    );
  }
}

export const styles = StyleSheet.create({
  viewKeuangan: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    elevation: 3,
    marginBottom: 10,
  },
  viewTgl: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: -10,
  },
  buttonRefresh: {
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 3,
    padding: 10,
  },
});
