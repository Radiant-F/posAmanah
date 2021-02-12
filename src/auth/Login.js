import React, {Component} from 'react';
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
} from 'react-native';
import {connect} from 'react-redux';
import AsyncStorage from '@react-native-community/async-storage';
import CheckBox from '@react-native-community/checkbox';

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
    };
  }

  remember() {
    AsyncStorage.setItem('token', this.state.token);
    AsyncStorage.setItem('role', this.state.role);
  }

  login() {
    if (this.state.email && this.state.password != '') {
      this.setState({loading: true});
      console.log('mencoba login..');
      const {email, password} = this.state;
      let kirimData = {email: email, password: password};
      fetch('https://mini-project-e.herokuapp.com/api/login', {
        method: 'POST',
        body: JSON.stringify(kirimData),
        headers: {
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((responseJSON) => {
          console.log(responseJSON);
          if (responseJSON.token != null) {
            this.props.changeUser({token: responseJSON.token});
            this.setState({
              role: responseJSON.user.role,
              token: responseJSON.token,
            });
            this.state.remember ? this.remember() : console.log('false');
            if (responseJSON.user.role == '2') {
              this.setState({loading: false});
              this.props.navigation.replace('Kasir', {
                screen: 'Kasir',
              });
            } else if (responseJSON.user.role == '1') {
              this.setState({loading: false});
              this.props.navigation.replace('Staff', {screen: 'Staff'});
            } else if (responseJSON.user.role == '3') {
              this.props.navigation.replace('Member', {
                screen: 'Member',
              });
            } else {
              this.props.navigation.replace('Pimpinan', {screen: 'Pimpinan'});
            }
          } else {
            this.setState({loading: false});
            this.alert();
          }
        })
        .catch((err) => console.log('Terjadi Kesalahan. ', err));
    } else {
      this.alert2();
    }
  }

  alert() {
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

  alert2() {
    Alert.alert(
      '',
      'Harap isi semua forum.',
      [
        {
          text: 'Ok',
        },
      ],
      {cancelable: false},
    );
  }

  loginDemo() {
    if (this.state.email && this.state.password != '') {
      this.state.check
        ? this.rememberDemo()
        : console.log('box tidak dicentang.');
      this.props.navigation.replace('Kasir');
    } else {
      this.alert2();
    }
  }

  rememberDemo() {
    AsyncStorage.setItem('password', this.state.password).catch((err) =>
      console.log(err),
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
                  placeholder="****"
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
                  onPress={() => this.props.navigation.navigate('Register')}>
                  Daftar
                </Text>
              </View>
              <TouchableNativeFeedback>
                <View style={styles.button}>
                  <Text style={styles.textButton}>Masuk</Text>
                </View>
              </TouchableNativeFeedback>
            </View>
          </View>
        </ImageBackground>
      </View>
    );
  }
}

const styles = StyleSheet.create({
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
  },
  textButton: {
    padding: 10,
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
