import React, {PureComponent} from 'react';
import { View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {RNCamera} from 'react-native-camera';
export default class Camera extends PureComponent {  
    
    constructor(props) {
         super(props);
         this.state = {
           recording: false,
           currentRecording: null
         }
        this.startRecording = this.startRecording.bind(this);
        this.stopRecording = this.stopRecording.bind(this);
    }

    async startRecording() {
      this.setState({ recording: true });
      // default to mp4 for android as codec is not set
      const { uri, codec = "mp4" } = await this.camera.recordAsync();
      console.log(uri);
      this.setState({currentRecording: uri});
  }

  stopRecording() {
    this.camera.stopRecording();
    this.setState({ recording: false});
}
  
render() {
  return (
    <View style={{ flex: 1}}>
      
      <View style={styles.container}>
            <RNCamera
            ref={ref => {
              this.camera = ref;
            }}
            style={styles.preview}
            orientation="landscapeRight"
            type={RNCamera.Constants.Type.back}
            flashMode={RNCamera.Constants.FlashMode.on}
            defaultVideoQuality={RNCamera.Constants.VideoQuality["480p"]}
            androidCameraPermissionOptions={{
              title: 'Permission to use camera',
              message: 'We need your permission to use your camera',
              buttonPositive: 'Ok',
              buttonNegative: 'Cancel',
            }}
            androidRecordAudioPermissionOptions={{
              title: 'Permission to use audio recording',
              message: 'We need your permission to use your audio',
              buttonPositive: 'Ok',
              buttonNegative: 'Cancel',
            }}
    
          />
          <View
            style={styles.iconContainer}
          >
              {!this.state.recording  ? 
              <TouchableOpacity
              style={styles.recordingOn}
              onPress={() => {this.startRecording()}}
              >
              </TouchableOpacity> :
              <TouchableOpacity
              style={styles.recordingOff}
              onPress={() => {this.stopRecording()}}
              >
              </TouchableOpacity> }
          </View>
        </View> 
    </View>
    );
  }}

  const styles = StyleSheet.create({
   
    container: {
      flex: 1,
      width: '100%',
      backgroundColor: 'transparent',
      flexDirection: 'row'
    },
      iconContainer: {
        position: 'absolute',
        left: '40%',
        top: '89%',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: 70,
        borderWidth: 2,
        height: 70,
        width: 70,
        borderColor: 'white',
        bottom:0,
        alignSelf: 'flex-end'
    },
    recordingOn: {
      top: '12%',
      left: '12%',
      width:  50,
      height: 50,
      backgroundColor:'red',
      borderRadius:50
    },
    recordingOff: {
      top: '25%',
      left: '25%',
      width:  35,
      height: 35,
      backgroundColor:'red',
        borderRadius:10
    },

      preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
      },
      capture: {
        flex: 0,
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 15,
        paddingHorizontal: 20,
        alignSelf: 'center',
        margin: 20,
      },
  });