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
import ImagePicker from 'react-native-image-picker';
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
      name: '',
      umur: '',
      phone_number: '',
      email: '',
      address: '',
      image: '',
      photo: '',
      sup_name: '',
      sup_phone_number: 0,
      sup_address: '',
      out_keterangan: '',
      out_kredit: 0,
      daftar_kategori: [],
      daftar_supplier: [],
      daftar_barang: [],
      token: this.getToken(),
      modal: false,
      modalOption: false,
      modalSupplier: false,
      modalEditSupplier: false,
      modalOut: false,
      modalCat: false,
      editCat: false,
      loading: false,
      tombol: false,
      edited: false,
      tombol_profil: false,
    };
  }

  toPrice(price) {
    return _.replace(price, /\B(?=(\d{3})+(?!\d))/g, '.');
  }

  getToken() {
    AsyncStorage.getItem('token')
      .then((value) => {
        if (value) {
          this.setState({token: value});
          this.getUser();
        }
      })
      .catch((err) => console.log(err));
  }

  getUser() {
    console.log('mengambil data..');
    this.setState({tombol: true});
    fetch(`https://amanah-mart.herokuapp.com/api/karyawan`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${this.state.token}`,
        'Content-Type': 'application/json',
      },
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        if (responseJSON.status == 'Success') {
          this.setState({
            name: responseJSON.data.User.name,
            umur: JSON.stringify(responseJSON.data.Karyawan.umur),
            phone_number: JSON.stringify(
              responseJSON.data.Karyawan.phone_number,
            ),
            email: responseJSON.data.User.email,
            address: responseJSON.data.Karyawan.address,
            image: responseJSON.data.Karyawan.image,
          });
          console.log('data dimuat');
          this.getSupplier();
        } else {
          console.log('data gagal dimuat');
        }
      })
      .catch((err) => console.log(err));
  }

  updateProfil() {
    if (this.state.edited != false) {
      const {name, email, phone_number, umur, address, photo} = this.state;
      console.log('memperbarui profil..');
      this.setState({tombol_profil: true});
      var kirimData = {
        name: name,
        email: email,
        phone_number: phone_number,
        umur: umur,
        address: address,
      };
      fetch(`https://amanah-mart.herokuapp.com/api/karyawan/update`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.state.token}`,
        },
        body: this.createFormData(photo, kirimData),
      })
        .then((response) => response.json())
        .then((responseJSON) => {
          if (responseJSON.status == 'Success') {
            console.log('profil diperbarui');
            ToastAndroid.show('Profil diperbarui', ToastAndroid.SHORT);
            this.setState({tombol_profil: false, edited: false});
            this.getUser();
          } else {
            console.log('profil gagal diperbarui');
            ToastAndroid.show('Harap Coba Lagi', ToastAndroid.SHORT);
            this.setState({tombol_profil: false, edited: false});
          }
        })
        .catch((err) => this.fatal(err));
    } else {
      ToastAndroid.show('Foto harus diperbarui', ToastAndroid.SHORT);
      console.log('error');
    }
  }

  createFormData = (photo, body) => {
    const data = new FormData();
    data.append('image', {
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
    ImagePicker.showImagePicker(options, (response) => {
      if (response.uri) {
        this.setState({photo: response, edited: true});
        console.log(JSON.stringify(response.fileName));
      }
    });
  };

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

  addSupplier() {
    if (
      this.state.sup_address &&
      this.state.sup_name != '' &&
      this.state.sup_phone_number != 0
    ) {
      console.log('mendaftarkan supplier..');
      this.setState({tombol: true});
      const {sup_name, sup_address, sup_phone_number} = this.state;
      var kirimData = {
        name: sup_name,
        address: sup_address,
        phone_number: sup_phone_number,
      };
      fetch(`https://amanah-mart.herokuapp.com/api/supplier`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.state.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(kirimData),
      })
        .then((response) => response.json())
        .then((responseJSON) => {
          if (responseJSON.status == 'Success') {
            console.log('supplier ditambah');
            this.setState({tombol: false});
            ToastAndroid.show('Supplier berhasil ditambah', ToastAndroid.SHORT);
            this.getSupplier();
          } else {
            console.log('supplier gagal ditambah');
            this.setState({tombol: false});
            ToastAndroid.show('Supplier gagal ditambah', ToastAndroid.SHORT);
          }
        })
        .catch((err) => this.error(err));
    } else {
      ToastAndroid.show('Isi yang benar', ToastAndroid.SHORT);
    }
  }

  addPengeluaran() {
    if (this.state.out_keterangan != '' && this.state.out_kredit != 0) {
      console.log('menambah pengeluaran..');
      this.setState({tombol: true});
      const {out_keterangan, out_kredit} = this.state;
      var kirimData = {
        keterangan: out_keterangan,
        kredit: out_kredit,
      };
      fetch(`https://amanah-mart.herokuapp.com/api/pengeluaran`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.state.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(kirimData),
      })
        .then((response) => response.json())
        .then((responseJSON) => {
          console.log(responseJSON);
          if (responseJSON.status == 'Success') {
            console.log('pengeluaran ditambah');
            this.setState({tombol: false});
            ToastAndroid.show(
              'Pengeluaran berhasil ditambah',
              ToastAndroid.SHORT,
            );
            this.getSupplier();
          } else {
            console.log('pengeluaran gagal ditambah');
            this.setState({tombol: false});
            ToastAndroid.show('Pengeluaran gagal ditambah', ToastAndroid.SHORT);
          }
        })
        .catch((err) => this.error(err));
    } else {
      ToastAndroid.show('Isi yang benar', ToastAndroid.SHORT);
    }
  }

  getSupplier() {
    console.log('mengambil supplier..');
    this.setState({daftar_supplier: []});
    fetch(`https://amanah-mart.herokuapp.com/api/supplier`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.state.token}`,
      },
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        this.setState({
          daftar_supplier: responseJSON.data,
          supplier_id: responseJSON.data[0].id,
        });
        console.log('supplier termuat.');
        this.getCategory();
      })
      .catch((err) => this.error(err));
  }

  editSupplier() {
    if (
      this.state.sup_address &&
      this.state.sup_name != '' &&
      this.state.sup_phone_number != 0
    ) {
      console.log(
        'memperbarui supplier dengan id: ',
        this.state.supplier_id,
        '..',
      );
      this.setState({tombol: true});
      const {sup_name, sup_address, sup_phone_number} = this.state;
      var kirimData = {
        name: sup_name,
        address: sup_address,
        phone_number: sup_phone_number,
      };
      fetch(
        `https://amanah-mart.herokuapp.com/api/supplier/${this.state.supplier_id}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.state.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(kirimData),
        },
      )
        .then((response) => response.json())
        .then((responseJSON) => {
          if (responseJSON.status == 'Success') {
            console.log('supplier diperbarui');
            this.setState({tombol: false});
            ToastAndroid.show(
              'Supplier berhasil diperbarui',
              ToastAndroid.SHORT,
            );
            this.getSupplier();
          } else {
            console.log('supplier gagal diperbarui');
            this.setState({tombol: false});
            ToastAndroid.show('Supplier gagal diperbarui', ToastAndroid.SHORT);
          }
        })
        .catch((err) => this.error(err));
    } else {
      ToastAndroid.show('Isi yang benar', ToastAndroid.SHORT);
    }
  }

  deleteSupplier() {
    console.log('menghapus supplier');
    this.setState({tombol: true});
    fetch(
      `https://amanah-mart.herokuapp.com/api/supplier/delete/${this.state.supplier_id}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.state.token}`,
        },
      },
    )
      .then((response) => response.json())
      .then((responseJSON) => {
        console.log(responseJSON);
        if (responseJSON.status == 'Success') {
          console.log('supplier dihapus');
          this.setState({tombol: false});
          ToastAndroid.show('Supplier berhasil dihapus', ToastAndroid.SHORT);
          this.getSupplier();
        } else {
          console.log('supplier gagal dihapus');
          ToastAndroid.show('Supplier berhasil dihapus', ToastAndroid.SHORT);
        }
      })
      .catch((err) => this.error(err));
  }

  getCategory() {
    console.log('memuat kategori..');
    this.setState({tombol: true});
    fetch(`https://amanah-mart.herokuapp.com/api/category`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.state.token}`,
      },
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        this.setState({daftar_kategori: responseJSON.data, tombol: false});
        console.log('kategori termuat.');
      })
      .catch((err) => this.error(err));
  }

  addCategory() {
    if (this.state.name != '') {
      console.log('menambah kategori..');
      this.setState({tombol: true});
      const {name} = this.state;
      var kirimData = {
        name: name,
      };
      fetch(`https://amanah-mart.herokuapp.com/api/category`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.state.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(kirimData),
      })
        .then((response) => response.json())
        .then((responseJSON) => {
          console.log(responseJSON);
          if (responseJSON.status == 'Success') {
            console.log('kategori ditambah');
            this.setState({tombol: false});
            ToastAndroid.show('Kategori telah ditambah', ToastAndroid.SHORT);
            this.getCategory();
          } else {
            console.log('kategori gagal ditambah');
            this.setState({tombol: false});
            ToastAndroid.show('Mohon periksa koneksi Anda', ToastAndroid.SHORT);
          }
        })
        .catch((err) => this.error(err));
    } else {
      ToastAndroid.show('Isi yang benar', ToastAndroid.SHORT);
    }
  }

  editCategory() {
    if (this.state.name != '') {
      console.log('memperbarui kategori..');
      this.setState({tombol: true});
      const {name} = this.state;
      var kirimData = {
        name: name,
      };
      fetch(
        `https://amanah-mart.herokuapp.com/api/category/${this.state.category_id}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.state.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(kirimData),
        },
      )
        .then((response) => response.json())
        .then((responseJSON) => {
          console.log(responseJSON);
          if (responseJSON.status == 'Success') {
            console.log('kategori diperbarui');
            this.setState({tombol: false});
            ToastAndroid.show('Kategori telah diperbarui', ToastAndroid.SHORT);
            this.getCategory();
          } else {
            console.log('kategori gagal diperbarui');
            this.setState({tombol: false});
            ToastAndroid.show('Mohon periksa koneksi Anda', ToastAndroid.SHORT);
          }
        })
        .catch((err) => this.error(err));
    } else {
      ToastAndroid.show('Isi yang benar', ToastAndroid.SHORT);
    }
  }

  deleteCategory() {
    console.log('menghapus kategori..');
    fetch(
      `https://amanah-mart.herokuapp.com/api/category/delete/${this.state.category_id}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.state.token}`,
        },
      },
    )
      .then((response) => response.json())
      .then((responseJSON) => {
        if (responseJSON.status == 'Success') {
          console.log('kategori dihapus');
          ToastAndroid.show('Kategori berhasil dihapus', ToastAndroid.SHORT);
          this.getCategory();
        } else {
          console.log('kategori gagal dihapus');
          ToastAndroid.show('Mohon periksa koneksi Anda', ToastAndroid.SHORT);
        }
      })
      .catch((err) => this.error(err));
  }

  error(err) {
    console.log(err);
    Alert.alert(
      'Gagal',
      'Mohon periksa koneksi Anda!',
      [
        {
          text: 'Ok',
        },
      ],
      {cancelable: true},
    );
    this.setState({tombol: false, loading: false});
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
    return (
      <View style={{flex: 1}}>
        <ImageBackground style={styles.bg}>
          <View style={{padding: 10}}>
            <View style={styles.header}>
              {this.state.image == '' ? (
                <Image
                  source={require('../../assets/plainAvatar.png')}
                  style={styles.imgIcon}
                />
              ) : (
                <Image
                  source={{uri: this.state.image}}
                  style={styles.imgIcon}
                />
              )}
              <Text style={{color: 'white'}}>Amanah Mart</Text>
              <TouchableWithoutFeedback
                onPress={() => this.setState({modalOption: true})}>
                <Image
                  source={require('../../assets/settings-cogwheel-button.png')}
                  style={{...styles.imgIcon, tintColor: 'white'}}
                />
              </TouchableWithoutFeedback>
            </View>
            <View
              style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
              <TouchableNativeFeedback
                onPress={() => this.setState({modalSupplier: true})}>
                <View style={{...gaya.buttonAdd, marginBottom: 10}}>
                  <Text>+ Daftarkan Supplier</Text>
                </View>
              </TouchableNativeFeedback>
              <TouchableNativeFeedback
                onPress={() => this.setState({modal: true})}>
                <View style={{...gaya.buttonAdd, marginBottom: 10}}>
                  <Text>+ Pesan Produk</Text>
                </View>
              </TouchableNativeFeedback>
            </View>
            <View
              style={{flexDirection: 'row', justifyContent: 'space-evenly'}}>
              <TouchableNativeFeedback
                onPress={() => this.setState({modalOut: true})}>
                <View style={{...gaya.buttonAdd, marginBottom: 10}}>
                  <Text>+ Tambah Pengeluaran</Text>
                </View>
              </TouchableNativeFeedback>
              <TouchableNativeFeedback
                onPress={() => this.setState({modalCat: true})}>
                <View style={{...gaya.buttonAdd, marginBottom: 10}}>
                  <Text>+ Tambah Kategori</Text>
                </View>
              </TouchableNativeFeedback>
            </View>
            <Modal
              visible={this.state.modalCat}
              transparent
              onRequestClose={() => this.setState({modalCat: false})}
              animationType="fade">
              <View style={gaya.mainViewModal}>
                <View style={{...styles.modal, alignItems: 'center'}}>
                  <View style={gaya.headerModal}>
                    <Image
                      source={require('../../assets/round-account-button-with-user-inside.png')}
                      style={styles.imgClose}
                    />
                    <Text>Pengaturan Kategori</Text>
                    <TouchableOpacity
                      onPress={() => this.setState({modalCat: false})}>
                      <Image
                        source={require('../../assets/close-button.png')}
                        style={styles.imgClose}
                      />
                    </TouchableOpacity>
                  </View>
                  {this.state.editCat ? (
                    <View style={{width: '95%', marginTop: 10}}>
                      <Text> Pilih Kategori</Text>
                      <View
                        style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Picker
                          style={{flex: 1, marginRight: 15}}
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
                        <TouchableOpacity
                          disabled={this.state.tombol}
                          onPress={() => this.deleteCategory()}>
                          <Image
                            source={require('../../assets/rubbish-bin-delete-button.png')}
                            style={{...styles.imgClose, tintColor: 'red'}}
                          />
                        </TouchableOpacity>
                      </View>
                      <Text> Ubah Nama Kategori</Text>
                      <TextInput
                        selectTextOnFocus
                        placeholder="Nama Kategori"
                        onChangeText={(input) => this.setState({name: input})}
                        underlineColorAndroid="orange"
                      />
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-evenly',
                        }}>
                        <TouchableNativeFeedback
                          onPress={() =>
                            this.setState({editCat: !this.state.editCat})
                          }>
                          <View
                            style={{
                              ...styles.button,
                              backgroundColor: 'orange',
                            }}>
                            <Text style={styles.text}>Kembali</Text>
                          </View>
                        </TouchableNativeFeedback>
                        <TouchableNativeFeedback
                          disabled={this.state.tombol}
                          onPress={() => this.editCategory()}>
                          <View
                            style={{...styles.button, backgroundColor: 'lime'}}>
                            {this.state.tombol ? (
                              <Text style={styles.text}>Tunggu..</Text>
                            ) : (
                              <Text style={styles.text}>Perbarui</Text>
                            )}
                          </View>
                        </TouchableNativeFeedback>
                      </View>
                    </View>
                  ) : (
                    <View style={{width: '95%', marginTop: 10}}>
                      <Text> Nama Kategori</Text>
                      <TextInput
                        selectTextOnFocus
                        placeholder="Nama Kategori"
                        onChangeText={(input) => this.setState({name: input})}
                        underlineColorAndroid="orange"
                      />
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-evenly',
                        }}>
                        <TouchableNativeFeedback
                          onPress={() =>
                            this.setState({editCat: !this.state.editCat})
                          }>
                          <View
                            style={{
                              ...styles.button,
                              backgroundColor: 'orange',
                            }}>
                            <Text style={styles.text}>Edit</Text>
                          </View>
                        </TouchableNativeFeedback>
                        <TouchableNativeFeedback
                          disabled={this.state.tombol}
                          onPress={() => this.addCategory()}>
                          <View
                            style={{...styles.button, backgroundColor: 'lime'}}>
                            {this.state.tombol ? (
                              <Text style={styles.text}>Tunggu..</Text>
                            ) : (
                              <Text style={styles.text}>Tambah</Text>
                            )}
                          </View>
                        </TouchableNativeFeedback>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </Modal>
            <Modal
              visible={this.state.modalEditSupplier}
              transparent
              onRequestClose={() => this.setState({modalEditSupplier: false})}
              animationType="fade">
              <View style={gaya.mainViewModal}>
                <View style={{...styles.modal, alignItems: 'center'}}>
                  <View style={gaya.headerModal}>
                    <Image
                      source={require('../../assets/round-account-button-with-user-inside.png')}
                      style={styles.imgClose}
                    />
                    <Text>Edit Supplier</Text>
                    <TouchableOpacity
                      onPress={() => this.setState({modalEditSupplier: false})}>
                      <Image
                        source={require('../../assets/close-button.png')}
                        style={styles.imgClose}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={{width: '95%', marginTop: 10}}>
                    <Text>Pilih Penyedia Produk</Text>
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
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <View style={{width: '45%'}}>
                        <Text> Nama Supplier</Text>
                        <TextInput
                          selectTextOnFocus
                          placeholder="Nama"
                          onChangeText={(input) =>
                            this.setState({sup_name: input})
                          }
                          underlineColorAndroid="orange"
                        />
                      </View>
                      <View style={{width: '45%'}}>
                        <Text> Nomor Telepon</Text>
                        <TextInput
                          selectTextOnFocus
                          placeholder="Nomor"
                          onChangeText={(input) =>
                            this.setState({sup_phone_number: input})
                          }
                          underlineColorAndroid="orange"
                          keyboardType="decimal-pad"
                        />
                      </View>
                    </View>
                    <Text> Alamat Supplier</Text>
                    <TextInput
                      selectTextOnFocus
                      placeholder="Alamat"
                      onChangeText={(input) =>
                        this.setState({sup_address: input})
                      }
                      underlineColorAndroid="orange"
                    />
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-evenly',
                      }}>
                      <TouchableNativeFeedback
                        disabled={this.state.tombol}
                        onPress={() => this.deleteSupplier()}>
                        <View style={styles.button}>
                          {this.state.tombol ? (
                            <Text style={styles.text}>Tunggu..</Text>
                          ) : (
                            <Text style={styles.text}>Hapus</Text>
                          )}
                        </View>
                      </TouchableNativeFeedback>
                      <TouchableNativeFeedback
                        disabled={this.state.tombol}
                        onPress={() => this.editSupplier()}>
                        <View
                          style={{...styles.button, backgroundColor: 'lime'}}>
                          {this.state.tombol ? (
                            <Text style={styles.text}>Tunggu..</Text>
                          ) : (
                            <Text style={styles.text}>Update</Text>
                          )}
                        </View>
                      </TouchableNativeFeedback>
                    </View>
                  </View>
                </View>
              </View>
            </Modal>
            <Modal
              visible={this.state.modalSupplier}
              transparent
              onRequestClose={() => this.setState({modalSupplier: false})}
              animationType="fade">
              <View style={gaya.mainViewModal}>
                <View style={{...styles.modal, alignItems: 'center'}}>
                  <View style={gaya.headerModal}>
                    <Image
                      source={require('../../assets/round-account-button-with-user-inside.png')}
                      style={styles.imgClose}
                    />
                    <Text>Pendaftaran Supplier</Text>
                    <TouchableOpacity
                      onPress={() => this.setState({modalSupplier: false})}>
                      <Image
                        source={require('../../assets/close-button.png')}
                        style={styles.imgClose}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={{width: '95%', marginTop: 10}}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                      }}>
                      <View style={{width: '45%'}}>
                        <Text> Nama Supplier</Text>
                        <TextInput
                          selectTextOnFocus
                          placeholder="Nama"
                          onChangeText={(input) =>
                            this.setState({sup_name: input})
                          }
                          underlineColorAndroid="orange"
                        />
                      </View>
                      <View style={{width: '45%'}}>
                        <Text> Nomor Telepon</Text>
                        <TextInput
                          selectTextOnFocus
                          placeholder="Nomor"
                          onChangeText={(input) =>
                            this.setState({sup_phone_number: input})
                          }
                          underlineColorAndroid="orange"
                          keyboardType="decimal-pad"
                        />
                      </View>
                    </View>
                    <Text> Alamat Supplier</Text>
                    <TextInput
                      selectTextOnFocus
                      placeholder="Alamat"
                      onChangeText={(input) =>
                        this.setState({sup_address: input})
                      }
                      underlineColorAndroid="orange"
                    />
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-evenly',
                      }}>
                      <TouchableNativeFeedback
                        onPress={() =>
                          this.setState({
                            modalSupplier: false,
                            modalEditSupplier: true,
                          })
                        }>
                        <View
                          style={{...styles.button, backgroundColor: 'orange'}}>
                          <Text style={styles.text}>Edit</Text>
                        </View>
                      </TouchableNativeFeedback>
                      <TouchableNativeFeedback
                        disabled={this.state.tombol}
                        onPress={() => this.addSupplier()}>
                        <View
                          style={{...styles.button, backgroundColor: 'lime'}}>
                          {this.state.tombol ? (
                            <Text style={styles.text}>Tunggu..</Text>
                          ) : (
                            <Text style={styles.text}>Tambah</Text>
                          )}
                        </View>
                      </TouchableNativeFeedback>
                    </View>
                  </View>
                </View>
              </View>
            </Modal>
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
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                    }}>
                    <View>
                      <TouchableNativeFeedback
                        onPress={() => this.handleEditPhoto()}>
                        {this.state.photo == '' ? (
                          <Image
                            source={{uri: this.state.image}}
                            style={styles.imgPPP}
                          />
                        ) : (
                          <Image
                            source={{uri: this.state.photo.uri}}
                            style={styles.imgPPP}
                          />
                        )}
                      </TouchableNativeFeedback>
                    </View>
                    <View>
                      <View style={{flexDirection: 'row'}}>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}>
                          <Image
                            source={require('../../assets/user-shape.png')}
                            style={{...styles.imgIcon, marginRight: 5}}
                          />
                          <TextInput
                            value={this.state.name}
                            maxLength={10}
                            underlineColorAndroid="orange"
                            placeholder="Nama Anda"
                            onChangeText={(input) =>
                              this.setState({name: input})
                            }
                          />
                        </View>
                        <View
                          style={{flexDirection: 'row', alignItems: 'center'}}>
                          <Text>|</Text>
                          <TextInput
                            value={this.state.umur}
                            keyboardType="decimal-pad"
                            maxLength={3}
                            underlineColorAndroid="orange"
                            placeholder="Umur Anda"
                            onChangeText={(input) =>
                              this.setState({umur: input})
                            }
                          />
                        </View>
                      </View>
                      <View
                        style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Image
                          source={require('../../assets/gmail-logo.png')}
                          style={{...styles.imgIcon, marginRight: 5}}
                        />
                        <TextInput
                          style={{flex: 1}}
                          value={this.state.email}
                          underlineColorAndroid="orange"
                          placeholder="Email Anda"
                          onChangeText={(input) =>
                            this.setState({email: input})
                          }
                        />
                      </View>
                      <View
                        style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Image
                          source={require('../../assets/phone-call-button.png')}
                          style={{...styles.imgIcon, marginRight: 5}}
                        />
                        <TextInput
                          style={{flex: 1}}
                          value={this.state.phone_number}
                          keyboardType="decimal-pad"
                          underlineColorAndroid="orange"
                          placeholder="Nomor Anda"
                          onChangeText={(input) =>
                            this.setState({phone_number: input})
                          }
                        />
                      </View>
                    </View>
                  </View>
                  <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Image
                      source={require('../../assets/map-placeholder.png')}
                      style={{...styles.imgIcon, marginRight: 5}}
                    />
                    <TextInput
                      value={this.state.address}
                      placeholder="Alamat"
                      underlineColorAndroid="orange"
                      style={{flex: 1}}
                      onChangeText={(input) => this.setState({address: input})}
                    />
                  </View>
                  <View
                    style={{
                      width: '100%',
                      flexDirection: 'row',
                      justifyContent: 'space-around',
                    }}>
                    <TouchableNativeFeedback
                      disabled={this.state.tombol_profil}
                      onPress={() => this.logout()}>
                      <View style={styles.button}>
                        <Text style={styles.text}>Keluar</Text>
                      </View>
                    </TouchableNativeFeedback>
                    <TouchableNativeFeedback
                      disabled={this.state.tombol_profil}
                      onPress={() => this.updateProfil()}>
                      <View style={{...styles.button, backgroundColor: 'lime'}}>
                        {this.state.tombol_profil ? (
                          <ActivityIndicator size="small" color="white" />
                        ) : (
                          <Text style={styles.text}>Perbarui</Text>
                        )}
                      </View>
                    </TouchableNativeFeedback>
                  </View>
                </View>
              </View>
            </Modal>
            <Modal
              visible={this.state.modalOut}
              transparent
              onRequestClose={() => this.setState({modalOut: false})}
              animationType="fade">
              <View style={gaya.mainViewModal}>
                <View style={{...styles.modal, alignItems: 'center'}}>
                  <View style={gaya.headerModal}>
                    <Image
                      source={require('../../assets/round-account-button-with-user-inside.png')}
                      style={styles.imgClose}
                    />
                    <Text>Tambah Pengeluaran</Text>
                    <TouchableOpacity
                      onPress={() => this.setState({modalOut: false})}>
                      <Image
                        source={require('../../assets/close-button.png')}
                        style={styles.imgClose}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={{width: '95%'}}>
                    <Text> Keterangan</Text>
                    <TextInput
                      placeholder="Keterangan"
                      underlineColorAndroid="orange"
                      onChangeText={(input) =>
                        this.setState({out_keterangan: input})
                      }
                    />
                    <Text> Kredit</Text>
                    <TextInput
                      underlineColorAndroid="orange"
                      keyboardType="decimal-pad"
                      placeholder="Kredit"
                      onChangeText={(input) =>
                        this.setState({out_kredit: input})
                      }
                    />
                  </View>
                  <TouchableNativeFeedback
                    disabled={this.state.tombol}
                    onPress={() => this.addPengeluaran()}>
                    <View style={{...styles.button, backgroundColor: 'lime'}}>
                      {this.state.tombol ? (
                        <Text style={styles.text}>Tunggu..</Text>
                      ) : (
                        <Text style={styles.text}>Tambah</Text>
                      )}
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
