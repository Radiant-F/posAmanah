import AsyncStorage from '@react-native-community/async-storage';
import React, {Component} from 'react';
import {Button, Text, View} from 'react-native';
import LottieView from 'lottie-react-native';
import Onboarding from 'react-native-onboarding-swiper';

export default class Intro extends Component {
  constructor() {
    super();
    this.state = {
      done: 'yes',
    };
  }

  componentDidMount() {
    AsyncStorage.setItem('first', this.state.done).catch((err) =>
      console.log('storage problem. ', err),
    );
  }

  render() {
    return (
      <Onboarding
        onSkip={() => this.props.navigation.replace('Login')}
        onDone={() => this.props.navigation.replace('Login')}
        nextLabel="Lanjut"
        skipLabel="Lewati"
        pages={[
          // {
          //   backgroundColor: 'yellow',
          //   image: (
          //     <LottieView
          //       source={require('../assets/48783-shipping-label-printing.json')}
          //       style={{width: '100%'}}
          //       autoPlay
          //     />
          //   ),
          //   title: 'Mudah!',
          //   subtitle: 'Manajemen produk toko lebih rapih dan teratur.',
          // },
          {
            backgroundColor: 'yellow',
            image: (
              <LottieView
                // source={require('../assets/48783-shipping-label-printing.json')}
                source={require('../assets/8335-cargo-load-animation.json')}
                style={{width: '70%'}}
                autoPlay
              />
            ),
            title: 'Simpel!',
            subtitle: 'Kategori yang disesuaikan lebih lanjut.',
          },
          // {
          //   backgroundColor: 'blue',
          //   image: (
          //     <LottieView
          //       style={{width: '100%'}}
          //       autoPlay
          //     />
          //   ),
          //   title: 'Cepat!',
          //   subtitle: 'Tepat waktu adalah sasaran kami.',
          // },
        ]}
      />
    );
  }
}
