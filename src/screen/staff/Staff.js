import AsyncStorage from '@react-native-community/async-storage';
import React, {Component} from 'react';
import {
  Modal,
  Text,
  View,
  Image,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  TouchableNativeFeedback,
  TextInput,
  TouchableWithoutFeedback,
  ScrollView,
  Alert,
  ToastAndroid,
  ActivityIndicator,
} from 'react-native';
import {styles} from '../member/Member';
import {Picker} from '@react-native-picker/picker';
import _ from 'lodash';
import TopTab from '../../router/TopTab';

export default class AddProduct extends Component {
  constructor() {
    super();
    this.state = {
      name: '',
      category_id: 0,
      merek: '',
      supplier_id: 0,
      barcode: '',
      diskon: 0,
      daftar_kategori: [],
      daftar_supplier: [],
      daftar_barang: [],
      token: this.getToken(),
      modal: false,
      modalOption: false,
      loading: false,
    };
  }

  toPrice(price) {
    return _.replace(price, /\B(?=(\d{3})+(?!\d))/g, '.');
  }

  addProduct() {
    const {name, category_id, merek, supplier_id, barcode, diskon} = this.state;
    var dataToSend = {
      name: name,
      category_id: category_id,
      merek: merek,
      supplier_id: supplier_id,
      barcode: barcode,
      diskon: diskon,
    };
    console.log('menambah produk...');
    this.setState({loading: true});
    fetch(`https://amanah-mart.herokuapp.com/api/product`, {
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
          ToastAndroid.show('Produk telah ditambah', ToastAndroid.SHORT);
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
  }

  getToken() {
    AsyncStorage.getItem('token')
      .then((value) => {
        if (value) {
          this.setState({token: value});
          console.log(this.state.token);
          this.getSupplier();
        }
      })
      .catch((err) => console.log(err));
  }

  getSupplier() {
    console.log('mengambil supplier..');
    fetch(`https://amanah-mart.herokuapp.com/api/supplier`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.state.token}`,
      },
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        this.setState({daftar_supplier: responseJSON.data});
        console.log('supplier termuat.');
        this.getCategory();
      })
      .catch((err) => console.log(err));
  }

  getCategory() {
    console.log('memuat kategori..');
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

  logout() {
    this.setState({modal: false});
    AsyncStorage.multiGet(['token', 'role'])
      .then((value) => {
        if (value[0][1] != null) {
          AsyncStorage.multiRemove(['token', 'role']).catch((err) =>
            console.log(err),
          );
          console.log('data user dihapus');
          this.props.navigation.replace('Login');
        } else {
          console.log('user keluar tanpa jejak');
          this.props.navigation.replace('Login');
        }
      })
      .catch((err) => console.log(err));
  }

  render() {
    console.log(this.state.supplier_id);
    return (
      <View style={{flex: 1}}>
        <ImageBackground style={styles.bg}>
          <View style={{padding: 10}}>
            <View style={styles.header}>
              <Image
                source={require('../../assets/plainAvatar.png')}
                style={styles.imgIcon}
              />
              <Text style={{color: 'white'}}>Amanah Mart</Text>
              <TouchableWithoutFeedback
                onPress={() => this.setState({modalOption: true})}>
                <Image
                  source={require('../../assets/settings-cogwheel-button.png')}
                  style={{...styles.imgIcon, tintColor: 'white'}}
                />
              </TouchableWithoutFeedback>
            </View>
            <TouchableNativeFeedback
              onPress={() => this.setState({modal: true})}>
              <View style={{...gaya.buttonAdd, marginBottom: 10}}>
                <Text>+ Pesan Produk</Text>
              </View>
            </TouchableNativeFeedback>
            <Modal
              visible={this.state.modal}
              transparent
              onRequestClose={() => this.setState({modal: false})}
              animationType="fade">
              <View style={gaya.mainViewModal}>
                <View style={{...styles.modal, alignItems: 'center'}}>
                  <View style={gaya.headerModal}>
                    <Image
                      source={require('../../assets/round-account-button-with-user-inside.png')}
                      style={styles.imgClose}
                    />
                    <Text>Tambah Produk</Text>
                    <TouchableOpacity
                      onPress={() => this.setState({modal: false})}>
                      <Image
                        source={require('../../assets/close-button.png')}
                        style={styles.imgClose}
                      />
                    </TouchableOpacity>
                  </View>
                  <ScrollView>
                    <View style={{width: '95%'}}>
                      <Text>Nama Produk</Text>
                      <TextInput
                        placeholder="e.g Permen Kaki"
                        underlineColorAndroid="orange"
                        onChangeText={(input) => this.setState({name: input})}
                      />
                      <Text>Penyedia Produk</Text>
                      <Picker
                        mode="dropdown"
                        selectedValue={this.state.supplier_id}
                        onValueChange={(input) =>
                          this.setState({supplier_id: input})
                        }>
                        {this.state.daftar_supplier.map((value, index) => (
                          <Picker.Item
                            key={index}
                            label={value.name}
                            value={value.id}
                          />
                        ))}
                      </Picker>
                    </View>
                    <View style={gaya.spliterModal}>
                      <View style={{width: '50%'}}>
                        <Text>Kategori Produk</Text>
                        <Picker
                          mode="dropdown"
                          selectedValue={this.state.category_id}
                          onValueChange={(id) =>
                            this.setState({category_id: id})
                          }>
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
                        <Text>Barcode</Text>
                        <TextInput
                          placeholder="e.g 123"
                          underlineColorAndroid="orange"
                          keyboardType="number-pad"
                          onChangeText={(input) =>
                            this.setState({barcode: input})
                          }
                        />
                      </View>
                    </View>

                    <View style={gaya.spliterModal}>
                      <View style={{width: '45%'}}>
                        <Text>Merek Produk</Text>
                        <TextInput
                          placeholder="eg. Siantar Top"
                          underlineColorAndroid="orange"
                          onChangeText={(input) =>
                            this.setState({merek: input})
                          }
                        />
                      </View>
                      <View style={{width: '45%'}}>
                        <Text>Diskon</Text>
                        <TextInput
                          placeholder="90%"
                          keyboardType="number-pad"
                          underlineColorAndroid="orange"
                          onChangeText={(input) =>
                            this.setState({diskon: input})
                          }
                        />
                      </View>
                    </View>
                    {this.state.loading ? (
                      <View style={{...styles.button, backgroundColor: 'lime'}}>
                        <ActivityIndicator color="white" size="small" />
                      </View>
                    ) : (
                      <TouchableNativeFeedback
                        onPress={() => this.addProduct()}>
                        <View
                          style={{...styles.button, backgroundColor: 'lime'}}>
                          <Text style={styles.text}>Tambah</Text>
                        </View>
                      </TouchableNativeFeedback>
                    )}
                  </ScrollView>
                </View>
              </View>
            </Modal>
            <Modal
              visible={this.state.modalOption}
              transparent
              onRequestClose={() => this.setState({modalOption: false})}
              animationType="fade">
              <View style={gaya.mainViewModal}>
                <View style={{...styles.modal, alignItems: 'center'}}>
                  <View style={gaya.headerModal}>
                    <Image
                      source={require('../../assets/round-account-button-with-user-inside.png')}
                      style={styles.imgClose}
                    />
                    <Text>Pengaturan Profil</Text>
                    <TouchableOpacity
                      onPress={() => this.setState({modalOption: false})}>
                      <Image
                        source={require('../../assets/close-button.png')}
                        style={styles.imgClose}
                      />
                    </TouchableOpacity>
                  </View>
                  <TouchableNativeFeedback onPress={() => this.logout()}>
                    <View style={styles.button}>
                      <Text style={styles.text}>Keluar</Text>
                    </View>
                  </TouchableNativeFeedback>
                </View>
              </View>
            </Modal>
          </View>
        </ImageBackground>
        <TopTab />
      </View>
    );
  }
}

export const gaya = StyleSheet.create({
  mainViewModal: {
    justifyContent: 'center',
    height: '100%',
    alignItems: 'center',
  },
  headerModal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    width: '95%',
  },
  inputHarga: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textHarga: {},
  spliterModal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonAdd: {
    alignSelf: 'center',
    backgroundColor: 'white',
    elevation: 3,
    alignItems: 'center',
    borderRadius: 10,
    padding: 10,
  },
});
