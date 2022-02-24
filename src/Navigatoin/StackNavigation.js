import React, {PureComponent} from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Button} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import Camera from './../VideoRecord/Camera';
import { HomeScreen } from '../Screens/HomeScreen';
import { UplaodScreen } from '../Screens/UplaodScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();
class StackNavigation extends PureComponent {
    
    constructor(props) {
        super(props);
    }
    render() {
        return (
          <NavigationContainer>
                <Stack.Navigator  headerMode="none">
                    <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    />
                    <Stack.Screen name="Upload" component={UplaodScreen} options={{header: 'none'}}  />
                    <Stack.Screen name="Video Record" component={Camera} />
                 </Stack.Navigator>
           </NavigationContainer>
        );
    }
}

export default StackNavigation;