import React, {Component} from 'react';
import {
  Modal,
  Text,
  View,
  TouchableNativeFeedback,
  TextInput,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ToastAndroid,
} from 'react-native';
import {styles} from '../member/Member';
import {Picker} from '@react-native-picker/picker';
import {gaya} from './Staff';
import AsyncStorage from '@react-native-community/async-storage';
import _ from 'lodash';

export default class EditProduct extends Component {
  constructor() {
    super();
    this.state = {
      name: '',
      category_id: 0,
      merek: '',
      stock: 0,
      harga_beli: 0,
      harga_jual: 0,
      daftar_kategori: [],
      id: 0,
      token: '',
      modal: true,
      loading: false,
    };
  }

  toPrice(price) {
    return _.replace(price, /\B(?=(\d{3})+(?!\d))/g, '.');
  }

  componentDidMount() {
    this.getToken();
    this.setState({
      name: this.props.route.params.data.name,
      category_id: this.props.route.params.data.category_id,
      stock: this.props.route.params.data.stock,
      merek: this.props.route.params.data.merek,
      harga_jual: JSON.stringify(this.props.route.params.data.harga_jual),
      harga_beli: JSON.stringify(this.props.route.params.data.harga_beli),
      id: this.props.route.params.data.id,
    });
  }

  editProduct() {
    if (
      this.state.category_id &&
      this.state.harga_beli &&
      this.state.harga_jual &&
      this.state.stock != 0
    ) {
      const {
        name,
        category_id,
        merek,
        stock,
        harga_beli,
        harga_jual,
      } = this.state;
      var dataToSend = {
        name: name,
        category_id: category_id,
        merek: merek,
        stock: stock,
        harga_beli: harga_beli,
        harga_jual: harga_jual,
      };
      console.log('mengubah produk...');
      this.setState({loading: true});
      fetch(`https://amanah-mart.herokuapp.com/api/product/${this.state.id}`, {
        method: 'POST',
        body: JSON.stringify(dataToSend),
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.state.token}`,
        },
      })
        .then((response) => response.json())
        .then((responseJson) => {
          console.log(responseJson);
          if (responseJson.status == 'Success') {
            this.setState({loading: false});
            ToastAndroid.show('Produk telah diperbarui', ToastAndroid.SHORT);
          } else {
            this.setState({loading: false});
            ToastAndroid.show('Periksa koneksi Anda.', ToastAndroid.SHORT);
          }
        })
        .catch((error) => {
          console.log(error);
          this.setState({loading: false});
          this.error();
        });
    } else {
      ToastAndroid.show('Harap isi semua form', ToastAndroid.SHORT);
    }
  }

  getToken() {
    AsyncStorage.getItem('token')
      .then((value) => {
        if (value) {
          this.setState({token: value});
          this.getCategory();
        }
      })
      .catch((err) => console.log(err));
  }

  getCategory() {
    console.log('mengambil kategori..');
    fetch(`https://amanah-mart.herokuapp.com/api/category`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.state.token}`,
      },
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        this.setState({daftar_kategori: responseJSON.data});
        console.log('kategori termuat.');
      })
      .catch((err) => console.log(err));
  }

  deleteProduct() {
    this.setState({loading: true});
    console.log('menghapus produk..');
    fetch(
      `https://amanah-mart.herokuapp.com/api/product/delete/${this.state.id}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.state.token}`,
          Accept: 'application/json',
        },
      },
    )
      .then((response) => response.json())
      .then((responseJSON) => {
        console.log(responseJSON);
        ToastAndroid.show('Produk berhasil dihapus', ToastAndroid.SHORT);
        this.props.navigation.goBack();
        this.setState({loading: false});
      })
      .catch((err) => console.log(err));
  }

  render() {
    return (
      <View>
        <View style={gaya.mainViewModal}>
          <View style={{...styles.modal, alignItems: 'center'}}>
            <View style={gaya.headerModal}>
              <Image
                source={require('../../assets/round-account-button-with-user-inside.png')}
                style={styles.imgClose}
              />
              <Text>Edit Produk</Text>
              <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                <Image
                  source={require('../../assets/close-button.png')}
                  style={styles.imgClose}
                />
              </TouchableOpacity>
            </View>
            <View style={{width: '95%'}}>
              <Text>Nama Produk</Text>
              <TextInput
                value={this.state.name}
                placeholder="e.g Permen Kaki"
                underlineColorAndroid="orange"
                onChangeText={(input) => this.setState({name: input})}
              />
            </View>
            <View style={gaya.spliterModal}>
              <View style={{width: '50%'}}>
                <Text>Kategori Produk</Text>
                <Picker
                  mode="dropdown"
                  selectedValue={this.state.category_id}
                  onValueChange={(id) => this.setState({category_id: id})}>
                  {this.state.daftar_kategori.map((value, index) => (
                    <Picker.Item
                      key={index}
                      label={value.name}
                      value={value.id}
                    />
                  ))}
                </Picker>
              </View>
              <View style={{width: '45%'}}>
                <Text>Stok Produk</Text>
                <TextInput
                  value={this.toPrice(this.state.stock)}
                  placeholder="e.g 200"
                  underlineColorAndroid="orange"
                  keyboardType="number-pad"
                  onChangeText={(input) => this.setState({stock: input})}
                />
              </View>
            </View>
            <View style={{width: '95%'}}>
              <Text>Merek Produk</Text>
              <TextInput
                value={this.state.merek}
                placeholder="e.g Siantar"
                underlineColorAndroid="orange"
                onChangeText={(input) => this.setState({merek: input})}
              />
            </View>
            <View style={{...gaya.spliterModal, width: '95%'}}>
              <View>
                <Text>Harga Produk</Text>
                <View style={gaya.inputHarga}>
                  <Text style={gaya.textHarga}>Rp </Text>
                  <TextInput
                    value={this.state.harga_beli}
                    maxLength={11}
                    placeholder="e.g Rp.50.000,-"
                    underlineColorAndroid="orange"
                    keyboardType="number-pad"
                    onChangeText={(input) => this.setState({harga_beli: input})}
                  />
                  <Text style={gaya.textHarga}>,-</Text>
                </View>
              </View>
              <View>
                <Text>Harga Jual</Text>
                <View style={gaya.inputHarga}>
                  <Text style={gaya.textHarga}>Rp </Text>
                  <TextInput
                    value={this.state.harga_jual}
                    maxLength={11}
                    placeholder="e.g Rp.100.000,-"
                    underlineColorAndroid="orange"
                    keyboardType="number-pad"
                    onChangeText={(input) => this.setState({harga_jual: input})}
                  />
                  <Text style={gaya.textHarga}>,-</Text>
                </View>
              </View>
            </View>
            <View style={{...gaya.spliterModal, width: '80%'}}>
              {this.state.loading ? (
                <View style={{...styles.button, backgroundColor: 'tomato'}}>
                  <ActivityIndicator color="white" size="small" />
                </View>
              ) : (
                <TouchableNativeFeedback onPress={() => this.deleteProduct()}>
                  <View style={{...styles.button, backgroundColor: 'tomato'}}>
                    <Text style={styles.text}>Hapus</Text>
                  </View>
                </TouchableNativeFeedback>
              )}
              {this.state.loading ? (
                <View style={{...styles.button, backgroundColor: 'tomato'}}>
                  <ActivityIndicator color="white" size="small" />
                </View>
              ) : (
                <TouchableNativeFeedback onPress={() => this.editProduct()}>
                  <View style={{...styles.button, backgroundColor: 'lime'}}>
                    <Text style={styles.text}>Edit</Text>
                  </View>
                </TouchableNativeFeedback>
              )}
            </View>
          </View>
        </View>
        <Text> textInComponent </Text>
      </View>
    );
  }
}
