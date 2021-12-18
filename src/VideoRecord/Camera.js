import React, {PureComponent} from 'react';
import { View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {RNCamera} from 'react-native-camera';
import CameraRoll from "@react-native-community/cameraroll";
import Icon from 'react-native-vector-icons/FontAwesome';
import moment from 'moment';

export default class Camera extends PureComponent {  
    
    constructor(props) {
         super(props);
         this.state = {
           recording: false,
           currentRecording: null,
           showRecording: false,
           cameType: RNCamera.Constants.Type.front,
           time: 600,
           canDetectFaces: false
         }
        this.startRecording = this.startRecording.bind(this);
        this.stopRecording = this.stopRecording.bind(this);
        this.flipSide = this.flipSide.bind(this);
        this.startTimer = this.startTimer.bind(this);
        this.stopTimer = this.stopTimer.bind(this);
        this.convertTimeString = this.convertTimeString.bind(this);
        this.renderTimer = this.renderTimer.bind(this);
        this.onFaceDetected = this. onFaceDetected.bind(this);
        this.toggle = this.toggle.bind(this);
    }

    flipSide() {
      if (this.state.cameType === RNCamera.Constants.Type.front ){
        this.setState({cameType: RNCamera.Constants.Type.back});
      } else {
        this.setState({cameType: RNCamera.Constants.Type.front});
      }
      
    }

    toggle = value => () => this.setState(prevState => ({ [value]: !prevState[value] }));

    // onFaceDetected(obj) {
    //   console.log("inside");
    //   console.log(obj);
    // }
    startTimer = () => {
      this.timer = setInterval(() => {
        const time = this.state.time - 1;
        this.setState({ time });
        if (this.state.time <= 0 ) {
          this.stopRecording();
        }
      }, 1000);
    }
  
    stopTimer = () => {
      if (this.timer) clearInterval(this.timer);
    }

    convertTimeString = (time) => {
      return moment().startOf('day').seconds(time).format('mm:ss');
    }
  
    renderTimer() {
      const  time  = this.state.time;
      return (
       
        <View style={{flex: 1, left: '50%', top: '2%'}}>
          <View style={styles.timer}>
            <Text style={styles.timerText}>
                {this.convertTimeString(time)}
            </Text>
          </View>
        </View> 
      );
    }

    async startRecording() {
      this.setState({ recording: true,canDetectFaces: true });
      this.startTimer();
      // default to mp4 for android as codec is not set
      const { uri, codec = "mp4" } = await this.camera.recordAsync();
      console.log(uri);
      console.log(CameraRoll.getAlbums());
      CameraRoll.save(uri)

      this.setState({currentRecording: uri});
  }

  onFaceDetected () {
    console.log("inside");
  }

  stopRecording() {
    this.camera.stopRecording();
    this.stopTimer();
    this.setState({ recording: false, showRecording: true, time :600, canDetectFaces: false});
}

render() {
  const { canDetectFaces } = this.state;
  console.log(this.state.canDetectFaces);
  return (
    <View style={{ flex: 1}}>
         
        <View style={styles.container}>
              <RNCamera
              ref={ref => {
                this.camera = ref;
              }}
              style={styles.preview}
              faceDetectionMode={RNCamera.Constants.FaceDetection.Mode.accurate}
              onFacesDetected={canDetectFaces ?  console.log("inside") : null}
              onFaceDetectionError={(obj) => console.log(obj)}
              orientation="landscapeLeft"
              type={this.state.cameType}
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
              
            >{this.state.recording ? this.renderTimer : null}</RNCamera>
            
        <View style={{ flex : 1, justifyContent: 'flex-end', borderWith: 3, borderColor: 'yellow', bottom: 0}}>
              <View style={{flexDirection: 'row', justifyContent: 'flex-start', alignItems: 'flex-start' }}>
                  <View style={{flex: 1, bottom: 20, right: '180%', position: 'absolute'}}>
                      
                      <TouchableOpacity
                            style={{
                                opacity: 0.8,
                                color: "white"
                              }}
                            onPress={this.flipSide}
                            >
                            <Icon name="refresh"  
                                  color="white"
                                  size={30}/>
                        </TouchableOpacity>
                  </View>
                  <View style={{flex: 1,alignSelf: 'center'}}>
                    <View style={styles.iconContainer}>
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
                      </TouchableOpacity> 
                      }
                    </View>
                
                  </View>
              </View>
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
      flexDirection: 'row',
      position: 'relative'
     // height: '90%'
    },
      iconContainer: {
        flex: 1,
        position: 'absolute',
        right: '80%',
      //  top: '89%',
       // flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: 70,
        borderWidth: 2,
        height: 70,
        width: 70,
        borderColor: 'white',
        bottom:10,
     //   alignSelf: 'flex-end'
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
      timerText: {
        fontSize: 23, 
        color: 'white', 
        opacity: 1.0, 
        fontWeight: 'bold', 
        paddingLeft: 13, 
        paddingTop: 8
      },
      timer: {
        backgroundColor: '#5e5a5a', 
        borderRadius: 5, 
        height:50, 
        width: 80
      }

  });