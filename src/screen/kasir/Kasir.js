import AsyncStorage from '@react-native-community/async-storage';
import React, {Component} from 'react';
import {Button, Text, View} from 'react-native';

export default class Kasir extends Component {
  constructor() {
    super();
    this.state = {
      password: '',
    };
  }

  componentDidMount() {
    AsyncStorage.getItem('password').then((value) => {
      if (value) {
        this.setState({password: value});
      } else {
        console.log('tidak ada yang disimpan.');
      }
    });
  }

  logout() {
    AsyncStorage.removeItem('password');
    this.props.navigation.replace('Login');
    console.log('dadah.');
  }

  render() {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        {this.state.password != '' ? (
          <View>
            <Text style={{fontSize: 30}}> Selamat Datang !</Text>
            <Text style={{fontSize: 30}}> Data anda diingat </Text>
          </View>
        ) : (
          <View>
            <Text style={{fontSize: 30}}> Selamat Datang! </Text>
            <Text style={{fontSize: 30}}> Data anda tidak diingat </Text>
          </View>
        )}
        <Button title="Keluar" color="orange" onPress={() => this.logout()} />
      </View>
    );
  }
}
