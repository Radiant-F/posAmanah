import AsyncStorage from '@react-native-community/async-storage';
import React, {Component} from 'react';
import {ScrollView, StyleSheet, Text, View} from 'react-native';

export default class Keuangan extends Component {
  constructor() {
    super();
    this.state = {
      token: this.getToken(),
      keuangan: [],
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
          this.setState({keuangan: responseJSON.data});
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
        {this.state.keuangan == null ? (
          <Text> Data Kosong </Text>
        ) : (
          <View style={{padding: 10}}>
            <ScrollView>
              {this.state.keuangan.map((value, index) => (
                <View key={index} style={styles.viewKeuangan}>
                  <Text>Keterangan: {value.keterangan}</Text>
                  <Text>Debit: {value.debit}</Text>
                  <Text>Kredit: {value.kredit}</Text>
                  <Text>Saldo: {value.saldo}</Text>
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

export const styles = StyleSheet.create({
  viewKeuangan: {
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    elevation: 3,
    marginBottom: 10,
  },
});
