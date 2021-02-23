import React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import Produk from '../screen/staff/Produk';
import Keranjang from '../screen/staff/StagingProduk';
import Pembelian from '../screen/staff/Pembelian';

const Tab = createMaterialTopTabNavigator();

const TopTab = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Pembelian" component={Pembelian} />
      <Tab.Screen name="Antiran" component={Keranjang} />
      <Tab.Screen name="Gudang" component={Produk} />
    </Tab.Navigator>
  );
};

export default TopTab;
