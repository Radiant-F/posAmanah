import AsyncStorage from '@react-native-community/async-storage';
import React, {Component} from 'react';
import {
  Text,
  View,
  TouchableNativeFeedback,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import _ from 'lodash';

export default class Gudang extends Component {
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
      })
      .catch((err) => console.log(err));
  }

  render() {
    return (
      <View style={{flex: 1}}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
            <Image
              source={require('../../assets/go-back-left-arrow.png')}
              style={{width: 25, height: 25, marginRight: 20}}
            />
          </TouchableOpacity>
          <Text>Gudang</Text>
        </View>
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
            {this.state.daftar_barang.length == 0 ? (
              <ActivityIndicator
                size="large"
                color="tomato"
                style={{margin: 10}}
              />
            ) : (
              <View>
                {this.state.daftar_barang == null ? (
                  <View>
                    <Text>Data kosong</Text>
                  </View>
                ) : (
                  <View>
                    {this.state.daftar_barang.map((value, index) => (
                      <TouchableNativeFeedback key={index}>
                        <View style={styles.mainView}>
                          <Text style={{fontSize: 20}}>{value.name}</Text>
                          <Text style={{fontWeight: 'bold'}}>
                            Stok: {value.stock}
                          </Text>
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
            )}
          </View>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainView: {
    padding: 10,
    elevation: 3,
    backgroundColor: 'white',
    borderRadius: 10,
    margin: 10,
  },
  header: {
    backgroundColor: 'orange',
    elevation: 3,
    flexDirection: 'row',
    padding: 10,
    alignItems: 'center',
  },
});
