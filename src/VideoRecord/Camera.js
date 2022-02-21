import React, {PureComponent} from 'react';
import { View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {RNCamera} from 'react-native-camera';
import CameraRoll from "@react-native-community/cameraroll";
import Icon from 'react-native-vector-icons/FontAwesome';
import moment from 'moment';
import ViewShot from "react-native-view-shot";
import FaceDetection, { FaceDetectorContourMode, FaceDetectorLandmarkMode, FaceContourType } from "react-native-face-detection";
import ImageRotate from 'react-native-image-rotate';
import { Dimensions } from 'react-native';
import { captureRef } from "react-native-view-shot";

export default class Camera extends PureComponent {  
    
    constructor(props) {
         super(props);
         this.state = {
           recording: false,
           currentRecording: null,
           showRecording: false,
           cameType: RNCamera.Constants.Type.front,
           time: 600,
           canDetectFaces: false,
           faces: []
         }
        this.startRecording = this.startRecording.bind(this);
        this.stopRecording = this.stopRecording.bind(this);
        this.flipSide = this.flipSide.bind(this);
        this.startTimer = this.startTimer.bind(this);
        this.takePicture = this.takePicture.bind(this);
        this.stopTimer = this.stopTimer.bind(this);
        this.takePictures = this.takePictures.bind(this);
        this.convertTimeString = this.convertTimeString.bind(this);
        this.renderTimer = this.renderTimer.bind(this);
      //  this.facesDetected = this.facesDetected.bind(this);
        this.toggle = this.toggle.bind(this);
        this.viewShot = {};
    }

    flipSide() {
      if (this.state.cameType === RNCamera.Constants.Type.front ){
        this.setState({cameType: RNCamera.Constants.Type.back});
      } else {
        this.setState({cameType: RNCamera.Constants.Type.front});
      }
      
    }

    toggle = value => () => this.setState(prevState => ({ [value]: !prevState[value] }));

    startTimer = () => {
      this.timer = setInterval(() => {
        const time = this.state.time - 1;
        this.setState({ time });
        if (this.state.time <= 0 ) {
          this.stopRecording();
        }
      }, 1000);
    }

    takePictures = () => {
     this.t2 = setInterval(() => {
       if(this.viewShot != null) {
        this.viewShot.capture().then(uri => {
          console.log("do something with ", uri);
        //  CameraRoll.save(uri);
        const windowWidth = Dimensions.get('window').width;
        const windowHeight = Dimensions.get('window').height;
        console.log(Dimensions.get('window').scale);

        console.log(windowHeight);
        console.log(windowWidth);
        if (windowHeight < windowWidth) {
          console.log("in");
         uri =  ImageRotate.rotateImage(
            uri,
            90,
            (newUri) => {
                console.log(newUri, 'uri')
                return newUri;
            },
            (error) => {
                console.error(error);
            }
        );
         CameraRoll.save(uri);
        }
        CameraRoll.save(uri);
          this.takePicture(uri);
        });
       }
      
      }, 5000);
    }

    takePicture = async (imagePath) => {
      const options = {
        landmarkMode: FaceDetectorLandmarkMode.ALL,
        contourMode: FaceDetectorContourMode.ALL
      };
      const faces = await FaceDetection.processImage(imagePath, options);
      console.log(faces.length);
      if(faces.length !=0) {
        faces.forEach((face) => {
          console.log(face);
          // console.log(face.landmarks);
        });
      }
      this.setState({faces: faces});
  };
  
  
    stopTimer = () => {
      if (this.timer) clearInterval(this.timer);
      if(this.t2) clearInterval(this.t2);
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
            <Text style={styles.timerText}>
            faces:{this.state.faces.length}
            </Text>
          </View>
        </View> 
      );
    }

    async startRecording() {
      this.setState({ recording: true,canDetectFaces: true });
      this.takePictures();
      this.startTimer();
      // default to mp4 for android as codec is not set
      const { uri, codec = "mp4" } = await this.camera.recordAsync();
      console.log(uri);
      console.log(CameraRoll.getAlbums());

   //   CameraRoll.save(uri)

      this.setState({currentRecording: uri});
    }


  stopRecording() {
    this.camera.stopRecording();
    this.stopTimer();
    this.setState({ recording: false, showRecording: true, time :600, canDetectFaces: false});
}

renderFaces = () => (
  <View style={styles.facesContainer} pointerEvents="none">
    {this.state.faces.map(this.renderFace)}
  </View>
);

render() {
  const { canDetectFaces } = this.state;
  return (
    <View style={{ flex: 1}}>
         
        <ViewShot style={styles.container} ref="viewShot" options={{ format: "jpg", quality: 0.9 }} ref={ref => {
                this.viewShot = ref;
              }}>
              <RNCamera
              ref={ref => {
                this.camera = ref;
              }}
              style={styles.preview}
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
              
            >
            {this.state.recording ? this.renderTimer : null}
            
           
            </RNCamera> 
        

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
        </ViewShot>
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
      },
      facesContainer: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        left: 0,
        top: 0,
      },
      face: {
        padding: 10,
        borderWidth: 2,
        borderRadius: 2,
        position: 'absolute',
        borderColor: '#FFD700',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      },
  });