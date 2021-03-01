import AsyncStorage from '@react-native-community/async-storage';
import React, {Component} from 'react';
import {View, Text, Image} from 'react-native';
import {connect} from 'react-redux';

export class Splash extends Component {
  componentDidMount() {
    setTimeout(() => {
      AsyncStorage.getItem('token')
        .then((value) => {
          if (value != null) {
            AsyncStorage.getItem('role').then((value) => {
              if (value == '2') {
                this.props.navigation.replace('Pimpinan');
              } else if (value == '4') {
                this.props.navigation.replace('Kasir');
              } else if (value == '3') {
                this.props.navigation.replace('Staff');
              } else if (value == '5') {
                this.props.navigation.replace('Member');
              } else {
                this.props.navigation.replace('Login');
              }
            });
          } else {
            AsyncStorage.getItem('first')
              .then((value) => {
                if (value != null) {
                  this.props.navigation.replace('Login');
                } else {
                  this.props.navigation.replace('Intro');
                }
              })
              .catch((err) => console.log(err));
          }
        })
        .catch((err) => console.log(err));
    }, 2000);
  }

  render() {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: 'white',
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <Image
          source={require('../assets/logo.png')}
          style={{width: 230, height: 230}}
        />
      </View>
    );
  }
}

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

export default connect(mapStateToProps, mapDispatchToProps)(Splash);
