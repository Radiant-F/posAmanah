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
} from 'react-native';

export default class Member extends Component {
  constructor() {
    super();
    this.state = {
      test: 'Member',
      saldo: 90000,
      modal: false,
    };
  }

  toPrice(price) {
    return _.replace(price, /\B(?=(\d{3})+(?!\d))/g, '.');
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

  confirmLogout() {
    Alert.alert;
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
            <Text style={{color: 'white'}}>Hai, Radiant</Text>
            <Text style={{color: 'white', fontWeight: 'bold'}}>
              081931314133
            </Text>
            <View
              style={{flexDirection: 'row', justifyContent: 'space-between'}}>
              <View style={styles.viewInfo}>
                <Text>Saldo anda:</Text>
                <Text style={styles.textMoney}>
                  Rp {this.toPrice(this.state.saldo)},-
                </Text>
              </View>
              <View style={{...styles.viewInfo, width: '55%'}}>
                <Text>Promo Hari Ini!</Text>
                <Text style={styles.textMoney}></Text>
              </View>
            </View>
            <View style={styles.viewHistory}>
              <Text>Riwayat Pembelian</Text>
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

const styles = StyleSheet.create({
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
    height: 140,
    backgroundColor: 'orange',
  },
  viewInfo: {
    marginVertical: 10,
    backgroundColor: 'white',
    padding: 10,
    borderRadius: 10,
    elevation: 5,
    width: '40%',
  },
  textMoney: {
    fontSize: 20,
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
    elevation: 3,
    width: 100,
    alignSelf: 'center',
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
