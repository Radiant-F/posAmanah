import AsyncStorage from '@react-native-community/async-storage';
import React, {Component} from 'react';
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TouchableNativeFeedback,
  View,
  RefreshControl,
  TextInput,
  StyleSheet,
  Button,
  ToastAndroid,
  Modal,
} from 'react-native';
import _ from 'lodash';

export default class StagingProduk extends Component {
  constructor() {
    super();
    this.state = {
      jumlah_product: 0,
      harga: 0,
      harga_jual: 0,
      token: this.getToken(),
      daftar_pembelian: [],
      refresh: false,
      disabled: true,
      modal: false,
      loading: false,
      loadingConfirm: false,
    };
  }

  toPrice(price) {
    return _.replace(price, /\B(?=(\d{3})+(?!\d))/g, '.');
  }

  getToken() {
    AsyncStorage.getItem('token')
      .then((value) => {
        if (value) {
          this.setState({token: value});
          console.log(this.state.token);
          this.getPembelian();
        }
      })
      .catch((err) => console.log(err));
  }

  getPembelian() {
    this.setState({daftar_pembelian: [], loading: true});
    ToastAndroid.show('Memuat produk...', ToastAndroid.LONG);
    console.log('mengambil daftar pembelian..');
    fetch(`https://amanah-mart.herokuapp.com/api/pembelian`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.state.token}`,
      },
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        this.setState({
          daftar_pembelian: responseJSON.data,
          refresh: false,
          loading: false,
        });
        console.log('daftar pembelian termuat.');
      })
      .catch((err) => this.fatal(err));
  }

  updateProduk(id) {
    console.log('memperbarui produk..');
    const {jumlah_product, harga, harga_jual} = this.state;
    var dataToSend = {
      jumlah_product: jumlah_product,
      harga: harga,
      harga_jual: harga_jual,
    };
    this.setState({loading: true});
    fetch(`https://amanah-mart.herokuapp.com/api/pembelian/update/${id}`, {
      method: 'POST',
      body: JSON.stringify(dataToSend),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.state.token}`,
      },
    })
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson);
        if (responseJson.status == 'Success') {
          this.setState({loading: false});
          ToastAndroid.show('Produk telah diperbarui', ToastAndroid.SHORT);
          this.getPembelian();
        } else {
          this.setState({loading: false});
          ToastAndroid.show('Periksa koneksi Anda.', ToastAndroid.SHORT);
        }
      })
      .catch((error) => console.log(error));
  }

  deleteProduk(id) {
    console.log('menghapus produk..');
    const {jumlah_product, harga, harga_jual} = this.state;
    var dataToSend = {
      jumlah_product: jumlah_product,
      harga: harga,
      harga_jual: harga_jual,
    };
    this.setState({loading: true});
    fetch(`https://amanah-mart.herokuapp.com/api/pembelian/destroy/${id}`, {
      method: 'POST',
      body: JSON.stringify(dataToSend),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.state.token}`,
      },
    })
      .then((response) => response.json())
      .then((responseJson) => {
        console.log(responseJson);
        if (responseJson.status == 'Success') {
          this.setState({loading: false});
          ToastAndroid.show('Produk telah diperbarui', ToastAndroid.SHORT);
          this.getPembelian();
        } else {
          this.setState({loading: false});
          ToastAndroid.show('Periksa koneksi Anda.', ToastAndroid.SHORT);
        }
      })
      .catch((error) => console.log(error));
  }

  confirmProduk() {
    this.setState({loadingConfirm: true});
    ToastAndroid.show('Mengkonfirmasi pembelian...', ToastAndroid.SHORT);
    console.log('mengambil daftar pembelian..');
    fetch(`https://amanah-mart.herokuapp.com/api/pembelian/confirm`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.state.token}`,
      },
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        this.setState({
          daftar_pembelian: responseJSON.data,
          refresh: false,
          loadingConfirm: false,
        });
        console.log('daftar pembelian termuat.');
      })
      .catch((err) => console.log(err));
  }

  fatal(err) {
    this.setState({refresh: false});
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
                this.getPembelian();
              }}
            />
          }>
          {this.state.daftar_pembelian == null ? (
            <View style={{alignSelf: 'center'}}>
              <Text>Daftar Kosong</Text>
            </View>
          ) : (
            <Text>
              {this.state.loadingConfirm ? (
                <View style={styles.button}>
                  <ActivityIndicator size="large" color="white" />
                </View>
              ) : (
                <TouchableNativeFeedback onPress={() => this.confirmProduk()}>
                  <View style={styles.button}>
                    <Text style={styles.text}>Konfirmasi Pembelian</Text>
                  </View>
                </TouchableNativeFeedback>
              )}
              <View>
                {this.state.daftar_pembelian.map((value, index) => (
                  <View key={index} style={styles.viewProduct}>
                    <Text>Nama Produk: {value.name}</Text>
                    {value.jumlah_product <= 1 ? (
                      <Text>
                        Stok Produk:{' '}
                        <Text style={{color: 'tomato'}}>
                          {this.toPrice(value.jumlah_product)}
                        </Text>
                      </Text>
                    ) : (
                      <Text>
                        Stok Produk: {this.toPrice(value.jumlah_product)}
                      </Text>
                    )}
                    <Text>Perbarui Stok</Text>
                    <TextInput
                      underlineColorAndroid="orange"
                      placeholder="Stok Barang"
                      keyboardType="number-pad"
                      onChangeText={(input) =>
                        this.setState({jumlah_product: input})
                      }
                    />
                    {value.harga <= 1 ? (
                      <Text>
                        Harga Satuan Produk:{' '}
                        <Text style={{color: 'tomato'}}>
                          Rp {this.toPrice(value.harga)},-
                        </Text>
                      </Text>
                    ) : (
                      <Text>
                        Harga Satuan Produk: Rp {this.toPrice(value.harga)},-
                      </Text>
                    )}
                    <Text>Perbarui Harga Satuan</Text>
                    <TextInput
                      underlineColorAndroid="orange"
                      placeholder="Harga Barang"
                      keyboardType="number-pad"
                      onChangeText={(input) => this.setState({harga: input})}
                    />
                    {value.harga_jual <= 1 ? (
                      <Text>
                        Stok Produk:{' '}
                        <Text style={{color: 'tomato'}}>
                          {this.toPrice(value.harga_jual)}
                        </Text>
                      </Text>
                    ) : (
                      <Text>
                        Stok Produk: Rp {this.toPrice(value.harga_jual)},-
                      </Text>
                    )}
                    <Text>Perbarui Harga Jual</Text>
                    <TextInput
                      underlineColorAndroid="orange"
                      placeholder="Harga Jual Barang"
                      keyboardType="number-pad"
                      onChangeText={(input) =>
                        this.setState({harga_jual: input})
                      }
                    />
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-evenly',
                      }}>
                      <Button
                        color="tomato"
                        title="hapus produk"
                        onPress={() => this.deleteProduk(value.id)}
                      />
                      <Button
                        title="perbarui produk"
                        onPress={() => this.updateProduk(value.id)}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </Text>
          )}
          <Modal
            visible={this.state.modal}
            transparent
            onRequestClose={() => this.setState({modal: false})}>
            <View
              style={{justifyContent: 'center', alignItems: 'center', flex: 1}}>
              <View style={styles.viewModal}>
                <Text>Masukan Stok</Text>
                <TextInput
                  underlineColorAndroid="orange"
                  placeholder="Stok Barang"
                  keyboardType="number-pad"
                  onChangeText={(input) =>
                    this.setState({jumlah_product: input})
                  }
                />
                <Text>Masukan Harga</Text>
                <TextInput
                  underlineColorAndroid="orange"
                  placeholder="Harga Barang"
                  keyboardType="number-pad"
                  onChangeText={(input) => this.setState({harga: input})}
                />
                <Text>Masukan Harga Jual</Text>
                <TextInput
                  underlineColorAndroid="orange"
                  placeholder="Harga Barang"
                  keyboardType="number-pad"
                  onChangeText={(input) => this.setState({harga_jual: input})}
                />
              </View>
            </View>
          </Modal>
          <Text> keranjang </Text>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  viewProduct: {
    backgroundColor: 'white',
    elevation: 3,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  viewModal: {
    backgroundColor: 'white',
    padding: 10,
    elevation: 3,
    borderRadius: 10,
    width: '90%',
  },
  button: {
    marginBottom: 10,
    padding: 10,
    borderRadius: 10,
    elevation: 3,
    backgroundColor: 'lime',
    alignSelf: 'center',
    justifyContent: 'center',
    width: '60%',
    height: 50,
  },
  text: {
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 18,
    color: 'white',
    textShadowRadius: 1,
    textShadowColor: 'black',
    textShadowOffset: {
      width: 0.5,
      height: 0.5,
    },
  },
});
