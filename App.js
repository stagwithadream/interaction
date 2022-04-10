
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import React from 'react';
import type {Node} from 'react';
import Camera from './src/VideoRecord/Camera.js';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import { StackNavigation } from './src/Navigatoin/StackNavigation.js';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import  HomeScreen  from './src/Screens/HomeScreen.js';
import  UplaodScreen  from './src/Screens/UplaodScreen';
import Cam from './src/VideoRecord/Cam.js';

const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  //const Stack = createNativeStackNavigator();

  const Tab = createBottomTabNavigator();





  return (
   //  <NavigationContainer>
   //     <Stack.Navigator>
   //                  <Stack.Screen
   //                  name="Home"
   //                  component={HomeScreen}
   //                  options={{ title: 'Welcome' }}
   //                  />
   //                  <Stack.Screen name="Upload" component={UplaodScreen} />
   //                  <Stack.Screen name="Video Record" component={Cam}  options={{headerShown: false}} />
   //       </Stack.Navigator>
   // </NavigationContainer>
   //
   //
 //  <CameraScreen/>
 <NavigationContainer>
 <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;

            if (route.name === 'Home') {
              iconName = focused
                ? 'md-home'
                : 'md-home-outline';
            } else if (route.name === 'Upload') {
              iconName = focused ? 'md-cloud-upload' : 'md-cloud-upload-outline';
            }
            else if (route.name === 'Video Record') {
              iconName = focused ? 'camera' : 'camera-outline';
            }
            else if (route.name === 'Surveys') {
              iconName = focused ? 'bar-chart' : 'bar-chart-outline';
            }


            // You can return any component that you like here!
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: 'tomato',
          tabBarInactiveTintColor: 'gray',
        })}
      >


  <Tab.Screen name="Home" component={HomeScreen} />
  <Tab.Screen name="Upload" component={UplaodScreen} />
   <Tab.Screen name="Video Record" component={Cam} 
  // options={{
  //       tabBarButton: () => null,
  //       tabBarVisible: false, // if you don't want to see the tab bar
  //     }}
  />
  <Tab.Screen name="Surveys" component={UplaodScreen} options={{ tabBarBadge: 3 }} />
</Tab.Navigator>
</NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
