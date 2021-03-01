import React from 'react';
import {createMaterialTopTabNavigator} from '@react-navigation/material-top-tabs';
import Keuangan from '../screen/pimpinan/Keuangan';
import Pengeluaran from '../screen/pimpinan/Pengeluaran';
import Absensi from '../screen/pimpinan/Absensi';

const Tab = createMaterialTopTabNavigator();

const TopTabKasir = () => {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Keuangan" component={Keuangan} />
      <Tab.Screen name="Pengeluaran" component={Pengeluaran} />
      <Tab.Screen name="Absensi" component={Absensi} />
    </Tab.Navigator>
  );
};

export default TopTabKasir;
