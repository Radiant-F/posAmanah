import React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import Keranjang from '../screen/kasir/Keranjang';
import Gudang from '../screen/kasir/Gudang';

const Tab = createMaterialTopTabNavigator();

const TopTabKasir = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Gudang" component={Gudang} />
      <Tab.Screen name="Transaksi" component={Keranjang} />
    </Tab.Navigator>
  );
};

export default TopTabKasir;
