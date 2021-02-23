import AsyncStorage from '@react-native-community/async-storage';
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
      modal: false,
      modalOption: false,
      name: '',
      email: '',
      password: '',
      umur: 0,
      address: '',
      phone_number: 0,
      loading: false,
      token: this.getToken(),
    };
  }

  getToken() {
    AsyncStorage.getItem('token')
      .then((value) => {
        console.log(value);
        this.setState({token: value});
      })
      .catch((err) => console.log(err));
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

  logout() {
    this.setState({modal: false});
    AsyncStorage.multiGet(['token', 'role'])
      .then((value) => {
        if (value[0][1] != null) {
          AsyncStorage.multiRemove(['token', 'role']).catch((err) =>
            console.log(err),
          );
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
              <Image
                source={require('../../assets/plainAvatar.png')}
                style={styles.imgIcon}
              />
              <Text style={{color: 'white'}}>Amanah Mart</Text>
              <TouchableWithoutFeedback
                onPress={() => this.setState({modalOption: true})}>
                <Image
                  source={require('../../assets/settings-cogwheel-button.png')}
                  style={{...styles.imgIcon, tintColor: 'white'}}
                />
              </TouchableWithoutFeedback>
            </View>
            <TouchableNativeFeedback
              onPress={() => this.setState({modal: true})}>
              <View style={{...gaya.buttonAdd, marginBottom: 10}}>
                <Text>+ Tambah Member</Text>
              </View>
            </TouchableNativeFeedback>
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
            {/* MODAL USER OPTION */}
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
                  <TouchableNativeFeedback onPress={() => this.logout()}>
                    <View style={styles.button}>
                      <Text style={styles.text}>Keluar</Text>
                    </View>
                  </TouchableNativeFeedback>
                </View>
              </View>
            </Modal>
            {/* MODAL USER OPTION */}
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
