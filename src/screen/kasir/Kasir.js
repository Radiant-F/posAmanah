import AsyncStorage from '@react-native-community/async-storage';
import ImagePicker from 'react-native-image-picker';
import React, {Component} from 'react';
import {
  Button,
  ImageBackground,
  Text,
  View,
  Image,
  TouchableWithoutFeedback,
  TouchableNativeFeedback,
  TouchableOpacity,
  Modal,
  StyleSheet,
  TextInput,
  Alert,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import {styles} from '../member/Member';
import {gaya} from '../staff/Staff';
import TopTab from '../../router/TopTabKasir';
export default class Kasir extends Component {
  constructor() {
    super();
    this.state = {
      daftar_barang: [],
      name: '',
      email: '',
      password: '',
      umur: '',
      address: '',
      phone_number: '',
      image: '',
      photo: '',
      status: 0,
      tombol: false,
      modal: false,
      modalOption: false,
      edited: false,
      loading: false,
      absent: false,
      loading_absen: false,
      loading_absent: false,
      view_topup: false,
      token: this.getToken(),
    };
  }

  getToken() {
    AsyncStorage.getItem('token')
      .then((value) => {
        this.setState({token: value});
        this.getUser();
      })
      .catch((err) => console.log(err));
  }

  checkin() {
    console.log('checkin..');
    this.setState({loading_absen: true});
    fetch(`https://amanah-mart.herokuapp.com/api/checkin`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.state.token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        console.log(responseJSON);
        if (responseJSON.message == 'minggu minggu kok kerja') {
          console.log('libur woy');
          this.alertAbsenLibur();
          this.setState({
            loading_absen: false,
          });
        } else if (responseJSON.message == 'berhasil absen anda wahai kasir') {
          console.log('sudah absen');
          ToastAndroid.show('Selamat bekerja!', ToastAndroid.LONG);
          this.setState({
            loading_absen: false,
            status: 1,
            tombol: true,
          });
        } else if (
          responseJSON.message == 'gak usah kerajinan anda sudah absen hey'
        ) {
          ToastAndroid.show('Anda sudah absen', ToastAndroid.SHORT);
          this.setState({
            loading_absen: false,
            status: 1,
            tombol: true,
          });
        }
      })
      .catch((err) => this.absen(err));
  }

  checkout() {
    console.log('checkout..');
    this.setState({loading_absent: true});
    fetch(`https://amanah-mart.herokuapp.com/api/checkout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.state.token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        console.log(responseJSON);
        if (responseJSON.message == 'masuk dulu baru absen pulang bos') {
          ToastAndroid.show('Dahulukan absen masuk', ToastAndroid.SHORT);
          this.setState({absent: true, loading_absent: false});
        } else if (responseJSON.message == 'belom waktunya pulang bos') {
          ToastAndroid.show('Belum waktunya pulang!', ToastAndroid.SHORT);
          this.setState({loading_absent: false});
        } else {
          this.setState({absent: true, loading_absent: false});
          ToastAndroid.show('Selamat beristirahat', ToastAndroid.SHORT);
        }
      })
      .catch((err) => console.log(err));
  }

  getUser() {
    console.log('mengambil data..');
    fetch(`https://amanah-mart.herokuapp.com/api/karyawan`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.state.token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        if (responseJSON.status == 'Success') {
          this.setState({
            name: responseJSON.data.User.name,
            umur: JSON.stringify(responseJSON.data.Karyawan.umur),
            phone_number: JSON.stringify(
              responseJSON.data.Karyawan.phone_number,
            ),
            email: responseJSON.data.User.email,
            address: responseJSON.data.Karyawan.address,
            image: responseJSON.data.Karyawan.image,
          });
          console.log('data dimuat');
        } else {
          console.log('data gagal dimuat');
        }
      })
      .catch((err) => console.log(err));
  }

  updateProfil() {
    if (this.state.edited != false) {
      const {name, email, phone_number, umur, address, photo} = this.state;
      console.log('memperbarui profil..');
      this.setState({tombol_profil: true});
      var kirimData = {
        name: name,
        email: email,
        phone_number: phone_number,
        umur: umur,
        address: address,
      };
      fetch(`https://amanah-mart.herokuapp.com/api/karyawan/update`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.state.token}`,
        },
        body: this.createFormData(photo, kirimData),
      })
        .then((response) => response.json())
        .then((responseJSON) => {
          if (responseJSON.status == 'Success') {
            console.log('profil diperbarui');
            ToastAndroid.show('Profil diperbarui', ToastAndroid.SHORT);
            this.setState({tombol_profil: false, edited: false});
            this.getUser();
          } else {
            console.log('profil gagal diperbarui');
            ToastAndroid.show('Kesalahan koneksi..', ToastAndroid.SHORT);
            this.setState({tombol_profil: false, edited: false});
          }
        })
        .catch((err) => this.fatal(err));
    } else {
      ToastAndroid.show('Foto harus diperbarui', ToastAndroid.SHORT);
      console.log('error');
    }
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
        this.setState({photo: response, edited: true});
        console.log(JSON.stringify(response.fileName));
      }
    });
  };

  topUp() {
    if (this.state.topup >= 10000) {
      this.setState({tombol: true});
      console.log('mentopup..');
      const {topup} = this.state;
      var data = {topup: topup};
      fetch(
        `https://amanah-mart.herokuapp.com/api/member/topup/${this.state.data_member.member_id}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.state.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        },
      )
        .then((response) => response.json())
        .then((responseJSON) => {
          if (responseJSON.status == 'Success') {
            console.log('topup sukses');
            this.setState({tombol: false});
            this.success();
            this.getUser();
          } else {
            ToastAndroid.show('Periksa koneksi Anda', ToastAndroid.LONG);
            this.setState({tombol: false});
            console.log('topup gagal');
          }
        })
        .catch((err) => this.fatal(err));
    } else {
      ToastAndroid.show('Nominal minimal adalah 10rb', ToastAndroid.LONG);
    }
  }

  register() {
    if (
      this.state.umur &&
      this.state.phone_number != 0 &&
      this.state.name &&
      this.state.email &&
      this.state.password &&
      this.state.address != ''
    ) {
      const {umur, phone_number, name, email, password, address} = this.state;
      var dataToSend = {
        name: name,
        email: email,
        password: password,
        umur: umur,
        address: address,
        phone_number: phone_number,
      };
      console.log('mendaftar...');
      this.setState({loading: true});
      fetch('https://amanah-mart.herokuapp.com/api/member', {
        method: 'POST',
        body: JSON.stringify(dataToSend),
        headers: {
          Authorization: `Bearer ${this.state.token}`,
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((responseJson) => {
          console.log(responseJson);
          if (responseJson.status == 'success') {
            this.setState({loading: false});
            this.success();
          } else {
            this.setState({loading: false});
            this.failed();
          }
        })
        .catch((error) => {
          console.log(error);
          this.setState({loading: false});
          this.error();
        });
    } else {
      ToastAndroid.show('Harap isi dengan benar', ToastAndroid.SHORT);
    }
  }

  success() {
    Alert.alert('Sukses!', 'Member terdaftar.', [{text: 'Ok'}], {
      cancelable: true,
    });
  }
  failed() {
    Alert.alert(
      'Gagal',
      'Email sudah diambil.',
      [
        {
          text: 'Ok',
        },
      ],
      {cancelable: true},
    );
  }
  error() {
    Alert.alert(
      'Gagal',
      'Periksa koneksi Anda!',
      [
        {
          text: 'Ok',
        },
      ],
      {cancelable: true},
    );
  }
  alertAbsenLibur() {
    this.setState({loading_absen: false});
    Alert.alert(
      'Libur',
      'Bekerja untuk hidup. Bukan hidup untuk bekerja.',
      [
        {
          text: 'Ok',
        },
      ],
      {cancelable: true},
    );
  }
  absen(err) {
    console.log(err);
    this.setState({loading_absen: false});
    Alert.alert(
      'Sudah',
      'Anda sudah absen.',
      [
        {
          text: 'Ok',
        },
      ],
      {cancelable: true},
    );
  }
  absenCheckout() {
    this.setState({loading_absen: false});
    Alert.alert(
      'Sudah',
      'Anda sudah absen. Istirahatlah.',
      [
        {
          text: 'Ok',
        },
      ],
      {cancelable: true},
    );
  }
  fatal(err) {
    console.log(err);
    this.setState({tombol_profil: false, tombol: false});
    Alert.alert(
      'Koneksi Tidak Stabil',
      'Coba lagi beberapa saat.',
      [
        {
          text: 'Ok',
        },
      ],
      {cancelable: false},
    );
  }
  logout() {
    this.setState({modal: false});
    AsyncStorage.multiGet(['token', 'role'])
      .then((value) => {
        if (value[0][1] != null) {
          AsyncStorage.multiRemove([
            'token',
            'role',
            'absen',
            'absen checkout',
            'status',
          ]).catch((err) => console.log(err));
          console.log('data user dihapus');
          this.props.navigation.replace('Login');
        } else {
          console.log('user keluar tanpa jejak');
          this.props.navigation.replace('Login');
        }
      })
      .catch((err) => console.log(err));
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <ImageBackground style={styles.bg}>
          <View style={{padding: 10}}>
            <View style={styles.header}>
              {this.state.image == '' ? (
                <Image
                  source={require('../../assets/plainAvatar.png')}
                  style={styles.imgIcon}
                />
              ) : (
                <Image
                  source={{uri: this.state.image}}
                  style={styles.imgIcon}
                />
              )}
              <Text style={{color: 'white'}}>Amanah Mart</Text>
              <TouchableWithoutFeedback
                onPress={() => this.setState({modalOption: true})}>
                <Image
                  source={require('../../assets/settings-cogwheel-button.png')}
                  style={{...styles.imgIcon, tintColor: 'white'}}
                />
              </TouchableWithoutFeedback>
            </View>
            <View
              style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
              <TouchableNativeFeedback
                onPress={() => this.setState({modal: true})}>
                <View style={{...gaya.buttonAdd, marginBottom: 10}}>
                  <Text>+ Daftarkan Member</Text>
                </View>
              </TouchableNativeFeedback>
            </View>
            <TouchableNativeFeedback
              disabled={this.state.tombol}
              onPress={() => this.checkin()}>
              <View>
                {this.state.loading_absen ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <View>
                    {this.state.status == 1 ? (
                      <Text>Selamat Bekerja</Text>
                    ) : (
                      <Text>Check In</Text>
                    )}
                  </View>
                )}
              </View>
            </TouchableNativeFeedback>
            <View>
              <TouchableNativeFeedback onPress={() => this.checkout()}>
                <View>
                  {this.state.loading_absent ? (
                    <ActivityIndicator color="white" size="small" />
                  ) : (
                    <Text>Check Out</Text>
                  )}
                </View>
              </TouchableNativeFeedback>
            </View>
            <Modal
              visible={this.state.modal}
              transparent
              onRequestClose={() => this.setState({modal: false})}
              animationType="fade">
              <View style={alus.mainViewModal}>
                <View style={alus.viewModal}>
                  <View style={gaya.headerModal}>
                    <Image
                      source={require('../../assets/round-account-button-with-user-inside.png')}
                      style={styles.imgClose}
                    />
                    <Text>Tambah Member</Text>
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
                        justifyContent: 'space-between',
                      }}>
                      <View style={{width: '48%'}}>
                        <Text> Nama</Text>
                        <TextInput
                          underlineColorAndroid="orange"
                          placeholder="Nama Member"
                          onChangeText={(input) => this.setState({name: input})}
                        />
                      </View>
                      <View style={{width: '48%'}}>
                        <Text> Umur</Text>
                        <TextInput
                          keyboardType="decimal-pad"
                          underlineColorAndroid="orange"
                          placeholder="Umur Member"
                          onChangeText={(input) => this.setState({umur: input})}
                        />
                      </View>
                    </View>
                    <Text> Email</Text>
                    <TextInput
                      underlineColorAndroid="orange"
                      placeholder="contoh@gmail.com"
                      onChangeText={(input) => this.setState({email: input})}
                    />
                    <Text> Alamat</Text>
                    <TextInput
                      underlineColorAndroid="orange"
                      placeholder="Alamat Member"
                      onChangeText={(input) => this.setState({address: input})}
                    />
                    <Text> Nomor Telepon</Text>
                    <TextInput
                      keyboardType="decimal-pad"
                      underlineColorAndroid="orange"
                      placeholder="Nomor Member"
                      onChangeText={(input) =>
                        this.setState({phone_number: input})
                      }
                    />
                    <Text> Password</Text>
                    <TextInput
                      secureTextEntry
                      underlineColorAndroid="orange"
                      placeholder="Password Member"
                      onChangeText={(input) => this.setState({password: input})}
                    />
                    {this.state.loading ? (
                      <ActivityIndicator
                        size="small"
                        style={{height: 40}}
                        color="orange"
                      />
                    ) : (
                      <Button
                        title="daftarkan member"
                        onPress={() => this.register()}
                      />
                    )}
                  </View>
                </View>
              </View>
            </Modal>
            <Modal
              visible={this.state.modalOption}
              transparent
              onRequestClose={() => this.setState({modalOption: false})}
              animationType="fade">
              <View style={gaya.mainViewModal}>
                <View style={{...styles.modal, alignItems: 'center'}}>
                  <View style={gaya.headerModal}>
                    <Image
                      source={require('../../assets/round-account-button-with-user-inside.png')}
                      style={styles.imgClose}
                    />
                    <Text>Pengaturan Profil</Text>
                    <TouchableOpacity
                      onPress={() => this.setState({modalOption: false})}>
                      <Image
                        source={require('../../assets/close-button.png')}
                        style={styles.imgClose}
                      />
                    </TouchableOpacity>
                  </View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}>
                    <View>
                      <TouchableNativeFeedback
                        onPress={() => this.handleEditPhoto()}>
                        {this.state.photo == '' ? (
                          <Image
                            source={{uri: this.state.image}}
                            style={styles.imgPPP}
                          />
                        ) : (
                          <Image
                            source={{uri: this.state.photo.uri}}
                            style={styles.imgPPP}
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
                            keyboardType="decimal-pad"
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
                          keyboardType="decimal-pad"
                          underlineColorAndroid="orange"
                          placeholder="Nomor Anda"
                          onChangeText={(input) =>
                            this.setState({phone_number: input})
                          }
                        />
                      </View>
                    </View>
                  </View>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Image
                      source={require('../../assets/map-placeholder.png')}
                      style={{...styles.imgIcon, marginRight: 5}}
                    />
                    <TextInput
                      value={this.state.address}
                      placeholder="Alamat"
                      underlineColorAndroid="orange"
                      style={{flex: 1}}
                      onChangeText={(input) => this.setState({address: input})}
                    />
                  </View>
                  <View
                    style={{
                      width: '100%',
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
                        {this.state.tombol_profil ? (
                          <ActivityIndicator size="small" color="white" />
                        ) : (
                          <Text style={styles.text}>Perbarui</Text>
                        )}
                      </View>
                    </TouchableNativeFeedback>
                  </View>
                </View>
              </View>
            </Modal>
          </View>
        </ImageBackground>
        <TopTab />
      </View>
    );
  }
}

const alus = StyleSheet.create({
  mainViewModal: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00000040',
  },
  viewModal: {
    backgroundColor: 'white',
    width: '90%',
    borderRadius: 10,
    elevation: 3,
    padding: 10,
    alignItems: 'center',
  },
});
