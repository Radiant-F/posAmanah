import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

// SCREENS
import Intro from '../components/Intro';
import Login from '../auth/Login';
import Splash from '../components/Splash';
import Register from '../auth/Register';
import Member from '../screen/member/Member';
import Pimpinan from '../screen/pimpinan/Pimpinan';
import Staff from '../screen/staff/Staff';
import Kasir from '../screen/kasir/Kasir';

const Stack = createStackNavigator();
const Navigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator headerMode={false}>
        <Stack.Screen name="Splash" component={Splash} />
        <Stack.Screen name="Intro" component={Intro} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Member" component={Member} />
        <Stack.Screen name="Pimpinan" component={Pimpinan} />
        <Stack.Screen name="Staff" component={Staff} />
        <Stack.Screen name="Kasir" component={Kasir} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Navigator;
