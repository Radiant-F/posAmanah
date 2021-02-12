import React, {Component} from 'react';
import {Text, View} from 'react-native';

export default class Register extends Component {
  render() {
    return (
      <View>
        <Text onPress={() => this.props.navigation.replace('Kasir')}>
          masuk
        </Text>
      </View>
    );
  }
}
