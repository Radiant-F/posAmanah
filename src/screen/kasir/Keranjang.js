import AsyncStorage from '@react-native-community/async-storage';
import CheckBox from '@react-native-community/checkbox';
import React, {Component} from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  TouchableNativeFeedback,
  View,
  RefreshControl,
} from 'react-native';
import {styles} from '../kasir/Gudang';
import _ from 'lodash';

export default class Keranjang extends Component {
  constructor() {
    super();
    this.state = {
      daftar_keranjang: [],
      token: this.getToken(),
      detail: '',
      loading: false,
      dibayar: 0,
      total_bayar: 0,
      bayar_saldo: false,
      tombol: true,
      qty: 0,
      refresh: false,
      member_id: 0,
      diskon: 0,
      diskon_loading: false,
      confirm_loading: false,
    };
  }

  toPrice(price) {
    return _.replace(price, /\B(?=(\d{3})+(?!\d))/g, '.');
  }

  getToken() {
    AsyncStorage.getItem('token')
      .then((value) => {
        this.setState({token: value});
        this.getKeranjang();
      })
      .catch((err) => console.log(err));
  }

  getKeranjang() {
    this.setState({loading: true, tombol: true, detail: '', diskon: 0});
    console.log('mengambil keranjang..');
    fetch(`https://amanah-mart.herokuapp.com/api/penjualan`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.state.token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        if (responseJSON.status == 'Success') {
          console.log(responseJSON);
          this.setState({
            daftar_keranjang: responseJSON.data.Cart,
            detail: responseJSON.data.Penjualan,
            diskon: responseJSON.data.Penjualan.diskon,
            total_bayar: responseJSON.data.Penjualan.jumlah_harga,
            loading: false,
            tombol: false,
            refresh: false,
          });
        } else if (responseJSON.status == 'Failed') {
          console.log('keranjang kosong');
          this.setState({
            loading: false,
            refresh: false,
            daftar_keranjang: null,
          });
        }
      })
      .catch((err) => this.fatal(err));
  }

  inputHarga() {
    console.log('mengirim uang yg dibayar..');
    this.setState({confirm_loading: true, tombol: true});
    const {dibayar} = this.state;
    var kirimData = {dibayar: dibayar};
    fetch(`https://amanah-mart.herokuapp.com/api/penjualan/bayar`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.state.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(kirimData),
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        console.log(responseJSON);
        if (responseJSON.status == 'Success') {
          ToastAndroid.show(
            `Kembalian: Rp.${responseJSON.data},-`,
            ToastAndroid.LONG,
          );
          console.log('uang diterima. kembalian: Rp.', responseJSON.data, ',-');
          this.confirmCart();
        } else {
          ToastAndroid.show('Uang yang dimasukan kurang!', ToastAndroid.SHORT);
          this.setState({confirm_loading: false, tombol: false});
          console.log('gagal. uang yg dibayar kurang?');
        }
      })
      .catch((err) => console.log(err));
  }

  updateQTY(id) {
    ToastAndroid.show('Memperbarui QTY..', ToastAndroid.SHORT);
    console.log('memperbarui qty..');
    const {qty} = this.state;
    var data = {jumlah_product: qty};
    fetch(`https://amanah-mart.herokuapp.com/api/penjualan/update/${id}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.state.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        if (responseJSON.status == 'Success') {
          console.log('qty diperbarui');
          ToastAndroid.show('QTY telah diperbarui', ToastAndroid.SHORT);
          this.getKeranjang();
        } else {
          ToastAndroid.show('QTY gagal diperbarui', ToastAndroid.SHORT);
          console.log('qty gagal diperbarui');
        }
      })
      .catch((err) => this.fatal(err));
  }

  deleteCart(id) {
    ToastAndroid.show('Menghapus produk..', ToastAndroid.SHORT);
    this.setState({tombol: true});
    console.log('mengapus produk..');
    fetch(`https://amanah-mart.herokuapp.com/api/penjualan/destroy/${id}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.state.token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        if (responseJSON.status == 'Success') {
          console.log('barang dihapus');
          ToastAndroid.show('Produk dihapus', ToastAndroid.SHORT);
          this.setState({tombol: false});
          this.getKeranjang();
        } else {
          console.log('barang gagal dihapus');
          ToastAndroid.show('Gagal menghapus produk', ToastAndroid.SHORT);
          this.setState({tombol: false});
        }
      })
      .catch((err) => this.fatal(err));
  }

  getDiskon() {
    console.log('mengambil diskon member..');
    this.setState({diskon_loading: true, tombol: true});
    const {member_id} = this.state;
    var data = {member_id: member_id};
    fetch(`https://amanah-mart.herokuapp.com/api/penjualan/diskon`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.state.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        console.log(responseJSON);
        if (responseJSON.status == 'success') {
          console.log(
            'member mendapat diskon sebesar: ',
            responseJSON.data.diskon,
            '%',
          );
          this.diskonAlert(responseJSON.data.diskon);
          this.setState({
            diskon_loading: false,
            tombol: false,
            diskon: responseJSON.data.diskon,
          });
          this.getKeranjang();
        } else {
          this.setState({diskon_loading: false, tombol: false});
          ToastAndroid.show('Member ID tidak ditemukan', ToastAndroid.LONG);
          console.log('diskon tidak didapat');
        }
      })
      .catch((err) => this.fatal(err));
  }

  confirmCart() {
    if (this.state.bayar_saldo == true) {
      this.setState({confirm_loading: true, tombol: true});
      console.log('mengkonfirmasi pakek saldo..');
      fetch(`https://amanah-mart.herokuapp.com/api/penjualan/confirmsaldo`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.state.token}`,
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((responseJSON) => {
          console.log(responseJSON);
          if (responseJSON.status == 'Success') {
            console.log('transaksi berhasil');
            ToastAndroid.show('Transaksi berhasil', ToastAndroid.SHORT);
            this.setState({confirm_loading: false, tombol: false});
            this.getKeranjang();
          } else {
            this.setState({confirm_loading: false, tombol: false});
            ToastAndroid.show('Saldo member kurang', ToastAndroid.SHORT);
            console.log('transaksi gagal');
          }
        })
        .catch((err) => this.fatal(err));
    } else {
      console.log('mengkonfirmasi tanpa saldo member..');
      this.setState({confirm_loading: true, tombol: true});
      fetch(`https://amanah-mart.herokuapp.com/api/penjualan/confirm`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.state.token}`,
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((responseJSON) => {
          console.log(responseJSON);
          if (responseJSON.status == 'Success') {
            console.log('transaksi berhasil');
            ToastAndroid.show('Transaksi berhasil', ToastAndroid.SHORT);
            this.setState({confirm_loading: false, tombol: false});
            this.getKeranjang();
          } else {
            this.setState({confirm_loading: false, tombol: false});
            ToastAndroid.show('Barang melebihi stok!', ToastAndroid.SHORT);
            console.log('transaksi gagal');
          }
        })
        .catch((err) => console.log(err));
    }
  }

  fatal(err) {
    console.log(err);
    Alert.alert('Waktu Permintaan Habis', 'Periksa koneksi Anda', [
      {text: 'Ulangi', onPress: () => this.getKeranjang()},
      {text: 'OK'},
    ]);
    this.setState({
      loading: false,
      refresh: false,
      diskon_loading: false,
      tombol: false,
      confirm_loading: false,
    });
  }

  diskonAlert(diskon) {
    Alert.alert('Selamat!', `Member mendapat diskon sebesar ${diskon}%`, [
      {text: 'OK'},
    ]);
  }

  render() {
    return (
      <View style={{flex: 1, padding: 10}}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.refresh}
              onRefresh={() => {
                this.setState({refresh: true});
                this.getKeranjang();
              }}
            />
          }>
          <View style={styles.viewBarcode}>
            <View style={{flex: 1, paddingRight: 10}}>
              <Text> Input Pembayaran</Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Text> Rp.</Text>
                <TextInput
                  editable={!this.state.bayar_saldo}
                  selectTextOnFocus
                  keyboardType="decimal-pad"
                  style={{flex: 1}}
                  underlineColorAndroid="orange"
                  placeholder="20.000"
                  onChangeText={(input) => this.setState({dibayar: input})}
                />
                <Text>,-</Text>
              </View>
            </View>
            <View>
              <TouchableNativeFeedback
                disabled={this.state.tombol}
                onPress={() =>
                  this.state.bayar_saldo
                    ? this.confirmCart()
                    : this.inputHarga()
                }>
                <View style={{...styles.button, width: 125}}>
                  {this.state.confirm_loading ? (
                    <Text>Tunggu..</Text>
                  ) : (
                    <Text>Konfirmasi</Text>
                  )}
                  <Image
                    source={require('../../assets/shopping-cart.png')}
                    style={styles.imgIcon}
                  />
                </View>
              </TouchableNativeFeedback>
            </View>
          </View>
          <Text style={{marginTop: 10}}> Member ID (jika ada)</Text>
          <View style={styles.viewBarcode}>
            <TextInput
              style={{flex: 1}}
              placeholder="Masukan Member ID"
              underlineColorAndroid="orange"
              onChangeText={(input) => this.setState({member_id: input})}
            />
            <View>
              {this.state.diskon == 0 ? (
                <TouchableNativeFeedback
                  disabled={this.state.tombol}
                  onPress={() => this.getDiskon()}>
                  <View style={gaya.tombolDiskon}>
                    {this.state.diskon_loading ? (
                      <Text>Harap tunggu..</Text>
                    ) : (
                      <Text>Dapatkan Diskon!</Text>
                    )}
                  </View>
                </TouchableNativeFeedback>
              ) : (
                <View style={gaya.tombolDiskon}>
                  <Text>Diskon Didapat!</Text>
                </View>
              )}
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <CheckBox
                  value={this.state.bayar_saldo}
                  onValueChange={() =>
                    this.setState({bayar_saldo: !this.state.bayar_saldo})
                  }
                  tintColors={{true: 'lime', false: 'grey'}}
                />
                <Text>Bayar dengan saldo</Text>
              </View>
            </View>
          </View>
          <View style={{margin: 5, marginBottom: 5}}>
            {this.state.diskon == 0 ? (
              <View style={{...gaya.viewDaftar}}>
                <Text style={{fontSize: 20, includeFontPadding: false}}>
                  Total harga:{' '}
                  <Text style={{fontWeight: 'bold'}}>
                    Rp {this.toPrice(this.state.detail.jumlah_harga)}
                    ,-
                  </Text>
                </Text>
              </View>
            ) : (
              <View>
                <View style={{...gaya.viewDaftar}}>
                  <Text style={{fontSize: 20, includeFontPadding: false}}>
                    Total harga:{' '}
                    <Text style={{fontWeight: 'bold'}}>
                      Rp {this.toPrice(this.state.detail.jumlah_harga)}
                      ,-
                    </Text>
                  </Text>
                </View>
                <Text>Diskon: {this.state.detail.diskon}%</Text>
              </View>
            )}
          </View>
          {this.state.loading ? (
            <ActivityIndicator color="lime" size="large" />
          ) : (
            <>
              {this.state.daftar_keranjang == null ? (
                <Text>Keranjang kosong.</Text>
              ) : (
                <>
                  {this.state.daftar_keranjang.map((value, index) => (
                    <View key={index} style={gaya.viewDaftar}>
                      <View>
                        <Text>Produk: {value.name}</Text>
                        {value.diskon == 0 ? (
                          <Text>Harga: {value.harga}</Text>
                        ) : (
                          <Text>
                            Harga: {value.harga_diskon} (diskon {value.diskon}%)
                          </Text>
                        )}
                        <Text>QTY: {value.jumlah_product}</Text>
                        <Text>Jumlah Harga: {value.jumlah_harga}</Text>
                      </View>
                      <View>
                        <View style={gaya.tombolQTY}>
                          <TouchableNativeFeedback
                            onPress={() =>
                              this.setState({qty: this.state.qty - 1})
                            }>
                            <View style={gaya.addQTY}>
                              <Text>-</Text>
                            </View>
                          </TouchableNativeFeedback>
                          <TextInput
                            maxLength={5}
                            value={this.state.qty}
                            keyboardType="decimal-pad"
                            placeholder="e.g 200"
                            underlineColorAndroid="orange"
                            onChangeText={(input) =>
                              this.setState({qty: input})
                            }
                          />
                          <TouchableNativeFeedback
                            onPress={() =>
                              this.setState({qty: this.state.qty + 1})
                            }>
                            <View
                              style={{...gaya.addQTY, backgroundColor: 'lime'}}>
                              <Text>+</Text>
                            </View>
                          </TouchableNativeFeedback>
                        </View>
                        <TouchableNativeFeedback
                          onPress={() => this.updateQTY(value.id)}>
                          <View style={gaya.tombolUpdate}>
                            <Text style={{color: 'white'}}>Update QTY</Text>
                          </View>
                        </TouchableNativeFeedback>
                        <TouchableNativeFeedback
                          disabled={this.state.tombol}
                          onPress={() => this.deleteCart(value.id)}>
                          <View
                            style={{
                              ...gaya.tombolUpdate,
                              backgroundColor: 'tomato',
                              marginTop: 5,
                            }}>
                            <Text style={{color: 'white'}}>Hapus</Text>
                          </View>
                        </TouchableNativeFeedback>
                      </View>
                    </View>
                  ))}
                </>
              )}
            </>
          )}
        </ScrollView>
      </View>
    );
  }
}

const gaya = StyleSheet.create({
  viewDaftar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    elevation: 3,
  },
  tombolQTY: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 100,
    paddingRight: 10,
  },
  addQTY: {
    backgroundColor: 'tomato',
    padding: 5,
    elevation: 3,
    borderRadius: 5,
    width: 20,
    alignItems: 'center',
  },
  tombolUpdate: {
    backgroundColor: 'orange',
    elevation: 3,
    padding: 3,
    borderRadius: 5,
    marginRight: 5,
    alignItems: 'center',
  },
  tombolDiskon: {
    marginLeft: 10,
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 5,
    elevation: 3,
    width: 125,
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
});
