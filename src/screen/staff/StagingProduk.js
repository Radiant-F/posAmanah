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
  Alert,
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
      loading: true,
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
          this.getPembelian();
        }
      })
      .catch((err) => console.log(err));
  }

  getPembelian() {
    this.setState({daftar_pembelian: [], loading: true});
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
        if (responseJSON.status == 'Success') {
          this.setState({
            daftar_pembelian: responseJSON.data,
            refresh: false,
            loading: false,
          });
        } else {
          this.setState({
            loading: false,
            daftar_pembelian: null,
            refresh: false,
          });
        }
        console.log('daftar pembelian termuat.');
      })
      .catch((err) => this.fatal(err));
  }

  updateProduk(id) {
    console.log('memperbarui produk..');
    ToastAndroid.show('Memperbarui produk', ToastAndroid.SHORT);
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
      .catch((err) => this.fatal(err));
  }

  deleteProduk(id) {
    console.log('menghapus produk..');
    this.setState({loading: true});
    fetch(`https://amanah-mart.herokuapp.com/api/pembelian/destroy/${id}`, {
      method: 'POST',
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
      .catch((err) => this.fatal(err));
  }

  confirmProduk() {
    this.setState({loading: true});
    ToastAndroid.show('mengkonfirmasi pembelian...', ToastAndroid.SHORT);
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
        console.log('pembelian dikonfirmasi');
        ToastAndroid.show('Konfirmasi sukses', ToastAndroid.SHORT);
        this.setState({
          daftar_pembelian: null,
          refresh: false,
        });
        this.getPembelian();
      })
      .catch((err) => this.fatal(err));
  }

  fatal(err) {
    console.log(err);
    this.setState({refresh: false, loading: false, daftar_pembelian: null});
    Alert.alert(
      'Koneksi Tidak Stabil',
      'Coba lagi beberapa saat.',
      [
        {
          text: 'Ok',
        },
        {
          text: 'Ulangi',
          onPress: () => this.getToken(),
        },
      ],
      {cancelable: false},
    );
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
                this.getPembelian();
              }}
            />
          }>
          {this.state.loading ? (
            <ActivityIndicator
              size="large"
              color="tomato"
              style={{margin: 10}}
            />
          ) : (
            <View>
              {this.state.daftar_pembelian == null ? (
                <View style={{alignItems: 'center', width: '100%'}}>
                  <Text>Daftar Kosong</Text>
                </View>
              ) : (
                <View>
                  <TouchableNativeFeedback onPress={() => this.confirmProduk()}>
                    <View style={{...styles.button}}>
                      <Text style={styles.text}>Konfirmasi Pembelian</Text>
                    </View>
                  </TouchableNativeFeedback>
                  <View>
                    {this.state.daftar_pembelian.map((value, index) => (
                      <View key={index} style={styles.viewProduct}>
                        <Text style={{marginBottom: 10}}>
                          Nama Produk:{' '}
                          <Text style={{fontWeight: 'bold'}}>{value.name}</Text>
                        </Text>
                        {value.jumlah_product <= 1 ? (
                          <Text>
                            Stok Produk:{' '}
                            <Text style={{color: 'tomato'}}>
                              {this.toPrice(value.jumlah_product)}
                            </Text>
                          </Text>
                        ) : (
                          <Text>
                            Stok Produk:{' '}
                            <Text style={{fontWeight: 'bold'}}>
                              {this.toPrice(value.jumlah_product)}
                            </Text>
                          </Text>
                        )}
                        <View
                          style={{flexDirection: 'row', alignItems: 'center'}}>
                          <Text>Perbarui: </Text>
                          <TextInput
                            style={{flex: 1}}
                            underlineColorAndroid="orange"
                            placeholder="Stok Barang"
                            keyboardType="number-pad"
                            onChangeText={(input) =>
                              this.setState({jumlah_product: input})
                            }
                          />
                        </View>
                        {value.harga <= 1 ? (
                          <Text>
                            Harga Satuan Produk:{' '}
                            <Text style={{color: 'tomato'}}>
                              Rp {this.toPrice(value.harga)},-
                            </Text>
                          </Text>
                        ) : (
                          <Text>
                            Harga Satuan Produk: Rp{' '}
                            <Text style={{fontWeight: 'bold'}}>
                              {this.toPrice(value.harga)}
                            </Text>
                            ,-
                          </Text>
                        )}
                        <View
                          style={{flexDirection: 'row', alignItems: 'center'}}>
                          <Text>Perbarui: </Text>
                          <TextInput
                            style={{flex: 1}}
                            underlineColorAndroid="orange"
                            placeholder="Harga Barang"
                            keyboardType="number-pad"
                            onChangeText={(input) =>
                              this.setState({harga: input})
                            }
                          />
                        </View>
                        {value.harga_jual <= 1 ? (
                          <Text>
                            Harga Jual Produk:{' '}
                            <Text style={{color: 'tomato'}}>
                              Rp {this.toPrice(value.harga_jual)},-
                            </Text>
                          </Text>
                        ) : (
                          <Text>
                            Harga Jual Produk: Rp{' '}
                            <Text style={{color: 'green', fontWeight: 'bold'}}>
                              {this.toPrice(value.harga_jual)}
                            </Text>
                            ,-
                          </Text>
                        )}
                        <View
                          style={{flexDirection: 'row', alignItems: 'center'}}>
                          <Text>Perbarui:</Text>
                          <TextInput
                            style={{flex: 1}}
                            underlineColorAndroid="orange"
                            placeholder="Harga Jual Barang"
                            keyboardType="number-pad"
                            onChangeText={(input) =>
                              this.setState({harga_jual: input})
                            }
                          />
                        </View>
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
                </View>
              )}
            </View>
          )}
          <Modal
            visible={this.state.modal}
            transparent
            onRequestClose={() => this.setState({modal: false})}>
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                flex: 1,
              }}>
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
    margin: 10,
  },
  viewModal: {
    backgroundColor: 'white',
    padding: 10,
    elevation: 3,
    borderRadius: 10,
    width: '90%',
  },
  button: {
    marginTop: 10,
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
