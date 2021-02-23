import AsyncStorage from '@react-native-community/async-storage';
import React, {Component} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
  RefreshControl,
  TextInput,
  TouchableNativeFeedback,
  Image,
  ToastAndroid,
} from 'react-native';

export default class Gudang extends Component {
  constructor() {
    super();
    this.state = {
      token: this.getToken(),
      daftar_produk: [],
      loading: true,
      barcode: 0,
      refresh: false,
      tunggu: false,
      tunggu_manual: false,
      tombol: false,
    };
  }

  getToken() {
    AsyncStorage.getItem('token')
      .then((value) => {
        this.setState({token: value});
        this.getProduk();
      })
      .catch((err) => console.log(err));
  }

  getProduk() {
    console.log('mengambil produk..');
    fetch(`https://amanah-mart.herokuapp.com/api/product`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.state.token}`,
      },
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        if (responseJSON.status == 'Success') {
          this.setState({
            daftar_produk: responseJSON.data,
            loading: false,
            refresh: false,
          });
          console.log('produk dimuat');
        } else {
          this.setState({loading: false, refresh: false});
          console.log('produk kosong');
        }
      })
      .catch((err) => this.fatal(err));
  }

  addCart(barcode) {
    console.log('memasukan ke keranjang..');
    this.setState({tunggu: true});
    fetch(`https://amanah-mart.herokuapp.com/api/penjualan/${barcode}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.state.token}`,
      },
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        console.log(responseJSON);
        if (responseJSON.status == 'Success') {
          this.setState({tunggu: false});
          ToastAndroid.show('Barang masuk keranjang', ToastAndroid.SHORT);
        } else {
          this.setState({tunggu: false});
          ToastAndroid.show('Barang tidak ditemukan', ToastAndroid.SHORT);
        }
      })
      .catch((err) => this.fatal(err));
  }

  addCartManual() {
    if (this.state.barcode != 0) {
      this.setState({tunggu_manual: true, tombol: true});
      console.log('memasukan ke keranjang..');
      fetch(
        `https://amanah-mart.herokuapp.com/api/penjualan/${this.state.barcode}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.state.token}`,
          },
        },
      )
        .then((response) => response.json())
        .then((responseJSON) => {
          console.log(responseJSON);
          if (responseJSON.status == 'Success') {
            this.setState({tunggu_manual: false, tombol: false});
            ToastAndroid.show('Barang masuk keranjang', ToastAndroid.SHORT);
          } else {
            this.setState({tunggu_manual: false, tombol: false});
            ToastAndroid.show('Barang tidak ditemukan', ToastAndroid.SHORT);
          }
        })
        .catch((err) => this.fatal(err));
    } else {
      ToastAndroid.show('Harap masukan barcode', ToastAndroid.SHORT);
    }
  }

  fatal(err) {
    console.log(err);
    ToastAndroid.show('Periksa koneksi Anda', ToastAndroid.SHORT);
    this.setState({
      loading: false,
      tunggu: false,
      tunggu_manual: false,
      tombol: false,
    });
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.refresh}
              onRefresh={() => {
                this.setState({refresh: true});
                this.getProduk();
              }}
            />
          }>
          <View style={styles.mainView}>
            <View style={styles.viewBarcode}>
              <View style={{width: '45%'}}>
                <Text>Masukan Barcode</Text>
                <TextInput
                  keyboardType="number-pad"
                  onChangeText={(input) => this.setState({barcode: input})}
                  style={{flex: 1}}
                  placeholder="e.g 12321"
                  underlineColorAndroid="orange"
                />
              </View>
              <View style={{flexDirection: 'row'}}>
                <TouchableNativeFeedback
                  disabled={this.state.tombol}
                  onPress={() => this.addCartManual()}>
                  <View style={{...styles.button, marginRight: 10}}>
                    {this.state.tunggu_manual ? (
                      <Text>Tunggu..</Text>
                    ) : (
                      <Text>Tambah</Text>
                    )}
                    <Image
                      source={require('../../assets/shopping-cart.png')}
                      style={styles.imgIcon}
                    />
                  </View>
                </TouchableNativeFeedback>
                <TouchableNativeFeedback>
                  <View style={{...styles.button, width: 50}}>
                    <Image
                      source={require('../../assets/camera.png')}
                      style={{...styles.imgIcon, tintColor: 'orange'}}
                    />
                  </View>
                </TouchableNativeFeedback>
              </View>
            </View>
            {this.state.loading ? (
              <View style={{alignSelf: 'center'}}>
                <Text style={{marginBottom: 10}}>Memuat Produk</Text>
                <ActivityIndicator size="large" color="tomato" />
              </View>
            ) : (
              <>
                {this.state.daftar_produk == null ? (
                  <Text>Produk Kosong</Text>
                ) : (
                  <>
                    {this.state.daftar_produk.map((value, index) => (
                      <View key={index} style={styles.viewProduk}>
                        <View>
                          <Text>Nama Produk: {value.name}</Text>
                          <Text>Barcode: {value.barcode}</Text>
                          <Text>Stok: {value.stock}</Text>
                        </View>
                        <TouchableNativeFeedback
                          disabled={this.state.tunggu}
                          onPress={() => this.addCart(value.barcode)}>
                          <View style={{...styles.button, width: 70}}>
                            {this.state.tunggu ? (
                              <ActivityIndicator size="small" color="orange" />
                            ) : (
                              <Text style={{fontSize: 20}}>+</Text>
                            )}
                            <Image
                              source={require('../../assets/shopping-cart.png')}
                              style={styles.imgIcon}
                            />
                          </View>
                        </TouchableNativeFeedback>
                      </View>
                    ))}
                  </>
                )}
              </>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }
}

export const styles = StyleSheet.create({
  mainView: {
    padding: 10,
  },
  viewProduk: {
    backgroundColor: 'white',
    marginBottom: 10,
    borderRadius: 10,
    elevation: 3,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  imgIcon: {
    width: 30,
    height: 30,
    tintColor: 'lime',
  },
  button: {
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 3,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    width: 105,
    height: 50,
    justifyContent: 'space-between',
  },
  viewBarcode: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
