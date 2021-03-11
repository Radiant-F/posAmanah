import AsyncStorage from '@react-native-community/async-storage';
import React, {Component} from 'react';
import ImagePicker from 'react-native-image-picker';
import _ from 'lodash';
import LottieView from 'lottie-react-native';
import {
  Button,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Modal,
  TouchableNativeFeedback,
  Alert,
  TextInput,
  ActivityIndicator,
  ToastAndroid,
} from 'react-native';

export default class Member extends Component {
  constructor() {
    super();
    this.state = {
      test: 'Member',
      topup: 0,
      token: this.getToken(),
      data_user: '',
      data_member: '',
      name: '',
      email: '',
      phone_number: '',
      umur: '',
      address: '',
      image: '',
      photo: '',
      edited: false,
      modal: false,
      view_topup: false,
      loading: false,
      tombol: true,
      tombol_profil: false,
    };
  }

  toPrice(price) {
    return _.replace(price, /\B(?=(\d{3})+(?!\d))/g, '.');
  }

  getToken() {
    AsyncStorage.getItem('token').then((value) => {
      this.setState({token: value});
      this.getUser();
    });
  }

  getUser() {
    console.log('mengambil data..');
    fetch(`https://amanah-mart.herokuapp.com/api/me`, {
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
            data_user: responseJSON.data[0].user,
            data_member: responseJSON.data[0],
            name: responseJSON.data[0].user.name,
            umur: JSON.stringify(responseJSON.data[0].umur),
            phone_number: JSON.stringify(responseJSON.data[0].phone_number),
            email: responseJSON.data[0].user.email,
            address: responseJSON.data[0].address,
            image: responseJSON.data[0].image,
          });
          console.log(this.state.data_member);
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
      fetch(`https://amanah-mart.herokuapp.com/api/member/update`, {
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
            this.setState({tombol_profil: false});
            this.getUser();
          } else {
            console.log('profil gagal diperbarui');
            ToastAndroid.show('Foto harus diperbarui', ToastAndroid.SHORT);
            this.setState({tombol_profil: false});
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
      ToastAndroid.show('Mengkonfirmasi pembayaran..', ToastAndroid.SHORT);
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

  success() {
    Alert.alert('Sukses!', 'Terima kasih telah topup.', [{text: 'Ok'}], {
      cancelable: true,
    });
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

  render() {
    return (
      <View style={{flex: 1, backgroundColor: 'white'}}>
        <ImageBackground style={styles.bg}>
          <View style={{padding: 10}}>
            <View style={styles.header}>
              {this.state.image == '' ? (
                <Image
                  source={require('../../assets/react.png')}
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
                onPress={() => this.setState({modal: true})}>
                <Image
                  source={require('../../assets/settings-cogwheel-button.png')}
                  style={{...styles.imgIcon, tintColor: 'white'}}
                />
              </TouchableWithoutFeedback>
            </View>
            <Text style={{color: 'white'}}>
              Hai, {this.state.data_user.name}
            </Text>
            <Text style={{color: 'white', fontWeight: 'bold'}}>
              Member ID Anda: {this.state.data_member.member_id}
            </Text>
            <View
              style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
              <View style={styles.viewInfo}>
                <Text>Saldo anda:</Text>
                {this.state.data_member == '' ? (
                  <ActivityIndicator
                    style={{marginTop: 5}}
                    size="small"
                    color="orange"
                  />
                ) : (
                  <Text style={styles.textMoney}>
                    Rp {this.toPrice(this.state.data_member.saldo)},-
                  </Text>
                )}
              </View>
              <TouchableNativeFeedback
                onPress={() =>
                  this.setState({view_topup: !this.state.view_topup})
                }>
                <View style={styles.viewInfo}>
                  <Text>Top Up</Text>
                  {this.state.view_topup ? (
                    <Text style={styles.textMoney}>-</Text>
                  ) : (
                    <Text style={styles.textMoney}>+</Text>
                  )}
                </View>
              </TouchableNativeFeedback>
            </View>
            {this.state.view_topup ? (
              <View style={{marginBottom: 10}}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-evenly',
                  }}>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text> Rp. </Text>
                    <TextInput
                      selectTextOnFocus
                      keyboardType="decimal-pad"
                      maxLength={8}
                      onChangeText={(input) =>
                        this.setState({topup: input, tombol: false})
                      }
                      placeholder="min. 10.000"
                      underlineColorAndroid="white"
                    />
                    <Text>,-</Text>
                  </View>
                  {this.state.loading ? (
                    <View style={{...styles.button, backgroundColor: 'white'}}>
                      <ActivityIndicator color="lime" size="large" />
                    </View>
                  ) : (
                    <TouchableNativeFeedback
                      disabled={this.state.tombol}
                      onPress={() => this.topUp()}>
                      <View
                        style={{...styles.button, backgroundColor: 'white'}}>
                        <Text style={{textAlign: 'center'}}>Konfirmasi</Text>
                      </View>
                    </TouchableNativeFeedback>
                  )}
                </View>
              </View>
            ) : (
              <View></View>
            )}
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
                        {this.state.photo == '' ? (
                          <Image
                            source={{uri: this.state.data_member.image}}
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
            </View>
          </Modal>
        </ImageBackground>
        <LottieView
          source={require('../../assets/39611-coming-soon.json')}
          autoPlay
          style={{width: 480, height: 300, alignSelf: 'center', margin: 20}}
        />
      </View>
    );
  }
}

export const styles = StyleSheet.create({
  header: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  imgIcon: {
    width: 25,
    height: 25,
  },
  bg: {
    width: '100%',
    // height: 140,
    backgroundColor: 'orange',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  viewInfo: {
    marginVertical: 10,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    elevation: 5,
  },
  textMoney: {
    fontSize: 20,
    textAlign: 'center',
  },
  modal: {
    backgroundColor: 'white',
    width: '90%',
    borderRadius: 10,
    elevation: 3,
    padding: 10,
  },
  imgClose: {
    width: 20,
    height: 20,
  },
  button: {
    padding: 10,
    backgroundColor: 'tomato',
    borderRadius: 10,
    elevation: 5,
    width: 100,
    alignSelf: 'center',
    height: 50,
    justifyContent: 'center',
  },
  text: {
    textAlign: 'center',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    textShadowRadius: 1,
    textShadowColor: 'black',
    textShadowOffset: {
      width: 0.5,
      height: 0.5,
    },
  },
  viewHistory: {
    marginVertical: 10,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    elevation: 5,
  },
  imgPPP: {
    width: 90,
    height: 90,
    borderRadius: 90 / 2,
    borderColor: 'orange',
    borderWidth: 5,
  },
});
