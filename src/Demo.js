import React, {Component} from 'react';
import {Image, Text, TouchableOpacity, View} from 'react-native';
import ImagePicker from 'react-native-image-picker';

export default class Demo extends Component {
  constructor() {
    super();
    this.state = {
      avatar: '',
      photo: '',
    };
  }

  createFormData = (photo, body) => {
    const data = new FormData();
    data.append('avatar', {
      name: photo.fileName,
      type: photo.type,
      uri:
        Platform.OS === 'android'
          ? photo.uri
          : photo.uri.replace('file://', ''),
    });
    Object.keys(body).forEach((key) => {
      data.append(key, body[key]);
    });
    return data;
  };

  handleEditPhoto = () => {
    const options = {
      noData: true,
    };
    ImagePicker.launchImageLibrary(options, (response) => {
      if (response.uri) {
        this.setState({photo: response});
        console.log(JSON.stringify(response.fileName));
      }
    });
  };

  render() {
    return (
      <View>
        <Text> textInComponent </Text>
        <TouchableOpacity onPress={() => this.handleEditPhoto()}>
          {this.state.photo == '' ? (
            <View>
              <Image
                source={require('./assets/plainAvatar.png')}
                style={{width: 100, height: 100}}
              />
            </View>
          ) : (
            <View>
              <Image
                source={{uri: this.state.photo.uri}}
                style={{width: 100, height: 100}}
              />
            </View>
          )}
        </TouchableOpacity>
      </View>
    );
  }
}
