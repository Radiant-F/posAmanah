import AsyncStorage from '@react-native-community/async-storage';
import React, {Component} from 'react';
import {
  Text,
  View,
  Alert,
  ScrollView,
  TouchableNativeFeedback,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';

export default class Absensi extends Component {
  constructor() {
    super();
    this.state = {
      token: this.getToken(),
      data_absen: [],
      data_kasir: '',
      modal: false,
    };
  }

  getToken() {
    AsyncStorage.getItem('token')
      .then((value) => {
        this.setState({token: value});
        this.getAbsen();
      })
      .catch((err) => console.log(err));
  }

  getAbsen() {
    console.log('memuat data absen..');
    fetch(`https://amanah-mart.herokuapp.com/api/absen`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.state.token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        console.log(responseJSON);
        if (responseJSON.status == 'Success') {
          this.setState({data_absen: responseJSON.data});
          console.log('data absen dimuat');
        } else {
          console.log('data absen gagal dimuat');
        }
      })
      .catch((err) => this.fatal(err));
  }

  getAbsenID(user_id) {
    this.setState({modal: true, data_kasir: ''});
    console.log('memuat data absen kasir..');
    fetch(`https://amanah-mart.herokuapp.com/api/absen/${user_id}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.state.token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        console.log(responseJSON);
        if (responseJSON.status == 'Success') {
          this.setState({data_kasir: responseJSON.data});
          console.log('data absen dimuat');
        } else {
          console.log('data absen gagal dimuat');
        }
      })
      .catch((err) => this.fatal(err));
  }

  fatal(err) {
    console.log(err);
    Alert.alert(
      'Waktu Permintaan Habis',
      'Harap periksa koneksi Anda lalu coba lagi.',
      [{text: 'Ok'}, {text: 'Ulangi', onPress: () => this.getToken()}],
      {cancelable: true},
    );
    this.setState({tombol_profil: false});
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <ScrollView>
          <View style={{padding: 10}}>
            {this.state.data_absen.map((value, index) => (
              <TouchableNativeFeedback
                key={index}
                onPress={() => this.getAbsenID(value.user_id)}>
                <View style={styles.mainView}>
                  <Text>User ID: {value.user_id}</Text>
                  <Text>Jam Masuk: {value.jam_masuk}</Text>
                  <Text>Jam Keluar: {value.jam_keluar}</Text>
                  <Text style={{color: 'grey', textAlign: 'right'}}>
                    {value.tanggal}
                  </Text>
                </View>
              </TouchableNativeFeedback>
            ))}
          </View>
        </ScrollView>
        <Modal
          animationType="fade"
          transparent
          visible={this.state.modal}
          onRequestClose={() => this.setState({modal: false})}>
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              backgroundColor: '#00000063',
            }}>
            <View style={styles.modal}>
              <Text style={{textAlign: 'center'}}>Detail Absen</Text>
              <View>
                {this.state.data_kasir == '' ? (
                  <ActivityIndicator size="large" color="lime" />
                ) : (
                  <View>
                    {this.state.data_kasir.Karyawan == null ? (
                      <View>
                        <Text>Data Kosong</Text>
                      </View>
                    ) : (
                      <View>
                        <Text>
                          Nama Karyawan: {this.state.data_kasir.User.name}
                        </Text>
                        <Text>
                          Nomor Telepon:{' '}
                          {this.state.data_kasir.Karyawan.phone_number}
                        </Text>
                        <Text>Kehadiran: {this.state.data_kasir.hadir}</Text>
                        <Text>Terlambat: {this.state.data_kasir.telat}</Text>
                        <Text>Alpha: {this.state.data_kasir.alpha}</Text>
                        <Text>
                          Total Jam Telat: {this.state.data_kasir.totalJamTelat}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainView: {
    padding: 10,
    elevation: 3,
    backgroundColor: 'white',
    borderRadius: 10,
    marginBottom: 10,
  },
  modal: {
    alignSelf: 'center',
    backgroundColor: 'white',
    width: '90%',
    borderRadius: 10,
    elevation: 3,
    padding: 10,
  },
});
