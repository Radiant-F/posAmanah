import AsyncStorage from '@react-native-community/async-storage';
import React, {Component} from 'react';
import {StyleSheet, Text, View, ScrollView} from 'react-native';
import {styles} from './Keuangan';

export default class Pengeluaran extends Component {
  constructor() {
    super();
    this.state = {
      token: this.getToken(),
      pengeluaran: [],
    };
  }

  getToken() {
    AsyncStorage.getItem('token')
      .then((value) => {
        this.setState({token: value});
        this.getPengeluaran();
      })
      .catch((err) => console.log(err));
  }

  getPengeluaran() {
    console.log('memuat data pengeluaran..');
    fetch(`https://amanah-mart.herokuapp.com/api/pengeluaran`, {
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
          this.setState({pengeluaran: responseJSON.data});
        } else {
          console.log('data gagal diambil');
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
  }

  render() {
    return (
      <View style={{flex: 1}}>
        {this.state.pengeluaran == null ? (
          <Text> Data Kosong </Text>
        ) : (
          <View style={{padding: 10}}>
            <ScrollView>
              {this.state.pengeluaran.map((value, index) => (
                <View key={index} style={styles.viewKeuangan}>
                  <Text>Keterangan: {value.keterangan}</Text>
                  <Text>Kredit: {value.kredit}</Text>
                  <Text style={{color: 'grey'}}>{value.created_at}</Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    );
  }
}
