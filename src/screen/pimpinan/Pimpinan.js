import AsyncStorage from '@react-native-community/async-storage';
import React, {Component} from 'react';
import ImagePicker from 'react-native-image-picker';
import TopTab from '../../router/TopTabPimpinan';
import {
  ImageBackground,
  Text,
  View,
  TouchableWithoutFeedback,
  TouchableOpacity,
  TouchableNativeFeedback,
  Image,
  Modal,
  TextInput,
  Button,
  StyleSheet,
  ToastAndroid,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {styles} from '../member/Member';

export default class Pimpinan extends Component {
  constructor() {
    super();
    this.state = {
      keuangan: [],
      laporan_bulan: '',
      pengeluaran: '',
      name: '',
      email: '',
      phone_number: '',
      umur: '',
      address: '',
      image: '',
      photo: null,
      tombol_profil: false,
      modal: false,
      awal: '2021-02-24',
      akhir: '2021-02-25',
      token: this.getToken(),
    };
  }

  getToken() {
    AsyncStorage.getItem('token')
      .then((value) => {
        this.setState({token: value});
        this.getLaporanPerbulan();
      })
      .catch((err) => console.log(err));
  }

  getUser() {
    console.log('memuat data user..');
    fetch(`https://amanah-mart.herokuapp.com/api/me`, {
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
          console.log('data user dimuat');
        } else {
          console.log('data user gagal dimuat');
        }
      })
      .catch((err) => this.fatal(err));
  }

  updateProfil() {
    console.log('memperbarui profil..');
    ToastAndroid.show('Memperbarui profil.. Harap tunggu', ToastAndroid.SHORT);
    this.setState({tombol_profil: true});
    const {name, email, phone_number, umur, address} = this.state;
    var kirimData = {
      name: name,
      email: email,
      phone_number: phone_number,
      umur: umur,
      address: address,
    };
    fetch(`https://amanah-mart.herokuapp.com/api/member/update`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.state.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(kirimData),
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        if (responseJSON.status == 'Success') {
          console.log('profil diperbarui');
          ToastAndroid.show('Profil diperbarui', ToastAndroid.SHORT);
          this.setState({tombol_profil: false});
        } else {
          console.log('profil gagal diperbarui');
          ToastAndroid.show('Foto harus diperbarui', ToastAndroid.SHORT);
          this.setState({tombol_profil: false});
        }
      })
      .catch((err) => console.log(err));
  }

  createFormData = (photo, body) => {
    const data = new FormData();
    data.append('image', {
      name: photo.fileName,
      type: photo.type,
      uri:
        Platform.OS === 'android'
          ? photo.uri
          : photo.uri.replace('file://', ''),
    });
    Object.keys(body).forEach((key) => {
      data.append(key, body[key]);
    });
    return data;
  };

  handleEditPhoto = () => {
    const options = {
      noData: true,
    };
    ImagePicker.showImagePicker(options, (response) => {
      if (response.uri) {
        this.setState({photo: response});
        console.log(JSON.stringify(response.fileName));
      }
    });
  };

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
          this.setState({keuangan: responseJSON.data});
          console.log(this.state.keuangan);
        } else {
          console.log('data gagal diambil');
        }
      })
      .catch((err) => console.log(err));
  }

  getKeuanganTgl() {
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
      })
      .catch((err) => console.log(err));
  }

  getLaporanPerbulan() {
    console.log('memuat data laporan bulan ini..');
    fetch(`https://amanah-mart.herokuapp.com/api/laporan`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.state.token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        if (responseJSON.status == 'Success') {
          console.log('data perbulan dimuat');
          this.setState({laporan_bulan: responseJSON.data});
          console.log(this.state.laporan_bulan);
        } else {
          console.log('data perbulan gagal dimuat');
        }
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
        console.log(responseJSON);
      })
      .catch((err) => console.log(err));
  }

  logout() {
    this.setState({modal: false});
    AsyncStorage.multiGet(['token', 'role'])
      .then((value) => {
        if (value[0][1] != null) {
          AsyncStorage.multiRemove(['token', 'role']).catch((err) =>
            console.log(err),
          );
          console.log('user keluar menghilangkan jejak');
          this.props.navigation.replace('Login');
        } else {
          console.log('user keluar tanpa jejak');
          this.props.navigation.replace('Login');
        }
      })
      .catch((err) => console.log(err));
  }

  fatal(err) {
    console.log(err);
    Alert.alert(
      'Waktu Permintaan Habis',
      'Harap periksa koneksi Anda lalu coba lagi.',
      [{text: 'Ok'}, {text: 'Ulangi', onPress: () => this.getUser()}],
      {cancelable: true},
    );
    this.setState({tombol_profil: false});
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <ImageBackground style={styles.bg}>
          <View style={{padding: 10}}>
            <View style={styles.header}>
              {this.state.image == '' ? (
                <Image
                  source={require('../../assets/react.png')}
                  style={styles.imgIcon}
                />
              ) : (
                <Image source={this.state.image.uri} style={styles.imgIcon} />
              )}
              <Text style={{color: 'white'}}>Amanah Mart</Text>
              <TouchableWithoutFeedback
                onPress={() => this.setState({modal: true})}>
                <Image
                  source={require('../../assets/settings-cogwheel-button.png')}
                  style={{...styles.imgIcon, tintColor: 'white'}}
                />
              </TouchableWithoutFeedback>
            </View>
            <View style={gaya.viewMoney}>
              <View>
                <View
                  style={{
                    ...gaya.viewDebitKredit,
                    marginBottom: 10,
                    alignItems: 'center',
                  }}>
                  <Text>Laporan Bulan Ini</Text>
                </View>
                <View style={gaya.viewSaldo}>
                  <Text>Saldo:</Text>
                  {this.state.laporan_bulan == '' ? (
                    <ActivityIndicator size="small" color="lime" />
                  ) : (
                    <Text style={gaya.textMoney}>
                      Rp {this.state.laporan_bulan.saldo.saldo},-
                    </Text>
                  )}
                </View>
              </View>
              <View>
                <View style={gaya.viewDebitKredit}>
                  {this.state.laporan_bulan == '' ? (
                    <ActivityIndicator size="small" color="lime" />
                  ) : (
                    <Text>
                      Penjualan: Rp {this.state.laporan_bulan.jumlah_penjualan}
                    </Text>
                  )}
                </View>
                <View style={{margin: 5}}></View>
                <View style={gaya.viewDebitKredit}>
                  {this.state.laporan_bulan == '' ? (
                    <ActivityIndicator size="small" color="lime" />
                  ) : (
                    <Text>
                      Pembelian: Rp {this.state.laporan_bulan.jumlah_pembelian}
                    </Text>
                  )}
                </View>
                <View style={{margin: 5}}></View>
                <View style={gaya.viewDebitKredit}>
                  {this.state.laporan_bulan == '' ? (
                    <ActivityIndicator size="small" color="lime" />
                  ) : (
                    <Text>
                      Pengeluaran: Rp{' '}
                      {this.state.laporan_bulan.jumlah_pengeluaran}
                    </Text>
                  )}
                </View>
              </View>
            </View>
          </View>
          <Modal
            visible={this.state.modal}
            transparent
            onRequestClose={() => this.setState({modal: false})}
            animationType="fade">
            <View
              style={{
                justifyContent: 'center',
                height: '100%',
                alignItems: 'center',
              }}>
              <View style={styles.modal}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 10,
                  }}>
                  <Image
                    source={require('../../assets/round-account-button-with-user-inside.png')}
                    style={styles.imgClose}
                  />
                  <Text>Pengaturan Profil</Text>
                  <TouchableOpacity
                    onPress={() => this.setState({modal: false})}>
                    <Image
                      source={require('../../assets/close-button.png')}
                      style={styles.imgClose}
                    />
                  </TouchableOpacity>
                </View>
                <View style={{width: '100%'}}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                    <View>
                      <TouchableNativeFeedback
                        onPress={() => this.handleEditPhoto()}>
                        {this.state.photo == null ? (
                          <Image
                            source={require('../../assets/plainAvatar.png')}
                            style={gaya.imgProfil}
                          />
                        ) : (
                          <Image
                            source={{uri: this.state.photo.uri}}
                            style={gaya.imgProfil}
                          />
                        )}
                      </TouchableNativeFeedback>
                    </View>
                    <View>
                      <View style={{flexDirection: 'row'}}>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}>
                          <Image
                            source={require('../../assets/user-shape.png')}
                            style={{...styles.imgIcon, marginRight: 5}}
                          />
                          <TextInput
                            value={this.state.name}
                            maxLength={10}
                            underlineColorAndroid="orange"
                            placeholder="Nama Anda"
                            onChangeText={(input) =>
                              this.setState({name: input})
                            }
                          />
                        </View>
                        <View
                          style={{flexDirection: 'row', alignItems: 'center'}}>
                          <Text>|</Text>
                          <TextInput
                            value={this.state.umur}
                            maxLength={3}
                            underlineColorAndroid="orange"
                            placeholder="Umur Anda"
                            onChangeText={(input) =>
                              this.setState({umur: input})
                            }
                          />
                        </View>
                      </View>
                      <View
                        style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Image
                          source={require('../../assets/gmail-logo.png')}
                          style={{...styles.imgIcon, marginRight: 5}}
                        />
                        <TextInput
                          style={{flex: 1}}
                          value={this.state.email}
                          underlineColorAndroid="orange"
                          placeholder="Email Anda"
                          onChangeText={(input) =>
                            this.setState({email: input})
                          }
                        />
                      </View>
                      <View
                        style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Image
                          source={require('../../assets/phone-call-button.png')}
                          style={{...styles.imgIcon, marginRight: 5}}
                        />
                        <TextInput
                          style={{flex: 1}}
                          value={this.state.phone_number}
                          underlineColorAndroid="orange"
                          placeholder="Nomor Anda"
                          onChangeText={(input) =>
                            this.setState({phone_number: input})
                          }
                        />
                      </View>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-around',
                  }}>
                  <TouchableNativeFeedback
                    disabled={this.state.tombol_profil}
                    onPress={() => this.logout()}>
                    <View style={styles.button}>
                      <Text style={styles.text}>Keluar</Text>
                    </View>
                  </TouchableNativeFeedback>
                  <TouchableNativeFeedback
                    disabled={this.state.tombol_profil}
                    onPress={() => this.updateProfil()}>
                    <View style={{...styles.button, backgroundColor: 'lime'}}>
                      <Text style={styles.text}>Perbarui</Text>
                    </View>
                  </TouchableNativeFeedback>
                </View>
              </View>
            </View>
          </Modal>
        </ImageBackground>
        <TopTab />
      </View>
    );
  }
}

const gaya = StyleSheet.create({
  imgProfil: {
    width: 90,
    height: 90,
    borderRadius: 90 / 2,
    borderColor: 'orange',
    borderWidth: 5,
  },
  viewMoney: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  viewSaldo: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    elevation: 3,
  },
  viewDebitKredit: {
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 5,
    elevation: 3,
    paddingHorizontal: 10,
  },
  textMoney: {
    fontSize: 20,
  },
});
