import React, {Component} from 'react';
import {
  View,
  Text,
  Alert,
  ImageBackground,
  TextInput,
  Image,
  TouchableOpacity,
  TouchableNativeFeedback,
  Linking,
  ActivityIndicator,
} from 'react-native';
import {styles} from './Login';
import {Picker} from '@react-native-picker/picker';

export default class RegisterMember extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      email: '',
      password: '',
      password_confirmation: '',
      loading: false,
      remember: false,
      secure: true,
      secure2: true,
      member: false,
      url: 'https://mail.google.com',
    };
  }

  register() {
    if (
      this.state.name &&
      this.state.email &&
      this.state.password &&
      this.state.password_confirmation != ''
    ) {
      const {name, email, password, password_confirmation} = this.state;
      var dataToSend = {
        name: name,
        email: email,
        password: password,
        password_confirmation: password_confirmation,
      };
      console.log('mendaftar...');
      this.setState({loading: true});
      fetch('https://amanah-mart.herokuapp.com/api/registermember', {
        method: 'POST',
        body: JSON.stringify(dataToSend),
        headers: {
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

  success() {
    Alert.alert(
      'Sukses',
      'Registrasi berhasil! Harap konfirmasi email untuk masuk.',
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
    this.props.navigation.goBack();
  }

  handlePress = async () => {
    const supported = await Linking.canOpenURL(this.state.url);
    if (supported) {
      await Linking.openURL(this.state.url);
    } else {
      Alert.alert(`Don't know how to open this URL: ${this.state.url}`);
    }
  };

  render() {
    return (
      <View style={{flex: 1}}>
        <ImageBackground
          blurRadius={2}
          source={require('../assets/bgLogin.jpg')}
          style={styles.bg}>
          <View style={styles.mainView}>
            <View style={styles.subMainView}>
              <Text style={styles.mainText}>Register Member</Text>
              <TextInput
                placeholder="Nama Anda"
                underlineColorAndroid="orange"
                style={{width: '90%'}}
                onChangeText={(input) => this.setState({name: input})}
              />
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
              <View style={styles.viewPass}>
                <TextInput
                  placeholder="Konfirmasi Kata Sandi"
                  underlineColorAndroid="orange"
                  secureTextEntry={this.state.secure2}
                  style={{flex: 1}}
                  onChangeText={(input) =>
                    this.setState({password_confirmation: input})
                  }
                />
                {this.state.secure2 ? (
                  <TouchableOpacity
                    onPress={() =>
                      this.setState({secure2: !this.state.secure2})
                    }>
                    <Image
                      source={require('../assets/lock.png')}
                      style={styles.imgLock}
                    />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() =>
                      this.setState({secure2: !this.state.secure2})
                    }>
                    <Image
                      source={require('../assets/unlock.png')}
                      style={styles.imgLock}
                    />
                  </TouchableOpacity>
                )}
              </View>
              {/* <View
                style={{
                  width: '90%',
                  borderBottomColor: 'orange',
                  borderBottomWidth: 2,
                }}>
                <Text style={{marginTop: 5}}>Daftar Sebagai:</Text>
                <Picker
                  mode="dialog"
                  selectedValue={this.state.daftar_role}
                  onValueChange={(value, index) =>
                    this.setState({daftar_role: value})
                  }>
                  <Picker.Item label="= Pilih Peran Anda =" value={0} />
                  <Picker.Item label="Sebagai Member" value={5} />
                  <Picker.Item label="Sebagai Staff" value={3} />
                  <Picker.Item label="Sebagai Kasir" value={4} />
                </Picker>
              </View> */}
              {this.state.loading ? (
                <View style={{...styles.button, marginVertical: 10}}>
                  <ActivityIndicator color="white" size="small" />
                </View>
              ) : (
                <TouchableNativeFeedback onPress={() => this.register()}>
                  <View style={{...styles.button, marginVertical: 10}}>
                    <Text style={styles.textButton}>Daftar</Text>
                  </View>
                </TouchableNativeFeedback>
              )}
              <Text
                style={{fontWeight: 'bold'}}
                onPress={() => this.props.navigation.goBack()}>
                Masuk
              </Text>
            </View>
          </View>
        </ImageBackground>
      </View>
    );
  }
}
