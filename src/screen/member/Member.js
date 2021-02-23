import AsyncStorage from '@react-native-community/async-storage';
import React, {Component} from 'react';
import _ from 'lodash';
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
      modal: false,
      view_topup: false,
      loading: false,
      tombol: true,
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
    fetch(`https://amanah-mart.herokuapp.com/api/user`, {
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
            data_member: responseJSON.data.Member,
            data_user: responseJSON.data.User,
          });
          console.log('data dimuat');
        } else {
          console.log('data gagal dimuat');
        }
      })
      .catch((err) => console.log(err));
  }

  topUp() {
    if (this.state.topup >= 10000) {
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
            this.success();
            this.getUser();
          } else {
            ToastAndroid.show('Periksa koneksi Anda', ToastAndroid.LONG);
            console.log('topup gagal');
          }
        })
        .catch((err) => console.log(err));
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

  render() {
    return (
      <View style={{flex: 1}}>
        <ImageBackground style={styles.bg}>
          <View style={{padding: 10}}>
            <View style={styles.header}>
              <Image
                source={require('../../assets/react.png')}
                style={styles.imgIcon}
              />
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
            {/* <View style={styles.viewHistory}>
              <Text>Riwayat Pembelian</Text>
            </View> */}
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
                <TouchableNativeFeedback onPress={() => this.logout()}>
                  <View style={styles.button}>
                    <Text style={styles.text}>Keluar</Text>
                  </View>
                </TouchableNativeFeedback>
              </View>
            </View>
          </Modal>
        </ImageBackground>
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
});
