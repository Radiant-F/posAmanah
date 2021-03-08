import React, {Component, useCallback} from 'react';
import {
  View,
  Text,
  Alert,
  StyleSheet,
  ImageBackground,
  TextInput,
  Image,
  TouchableOpacity,
  Button,
  TouchableNativeFeedback,
  Linking,
  ActivityIndicator,
  ToastAndroid,
  Modal,
} from 'react-native';
import {connect} from 'react-redux';
import AsyncStorage from '@react-native-community/async-storage';
import CheckBox from '@react-native-community/checkbox';

// const OpenURLButton = ({url, children}) => {
//   const handlePress = useCallback(async () => {
//     const supported = await Linking.canOpenURL(url);
//     if (supported) {
//       await Linking.openURL(url);
//     } else {
//       Alert.alert(`Don't know how to open this URL: ${url}`);
//     }
//   }, [url]);

//   return (
//     <TouchableOpacity style={{margin: 5}} onPress={handlePress}>
//       <Text style={{color: 'grey'}}>{children}</Text>
//     </TouchableOpacity>
//   );
// };

export class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      role: '',
      token: '',
      role: '',
      loading: false,
      remember: false,
      secure: true,
      check: false,
      modal: false,
      url: 'https://mail.google.com',
    };
  }

  login() {
    if (this.state.email && this.state.password != '') {
      this.setState({loading: true});
      console.log('mencoba login..');
      const {email, password} = this.state;
      let kirimData = {email: email, password: password};
      fetch('https://amanah-mart.herokuapp.com/api/login', {
        method: 'POST',
        body: JSON.stringify(kirimData),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((responseJSON) => {
          console.log(responseJSON);
          const {token} = responseJSON;
          const {role_id} = responseJSON.user;
          const token_user = ['token', token];
          const role_user = ['role', JSON.stringify(role_id)];
          if (responseJSON.token != null) {
            this.props.changeUser({token: token});
            this.state.check
              ? AsyncStorage.multiSet([token_user, role_user]).catch((err) =>
                  console.log(err),
                )
              : AsyncStorage.setItem('token', token).catch((err) =>
                  console.log(err),
                );
            if (responseJSON.user.role_id == 2) {
              this.setState({loading: false});
              this.props.navigation.replace('Pimpinan');
            } else if (responseJSON.user.role_id == 3) {
              this.setState({loading: false});
              this.props.navigation.replace('Staff');
            } else if (responseJSON.user.role_id == 4) {
              this.props.navigation.replace('Kasir');
            } else if (responseJSON.user.role_id == 5) {
              this.props.navigation.replace('Member');
            } else {
              this.failed();
            }
          } else {
            this.setState({loading: false});
            this.failed();
          }
        })
        .catch((err) => this.failed(err));
    } else {
      ToastAndroid.show('Isi dengan benar', ToastAndroid.SHORT);
    }
  }

  resetPass() {
    if (this.state.email != '') {
      this.setState({loading: true});
      console.log('mengirim email..');
      const {email} = this.state;
      var kirimData = {email: email};
      fetch(`https://amanah-mart.herokuapp.com/api/password/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(kirimData),
      })
        .then((response) => response.json())
        .then((responseJSON) => {
          console.log(responseJSON);
          if (responseJSON.status == 'Success') {
            console.log('berhasil mereset');
            this.setState({loading: false});
            this.success();
          } else {
            console.log('gagal mereset');
            this.setState({loading: false});
            this.failed();
          }
        })
        .catch((err) => this.fatal(err));
    } else {
      console.log('masukan email');
    }
  }

  success() {
    Alert.alert(
      'Sukses',
      'Password direset. Periksa gmail Anda.',
      [
        {
          text: 'Nanti Saja',
        },
        {
          text: 'Buka Gmail',
          onPress: () => this.handlePress(),
        },
      ],
      {cancelable: false},
    );
  }

  handlePress = async () => {
    const supported = await Linking.canOpenURL(this.state.url);
    if (supported) {
      await Linking.openURL(this.state.url);
    } else {
      Alert.alert(`URL Tidak Dikenali: ${this.state.url}`);
    }
  };

  failed(err) {
    console.log(err);
    this.setState({loading: false});
    Alert.alert(
      'Data tidak ditemukan',
      'Masukan data dengan benar atau daftar.',
      [
        {
          text: 'Daftar',
          onPress: () => this.props.navigation.navigate('Register'),
        },
        {
          text: 'Ok',
        },
      ],
      {cancelable: false},
    );
  }

  alert() {
    Alert.alert(
      '',
      'Harap isi semua form.',
      [
        {
          text: 'Ok',
        },
      ],
      {cancelable: false},
    );
  }

  fatal(err) {
    console.log(err);
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
      <View style={{flex: 1}}>
        <ImageBackground
          blurRadius={2}
          source={require('../assets/bgLogin.jpg')}
          style={styles.bg}>
          <View style={styles.mainView}>
            <View style={styles.subMainView}>
              <Text style={styles.mainText}>Login</Text>
              <TextInput
                placeholder="emailanda@contoh.com"
                underlineColorAndroid="orange"
                style={{width: '90%'}}
                onChangeText={(input) => this.setState({email: input})}
              />
              <View style={styles.viewPass}>
                <TextInput
                  placeholder="Kata Sandi"
                  underlineColorAndroid="orange"
                  secureTextEntry={this.state.secure}
                  style={{flex: 1}}
                  onChangeText={(input) => this.setState({password: input})}
                />
                {this.state.secure ? (
                  <TouchableOpacity
                    onPress={() => this.setState({secure: !this.state.secure})}>
                    <Image
                      source={require('../assets/lock.png')}
                      style={styles.imgLock}
                    />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => this.setState({secure: !this.state.secure})}>
                    <Image
                      source={require('../assets/unlock.png')}
                      style={styles.imgLock}
                    />
                  </TouchableOpacity>
                )}
              </View>
              <View style={styles.viewCheck}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <CheckBox
                    onValueChange={() =>
                      this.setState({check: !this.state.check})
                    }
                    value={this.state.check}
                    tintColors={{true: 'orange', false: 'black'}}
                  />
                  <Text>Ingat Saya</Text>
                </View>
                <Text
                  style={{fontWeight: 'bold'}}
                  onPress={() => this.props.navigation.navigate('Register')}>
                  Daftar
                </Text>
              </View>
              {this.state.loading ? (
                <View style={styles.button}>
                  <ActivityIndicator color="white" size="small" />
                </View>
              ) : (
                <TouchableNativeFeedback onPress={() => this.login()}>
                  <View style={styles.button}>
                    <Text style={styles.textButton}>Masuk</Text>
                  </View>
                </TouchableNativeFeedback>
              )}
              <TouchableOpacity
                style={{margin: 5}}
                onPress={() => this.setState({modal: true})}>
                <Text style={{color: 'grey'}}>Lupa Password?</Text>
              </TouchableOpacity>
              {/* <OpenURLButton url={this.state.url}>Lupa Password?</OpenURLButton> */}
            </View>
          </View>
          <Modal
            onRequestClose={() => this.setState({modal: false})}
            transparent
            visible={this.state.modal}
            animationType="fade">
            <View
              style={{
                justifyContent: 'center',
                alignItems: 'center',
                height: '100%',
                backgroundColor: '#00000069',
              }}>
              <View style={styles.modals}>
                <View style={styles.modalHeader}>
                  <Image
                    source={require('../assets/lock.png')}
                    style={styles.imgHeader}
                  />
                  <Text>Reset Password</Text>
                  <TouchableOpacity
                    onPress={() => this.setState({modal: false})}>
                    <Image
                      source={require('../assets/close-button.png')}
                      style={styles.imgHeader}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.modalContainer}>
                  <Text> Masukan Email Anda</Text>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Image
                      source={require('../assets/gmail-logo.png')}
                      style={{...styles.imgLock, marginHorizontal: 2.5}}
                    />
                    <TextInput
                      style={{flex: 1}}
                      underlineColorAndroid="orange"
                      placeholder="Email"
                      onChangeText={(input) => this.setState({email: input})}
                    />
                  </View>
                  <TouchableNativeFeedback
                    disabled={this.state.loading}
                    onPress={() => this.resetPass()}>
                    <View
                      style={{
                        ...styles.button,
                        width: 120,
                        alignSelf: 'center',
                      }}>
                      {this.state.loading ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Text style={styles.textButton}>Kirim Email</Text>
                      )}
                    </View>
                  </TouchableNativeFeedback>
                </View>
              </View>
            </View>
          </Modal>
        </ImageBackground>
      </View>
    );
  }
}

export const styles = StyleSheet.create({
  bg: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mainView: {
    width: '90%',
    backgroundColor: 'orange',
    borderRadius: 10,
    paddingBottom: 10,
    paddingTop: 5,
    elevation: 3,
  },
  subMainView: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
  },
  mainText: {
    textAlign: 'center',
    fontSize: 30,
    includeFontPadding: false,
    fontWeight: 'bold',
    color: 'orange',
    textShadowRadius: 1,
    textShadowColor: 'black',
    textShadowOffset: {
      width: 0.5,
      height: 0.5,
    },
  },
  imgLock: {
    width: 25,
    height: 25,
  },
  viewPass: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '90%',
  },
  viewCheck: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    justifyContent: 'space-between',
    width: '100%',
  },
  button: {
    elevation: 2,
    backgroundColor: 'orange',
    width: 100,
    borderRadius: 5,
    marginVertical: 5,
    height: 45,
    justifyContent: 'center',
  },
  textButton: {
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
  modals: {
    backgroundColor: 'white',
    width: '90%',
    borderRadius: 10,
    elevation: 3,
    padding: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  imgHeader: {
    width: 20,
    height: 20,
  },
  modalContainer: {
    marginVertical: 10,
  },
});

const mapStateToProps = (state) => {
  return {
    user: state,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    changeUser: (input) => dispatch({type: 'CHANGE_USER', payload: input}),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Login);
