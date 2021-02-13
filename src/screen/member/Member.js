import AsyncStorage from '@react-native-community/async-storage';
import React, {Component} from 'react';
import {Button, Text, View} from 'react-native';

export default class Member extends Component {
  componentDidMount() {
    AsyncStorage.multiGet(['token', 'role']).then((value) =>
      console.log(value),
    );
  }

  logout() {
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

  render() {
    return (
      <View>
        <Text> Member </Text>
        <Button title="keluar" color="orange" onPress={() => this.logout()} />
      </View>
    );
  }
}
