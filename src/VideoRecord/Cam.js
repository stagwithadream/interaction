import React, {PureComponent} from 'react';
import {View, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {RNCamera} from 'react-native-camera';
import CameraRoll from '@react-native-community/cameraroll';
import Icon from 'react-native-vector-icons/FontAwesome';
import moment from 'moment';
import ViewShot from 'react-native-view-shot';
import FaceDetection, {
  FaceDetectorContourMode,
  FaceDetectorLandmarkMode,
  FaceContourType,
} from 'react-native-face-detection';
import { Button, Image } from 'react-native';
import Orientation from 'react-native-orientation';
import { PermissionsAndroid, Platform } from 'react-native';
import Swiper from 'react-native-swiper'

const DESIRED_RATIO = '16:9';

export default class Cam extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      recording: false,
      currentRecording: null,
      showRecording: false,
      cameType: RNCamera.Constants.Type.front,
      time: 10,
      canDetectFaces: false,
      showUplaod: false,
      faces: [],
      showCamera: false,
      preTimer: false,
      iconContainer: false,
      correct: false,
      wrong: false
    };
    this.startRecording = this.startRecording.bind(this);
    this.stopRecording = this.stopRecording.bind(this);
    this.flipSide = this.flipSide.bind(this);
    this.startTimer = this.startTimer.bind(this);
    this.takePicture = this.takePicture.bind(this);
    this.stopTimer = this.stopTimer.bind(this);
    this.takePictures = this.takePictures.bind(this);
    this.convertTimeString = this.convertTimeString.bind(this);
    this.renderTimer = this.renderTimer.bind(this);
    this.prepareRatio = this.prepareRatio.bind(this);
    this.renderPreTimer = this.renderPreTimer.bind(this);
    this.toggle = this.toggle.bind(this);
    this.showCamera = this.showCamera.bind(this);
    this.viewShot = {};
    this.startPreRecordingTimer = this.startPreRecordingTimer.bind(this);
    this.snap = this.snap.bind(this);
    this.checkFaces = this.checkFaces.bind(this);
  }

  async componentDidMount() {
   
    Orientation.lockToLandscape();
  }

  componentWillUnmount() {
    Orientation.unlockAllOrientations();
  }

  componentDidUpdate(prevProps){
    if(this.props.route.params != undefined && this.props.route.params.nav) {
      Orientation.unlockAllOrientations();
      Orientation.lockToLandscape();
    }
    
  }
  flipSide() {
    if (this.state.cameType === RNCamera.Constants.Type.front) {
      this.setState({cameType: RNCamera.Constants.Type.back});
    } else {
      this.setState({cameType: RNCamera.Constants.Type.front});
    }
  }

  toggle = value => () =>
    this.setState(prevState => ({[value]: !prevState[value]}));

  startTimer = () => {
    this.timer = setInterval(() => {
      const time = this.state.time - 1;
      this.setState({time});
      console.log(this.state.time);
      // check faces in last 5 seconds
      if(this.state.time == 5 && this.state.preTimer) {
        this.snap();
      }
      if (this.state.time <= 0) {
        if(this.state.preTimer){
          this.stopTimer();
          this.setState({preTimer: false, time:3, iconContainer: true}, () => this.startTimer());
          //start recodring after inital countdown
        } else if(this.state.correct) {
          this.stopTimer();
          this.setState({correct: false, iconContainer: false}, () => {this.startRecording();})
        }else if(this.state.wrong) {
          this.stopTimer();
          this.setState({wrong: false, iconContainer: false, time: 10})
        }
        else {
          // stop recording actual video
          this.stopRecording();
        }
        
      }
    }, 1000);
  };

  takePictures = () => {
    this.t2 = setInterval(() => {
          this.snap();
    }, 2000);
  };

  snap(){
    if (this.viewShot != null) {
      this.viewShot.capture().then(uri => {
        console.log('do something with ', uri);
        this.takePicture(uri);
      });
    }
  }

  takePicture = async imagePath => {
    const options = {
      landmarkMode: FaceDetectorLandmarkMode.ALL,
      contourMode: FaceDetectorContourMode.ALL,
    };
    const faces = await FaceDetection.processImage(imagePath, options);
    this.setState({faces: faces},() => {this.checkFaces()});
    console.log(faces);
  };

  stopTimer = () => {
    if (this.timer) clearInterval(this.timer);
    if (this.t2) clearInterval(this.t2);
  };

  convertTimeString = time => {
    return moment().startOf('day').seconds(time).format('mm:ss');
  };

  renderTimer() {
    const time = this.state.time;
    return (
      <View style={{flex: 1, right: '0%', top: '2%'}}>
        <View style={styles.timer}>
          <Text style={styles.timerText}>{this.convertTimeString(time)}</Text>
          <Text style={{fontSize: 15, color: 'white', paddingTop: 7}}>faces:{this.state.faces.length}</Text>
        </View>
      </View>
    );
  }

  renderPreTimer() {
    console.log('inside timer')
    const time = this.state.time;
    return (
      <View style={{flex: 1, right: '0%', top: '40%'}}>
        <View style={styles.preTimer}>
          <Text>
            <Text style={styles.preTimerText}>Start Recording in </Text><Text style={[styles.preTimerText,{fontWeight: 'bold', color: 'red'}]}>  {moment().startOf('day').seconds(time).format('ss')}</Text>
          </Text>
        </View>
      </View>
    );
  }

  async startRecording() {
    this.setState({recording: true, canDetectFaces: true, time: 300});
    this.takePictures();
    this.startTimer();
    // default to mp4 for android as codec is not set
    const {uri, codec = 'mp4'} = await this.camera.recordAsync();
    CameraRoll.save(uri).then((e) => {
      let arr = e.split(':')[1].split('/');
      this.props.navigation.navigate("Upload", {video: e, currentRecording: true});
    });

    this.setState({currentRecording: uri});
  }
 //check faces initially
  checkFaces() {
      if(this.state.faces.length == 2) {
        this.setState({correct: true});
      }else {
        this.setState({wrong: true});
      }
  }

  async startPreRecordingTimer() {
    // show countdown over camera
    this.setState({preTimer: true});
    this.startTimer();
  }

  stopRecording() {
    this.camera.stopRecording();
    this.stopTimer();
     this.setState({
      recording: false,
      showRecording: true,
      time: 600,
      canDetectFaces: false,
      showUplaod: true,
     });
  }

  renderFaces = () => (
    <View style={styles.facesContainer} pointerEvents="none">
      {this.state.faces.map(this.renderFace)}
    </View>
  );

  prepareRatio = async () => {
    if (Platform.OS === 'android' && this.cam) {
      const ratios = await this.cam.getSupportedRatiosAsync();

      // See if the current device has your desired ratio, otherwise get the maximum supported one
      // Usually the last element of "ratios" is the maximum supported ratio
      const ratio =
        ratios.find(ratio => ratio === DESIRED_RATIO) ||
        ratios[ratios.length - 1];

      this.setState({ratio});
    }
  };

  showCamera() {
    this.setState({showCamera: true})
  }

  getIcon() {
    return (
      <View style={{flex: 1, right: '0%', top: '30%'}}>
        <View>
          {this.state.correct ? <Icon name="refresh" color="white" size={80} /> : null}
          {this.state.wrong ? <Icon name="refresh" color="white" size={80} /> : null}
        </View>
      </View>
    );
  }


  render() {
    const {canDetectFaces} = this.state;
    return (
      <View style={{flex: 6, height: '100%'}}>
        {!this.state.showCamera ? 
          <Swiper style={styles.wrapper} showsButtons loop={false}>
            <View testID="Hello" style={styles.slide1}>
              <Text style={styles.text}>Please make sure you and your infant each have a chair to sit in</Text>
              <Image
                style={styles.tinyLogo}
                source={require('../images/chair.jpg')}
              />
            </View>
            <View testID="Beautiful" style={styles.slide2}>
              <Text style={styles.text}>Grab an object you can use to prop up your phone</Text>
              <Image
                style={styles.propImage}
                source={require('../images/prop.jpg')}
              />
            </View>
            <View testID="Simple" style={styles.slide3}>
              <Text style={styles.text}>Make sure to turn on a light or face a window so that your faces are visible</Text>
              <Image
                style={styles.tinyLogo}
                source={require('../images/bulb.jpg')}
              />
            </View>
            <View testID="Simple" style={styles.slide3}>
              <Text style={styles.text}>Get seated and ready to record</Text>
              <Button color="#ADD8E6" title="Record" onPress={this.showCamera}/>  
            </View>
          </Swiper> : 
          <View style={{flex: 6, height: '100%'}}>
           <ViewShot
            style={styles.container}
            ref="viewShot"
            options={{format: 'jpg', quality: 0.9}}
            ref={ref => {
              this.viewShot = ref;
            }}>
          <RNCamera
            ref={ref => {
              this.camera = ref;
            }}
            onCameraReady={this.prepareRatio}
            style={styles.preview}
            // You can only get the supported ratios when the camera is mounted

            //orientation="landscapeLeft"
            type={this.state.cameType}
            flashMode={RNCamera.Constants.FlashMode.on}
            defaultVideoQuality={RNCamera.Constants.VideoQuality['480p']}
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
            }}>
               {this.state.recording ? this.renderTimer() : null}
               {this.state.preTimer ? this.renderPreTimer() : null}
               {this.state.iconContainer && this.state.correct ? 
                <View style={{flex: 1, right: '0%', top: '20%'}}>
                  <Icon name="check-square-o" color="green" size={150} /> 
                </View>:
                 null}
               {this.state.iconContainer && this.state.wrong ? 
                <View style={{flex: 1, right: '0%', top: '30%'}}>
                  <Icon name="close" color="red" size={150} /> 
                </View> : 
                null}
          </RNCamera>
           </ViewShot>
            <View
              style={{
                padding: 20,
                bottom: 10,
                right: '0%',
                position: 'absolute',
              }}>
              <TouchableOpacity
                style={{
                  opacity: 0.8,
                  color: 'white',
                }}
                onPress={this.flipSide}>
                <Icon name="refresh" color="white" size={30} />
              </TouchableOpacity>
            </View>
            <View style={{top: '38%', right: '0.9%', position: 'absolute'}}>
              <View style={styles.iconContainer}>
                {!this.state.recording ? (
                  <TouchableOpacity
                    style={styles.recordingOn}
                    onPress={() => {
                      this.startPreRecordingTimer();
                    }}></TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.recordingOff}
                    onPress={() => {
                      this.stopRecording();
                    }}></TouchableOpacity>
                )}
              </View>
            </View> 
          </View>  }
         
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 6,
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    position: 'relative',
    // height: '90%'
  },
  iconContainer: {
    position: 'absolute',
    right: '10%',

    top: '38%',
    // flexDirection: 'column',
    justifyContent: 'space-between',
    borderRadius: 70,
    borderWidth: 2,
    height: 70,
    width: 70,
    borderColor: 'white',
    bottom: 10,
    //   alignSelf: 'flex-end'
  },
  recordingOn: {
    top: '12%',
    left: '12%',
    width: 50,
    height: 50,
    backgroundColor: 'red',
    borderRadius: 50,
  },
  recordingOff: {
    top: '25%',
    left: '25%',
    width: 35,
    height: 35,
    backgroundColor: 'red',
    borderRadius: 10,
  },

  preview: {
    flex: 6,
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
  preTimerText: {
    fontSize: 23,
    color: 'white',
    opacity: 1.0,
    fontWeight: 'bold',
    
  },
  timerText: {
    fontSize: 23,
    color: 'white',
    opacity: 1.0,
    fontWeight: 'bold',
    paddingLeft: 13,
    paddingTop: 8,
  },
  preTimer: {
    backgroundColor: '#5e5a5a',
    opacity: 0.5,
    borderRadius: 5,
    height: 70,
    width: 500,
    paddingLeft: 100,
    paddingRight: 50,
    paddingTop: 20,
  },
  timer: {
    backgroundColor: '#5e5a5a',
    borderRadius: 5,
    height: 50,
    width: 80,
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
  uploadIcon: {
    // transform: rotate(45)
  },
  wrapper: {},
  slide1: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#9DD6EB'
  },
  slide2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#97CAE5'
  },
  slide3: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#92BBD9'
  },
  text: {
    color: '#fff',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    padding: 20
  },
  tinyLogo: {
    width: 50,
    height: 50,
  },
  propImage: {
    width: 150,
    height: 70
  }
});
