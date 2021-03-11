import React, {Component} from 'react';
import {Provider} from 'react-redux';
import Demo from './src/Demo';
import {store} from './src/redux/store/index';
import Navigator from './src/router/Navigator';

export default class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Navigator />
      </Provider>
    );
  }
}
