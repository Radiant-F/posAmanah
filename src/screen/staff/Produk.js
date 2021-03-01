import AsyncStorage from '@react-native-community/async-storage';
import React, {Component} from 'react';
import {
  Text,
  View,
  TouchableNativeFeedback,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import _ from 'lodash';

export default class Produk extends Component {
  constructor() {
    super();
    this.state = {
      token: '',
      daftar_barang: [],
      daftar_supplier: [],
      refresh: false,
    };
  }

  toPrice(price) {
    return _.replace(price, /\B(?=(\d{3})+(?!\d))/g, '.');
  }

  componentDidMount() {
    AsyncStorage.getItem('token')
      .then((value) => {
        this.setState({token: value});
        this.getProduct();
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
        this.setState({daftar_barang: responseJSON.data, refresh: false});
        console.log('barang termuat.');
        this.getSupplier();
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
          <View>
            {this.state.daftar_barang == null ? (
              <View>
                <Text>Data kosong</Text>
              </View>
            ) : (
              <View>
                {this.state.daftar_barang.map((value, index) => (
                  <TouchableNativeFeedback
                    key={index}
                    onPress={() =>
                      this.props.navigation.navigate('EditProduct', {
                        data: value,
                      })
                    }>
                    <View style={{marginBottom: 10}}>
                      <Text>Nama Produk: {value.name}</Text>
                      <Text>Merek Produk: {value.merek}</Text>
                      <Text>Stok Produk: {value.stock}</Text>
                      <View style={{flexDirection: 'row'}}>
                        <Text>Supplier: </Text>
                        {value.supplier_id == 1 ? (
                          <Text>PT. Indofood</Text>
                        ) : (
                          <>
                            {value.supplier_id == 2 ? (
                              <Text>PT. Siantar Top</Text>
                            ) : (
                              <Text>PT. CocaCola</Text>
                            )}
                          </>
                        )}
                      </View>
                      <Text>
                        Harga Jual: Rp {this.toPrice(value.harga_jual)},-
                      </Text>
                      <Text>
                        Harga Beli: Rp {this.toPrice(value.harga_beli)},-
                      </Text>
                    </View>
                  </TouchableNativeFeedback>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }
}
