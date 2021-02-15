import AsyncStorage from '@react-native-community/async-storage';
import React, {Component} from 'react';
import {Button, Text, View} from 'react-native';

export default class Kasir extends Component {
  constructor() {
    super();
    this.state = {
      test: 'Member',
    };
  }

  logout() {
    AsyncStorage.removeItem('password');
    this.props.navigation.replace('Login');
    console.log('dadah.');
  }

  render() {
    return (
      <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text>{this.state.test}</Text>
        <Button
          title="Kembali"
          color="orange"
          onPress={() =>
            this.props.navigation.navigate('Member', {ganti: this.state.test})
          }
        />
      </View>
    );
  }
}
