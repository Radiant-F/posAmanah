import AsyncStorage from '@react-native-community/async-storage';
import React, {Component} from 'react';
import {
  ScrollView,
  Text,
  TouchableNativeFeedback,
  View,
  RefreshControl,
  ActivityIndicator,
  StyleSheet,
  Image,
  ToastAndroid,
} from 'react-native';

export default class Pembelian extends Component {
  constructor() {
    super();
    this.state = {
      token: this.getToken(),
      daftar_produk: [],
      barcode: 0,
      refresh: false,
    };
  }

  getToken() {
    AsyncStorage.getItem('token')
      .then((value) => {
        if (value) {
          this.setState({token: value});
          console.log(this.state.token);
          this.getProduct();
        }
      })
      .catch((err) => console.log(err));
  }

  getProduct() {
    console.log('mengambil produk..');
    fetch(`https://amanah-mart.herokuapp.com/api/product`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.state.token}`,
      },
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        this.setState({daftar_produk: responseJSON.data, refresh: false});
        console.log('barang termuat.');
      })
      .catch((err) => console.log(err));
  }

  confirmPembelian(barcode) {
    ToastAndroid.show('Harap tunggu..', ToastAndroid.SHORT);
    console.log('membeli produk..');
    fetch(`https://amanah-mart.herokuapp.com/api/pembelian/${barcode}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.state.token}`,
      },
    })
      .then((response) => response.json())
      .then((responseJSON) => {
        console.log(responseJSON);
        ToastAndroid.show('Produk ditambah keantrean', ToastAndroid.LONG);
      })
      .catch((err) => console.log(err));
  }

  render() {
    return (
      <View style={{flex: 1, padding: 10}}>
        <ScrollView
          refreshControl={
            <RefreshControl
              refreshing={this.state.refresh}
              onRefresh={() => {
                this.setState({refresh: true});
                this.getProduct();
              }}
            />
          }>
          {this.state.daftar_produk == null ? (
            <View>
              <Text>Data kosong</Text>
            </View>
          ) : (
            <View>
              {this.state.daftar_produk.map((value, index) => (
                <View key={index} style={styles.mainView}>
                  <View>
                    <Text> Nama Produk: {value.name} </Text>
                    {value.supplier_id == 1 ? (
                      <Text> Supplier: PT. Indofood</Text>
                    ) : (
                      <>
                        {value.supplier_id == 2 ? (
                          <Text> Supplier: PT. Wings</Text>
                        ) : (
                          <Text> Supplier: PT. CocaCola</Text>
                        )}
                      </>
                    )}
                    <Text> Barcode: {value.barcode} </Text>
                  </View>
                  <TouchableNativeFeedback
                    onPress={() => this.confirmPembelian(value.barcode)}>
                    <View style={styles.viewAdd}>
                      <Text>+</Text>
                      <Image
                        source={require('../../assets/shopping-cart.png')}
                        style={styles.imgIcon}
                      />
                    </View>
                  </TouchableNativeFeedback>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    );
  }
}

export const styles = StyleSheet.create({
  mainView: {
    flexDirection: 'row',
    backgroundColor: 'white',
    elevation: 3,
    borderRadius: 10,
    padding: 10,
    marginBottom: 5,
    justifyContent: 'space-between',
  },
  imgIcon: {
    width: 30,
    height: 30,
    tintColor: 'lime',
  },
  viewAdd: {
    alignItems: 'center',
    flexDirection: 'row',
    backgroundColor: 'white',
    elevation: 5,
    padding: 5,
    borderRadius: 10,
  },
});
