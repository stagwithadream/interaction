// this page renders the page of upload video, where users can select and upload a video, and has functionalities
// to upload videos into s3 bucket. aws-sdk client has been used to connect to aws s3 bucket and upload.

import React, {PureComponent} from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Dimensions,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Modal,
} from 'react-native';
import {Button} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'react-native-image-picker';
import Video from 'react-native-video';
import Orientation from 'react-native-orientation';
import {getDataAsync, postDataAsync} from '../utils/Api';
import axios from 'axios';

// presigned url code
import S3 from 'aws-sdk/clients/s3';
import {Credentials} from 'aws-sdk';

import uuid from 'react-native-uuid';

const screen = Dimensions.get('window');

export const getBlob = async fileUri => {
  const resp = await fetch(fileUri);
  const imageBody = await resp.blob();
  return imageBody;
};
// this function gets called when an upload image and upload url,presigned by aws s3, is available == video gets
// uploaded to the s3 bucket.
export const uploadImage = async (uploadUrl, data) => {
  const imageBody = await getBlob(data);
  console.log(imageBody);
  return fetch(uploadUrl, {
    method: 'PUT',
    body: imageBody,
  });
};
const durl = 'http://18.209.179.4:8000/hospital/get_url/'; // url of the website to get a presigned get_url
// requestUpload function takes params as username and generates random fileID and requests for a presigned url using these
// params so that a video can be uploaded from the user's phone
export const requestUpload = async () => {
  const data = {userName: 'Sairam', fileID: uuid.v4()};
  return fetch(durl, {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export default class UplaodScreen extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: false, // manage loader
      video:
        this.props.route.params != undefined
          ? this.props.route.params.video
          : '', // store video
      paused: false,
      showModal: false,
      showConfirm: false,
      success: false,
    };
    this.toggleVideoPlay = this.toggleVideoPlay.bind(this);
    this.cancelUpload = this.cancelUpload.bind(this);
    this.createNewFeed = this.createNewFeed.bind(this);
    this.confirmModal = this.confirmModal.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.getModalContent = this.getModalContent.bind(this);
  }

  async componentDidMount() {
    var Orientation = require('react-native').NativeModules.Orientation;
    Orientation.unlockAllOrientations();
    Orientation.lockToPortrait();
  }
  /**
   * Select video & store in state
   */
  selectVideo = async () => {
    ImagePicker.launchImageLibrary(
      {mediaType: 'video', includeBase64: true},
      response => {
        this.setState({video: response.assets[0]});
      },
    );
  };
  /**
   * send feed details to server
   */

  createNewFeed = async () => {
    this.setState({loading: true, showConfirm: false});
    const {video} = this.state;
    let errorFlag = false;

    const res = await requestUpload();
    //console.log(res);
    const data = await res.json();
    // console.log(data.url);
    console.log(this.state.video);
    await uploadImage(data.url, this.state.video.uri);
  };

  toggleVideoPlay() {
    this.setState({paused: !this.state.paused});
  }

  cancelUpload() {
    if (this.props.route.params.currentRecording) {
      this.props.navigation.navigate('Video Record', {nav: true});
    }
    this.setState({video: ''});
  }

  confirmModal() {
    this.setState({showModal: true, showConfirm: true});
  }
  closeModal() {
    this.setState({showModal: false, showConfirm: false});
  }
  getModalContent() {
    if (this.state.loading) {
      return (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="black" />
        </View>
      );
    } else if (this.state.success) {
      return (
        <View>
          <Icon
            style={styles.modalIcon}
            name="md-checkmark-circle"
            size={60}
            color="green"
          />
          <Text style={styles.text}>Successfully updated</Text>
        </View>
      );
    } else {
      return (
        <View>
          <Icon
            style={styles.modalIcon}
            name="alert-circle"
            size={60}
            color="red"
          />
          <Text style={styles.text}>Error Uplaoding! Please try again</Text>
        </View>
      );
    }
  }
  render() {
    const text = this.state.loading
      ? 'Loading...'
      : this.state.success
      ? 'Success!!'
      : 'Failure!';
    const modalHeaderText =
      this.state.showModal && this.state.showConfirm
        ? 'Uplaod Confirmation!'
        : text;
    return (
      <View style={styles.SplashLayout}>
        {this.state.video === '' ? (
          <ScrollView>
            <View style={styles.MediaLayout}>
              <View
                style={[
                  styles.Media,
                  {
                    marginLeft: '15%',
                    backgroundColor: this.state.video ? '#6200ee' : '#ffffff',
                  },
                ]}>
                <TouchableOpacity onPress={() => this.selectVideo()}>
                  <Icon
                    name="videocam-outline"
                    size={50}
                    color={this.state.video ? '#fff' : '#6200ee'}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.inputLayout}>
              <Text style={{color: 'black', fontSize: 15}}>
                Select Video from Gallery
              </Text>
            </View>
          </ScrollView>
        ) : (
          <View
            style={{flex: 1, flexDirection: 'row', backgroundColor: 'black'}}>
            <Video
              source={{uri: this.state.video.uri}}
              ref={ref => {
                this.player = ref;
              }}
              fullscreen={true}
              fullscreenOrientation="landscape"
              style={styles.video}
              paused={this.state.paused}
              onLoad={() => {
                this.setState({
                  paused: true,
                });
              }}
            />
            <Modal
              animationType="slide"
              transparent={true}
              visible={this.state.showModal}>
              <View style={styles.centeredView}>
                <View style={styles.modalView}>
                  <View>
                    <Text style={styles.modalHeader}>{modalHeaderText}</Text>
                  </View>
                  {this.state.showConfirm ? (
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}>
                      <View style={{flex: 2}}>
                        <Text>Confirm to upload Video</Text>
                      </View>
                      <View
                        style={{
                          flex: 1,
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                        }}>
                        <View>
                          <Button
                            color="green"
                            title="Confirm"
                            onPress={this.createNewFeed}
                          />
                        </View>
                        <View>
                          <Button
                            title="Cancel"
                            color="red"
                            style={{flex: 2}}
                            onPress={this.closeModal}
                          />
                        </View>
                      </View>
                    </View>
                  ) : (
                    this.getModalContent()
                  )}
                </View>
              </View>
            </Modal>

            <TouchableOpacity
              style={{
                opacity: 0.8,
                color: 'white',
                position: 'absolute',
                top: screen.height / 5,
                left: screen.width / 2 - 10,
              }}>
              {!this.state.paused ? (
                <Icon
                  name="pause"
                  color="white"
                  size={30}
                  onPress={() => this.toggleVideoPlay()}
                />
              ) : (
                <Icon
                  name="play"
                  color="white"
                  size={30}
                  onPress={() => this.toggleVideoPlay()}
                />
              )}
            </TouchableOpacity>
            <View style={styles.buttonsContainer}>
              <View style={{flex: 2, paddingRight: 10}}>
                <Button title="Upload Video" onPress={this.confirmModal} />
              </View>
              <View style={{flex: 2}}>
                <Button
                  title="Cancel"
                  color="red"
                  style={{flex: 2}}
                  onPress={this.cancelUpload}
                />
              </View>
            </View>
          </View>
        )}
      </View>
    );
  }
}
const styles = StyleSheet.create({
  SplashLayout: {
    flex: 1,
  },
  inputLayout: {
    paddingHorizontal: 100,
    paddingVertical: 20,
  },
  textDanger: {
    color: '#dc3545',
  },
  MediaLayout: {
    paddingHorizontal: 20,
    width: screen.width - 40,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '50%',
  },
  Media: {
    width: (screen.width - 60) / 2,
    height: (screen.width - 60) / 2,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderRadius: 10,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    position: 'absolute',
    top: screen.height / 5,
    bottom: 0,
    left: 10,
    right: 10,
    width: '95%',
    height: '100%',
  },
  buttonsContainer: {
    flex: 1,
    position: 'absolute',
    top: screen.height - 200,
    left: screen.width / 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  loader: {
    padding: 30,
  },
  modalIcon: {
    marginLeft: '34%',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalHeader: {
    fontWeight: 'bold',
    fontSize: 16,
    padding: 10,
  },
  modalView: {
    // margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    // padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    height: screen.width / 2,
    width: '60%',
  },
});
