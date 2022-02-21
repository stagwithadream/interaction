import React,{PureComponent} from 'react';
import { StyleSheet, ScrollView, View, Dimensions, TouchableOpacity, Text, ActivityIndicator, Modal } from 'react-native';
import { Button } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import * as ImagePicker from 'react-native-image-picker';
import Video from 'react-native-video';
import Orientation from 'react-native-orientation';
import { getDataAsync} from '../utils/Api';

const screen = Dimensions.get('window');

export default class UplaodScreen extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,         // manage loader   
            video: this.props.route.params != undefined ?  this.props.route.params.video : "",              // store video
            paused: false,
            showModal: false
        }
        this.toggleVideoPlay = this.toggleVideoPlay.bind(this);
        this.cancelUpload = this.cancelUpload.bind(this);
        this.createNewFeed = this.createNewFeed.bind(this);
        this.confirmModal = this.confirmModal.bind(this);
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
        ImagePicker.launchImageLibrary({ mediaType: 'video', includeBase64: true }, (response) => {
            console.log(response);
            this.setState({ video: response.assets[0].uri });
        })
    }
    /**
     * send feed details to server
     */
    createNewFeed = async () => {
        this.setState({ loading: true })
        const {  video } = this.state;
        let errorFlag = false;
        let formData = new FormData();
        if (video) {
            formData.append("videoFile", {
                name: "name.mp4",
                uri: video.uri,
                type: 'video/mp4'
            });
        }
        //   formData.append("user_id", userDetails.id);
        var base_url = "https://yourdomain.com/";
        // fetch(base_url + 'hospital/hello/', {
        //     method: 'GET',
        //     // headers: {
        //     //     'Content-Type': 'multipart/form-data',
        //     // },
        //     // body: formData
        // })
        getDataAsync('hospital/hello/')
            .then(async (res) => {
                this.setState({ loading: false });
                console.log(res)
            })
            .catch(error => {
                console.log("err:"+error);
                this.setState({ loading: false });
            });

    }

    toggleVideoPlay() {
        this.setState({paused: !this.state.paused});
    }

    cancelUpload() {
        if(this.props.route.params.currentRecording) {
            this.props.navigation.navigate("Video Record", {nav: true});
        }
        this.setState({video: ""});
    }

    confirmModal(){
        this.setState({showModal: true});
    }
    render() {
       
        return (
            <View style={styles.SplashLayout}>
                {this.state.video === "" ? 
                <ScrollView>
                    <View style={styles.MediaLayout}>
                        <View style={[styles.Media, { marginLeft: '15%', backgroundColor: this.state.video ? "#6200ee" : "#ffffff" }]}>
                            <TouchableOpacity onPress={() => this.selectVideo()} ><Icon name="videocam-outline" size={50} color={this.state.video ? "#fff" : "#6200ee"} /></TouchableOpacity>
                        </View>
                    </View>
                    <View style={styles.inputLayout}>
                        <Text style={{ color: 'black',fontSize: 15}}>
                           Select Video from Gallery
                        </Text>
                    </View>
                </ScrollView> 
                  : 
                  <View style={{flex: 1,flexDirection: 'row', backgroundColor: 'black'}}>
                    <Video source={{uri: this.state.video }}   
                        ref={(ref) => {
                            this.player = ref
                        }}    
                        fullscreen={true}  
                        fullscreenOrientation='landscape'   
                        style={styles.video}   
                        paused={this.state.paused}    
                        onLoad={() => {
                            this.setState({
                            paused: true
                            });
                        }}                      
                        />
                         <Modal
                            animationType="slide"
                            transparent={true}
                            visible={this.state.showModal}
                            >
                            <View style={styles.centeredView}>
                                <View style={styles.modalView}>
                                    <Text>Hello World!</Text>
                                </View>
                            </View>
                        </Modal>
                        {/* <View style={styles.loader}>
                            <Text style={{color: 'white', zIndex: 2}}>
                                Uplaoding....
                            </Text>
                            <ActivityIndicator  size="large" color="white" /> 
                        </View> */}
                        <TouchableOpacity
                            style={{
                            opacity: 0.8,
                            color: 'white',
                            position:'absolute',
                            top: screen.height/5,
                            left: screen.width/2-10,
                            }}
                        >
                          {!this.state.paused ?  <Icon name="pause" color="white" size={30} onPress={() =>this.toggleVideoPlay()} /> :
                          <Icon name="play" color="white" size={30} onPress={() =>this.toggleVideoPlay()} /> }
                        </TouchableOpacity> 
                        <View style={styles.buttonsContainer}>
                            <View style={{flex: 2, paddingRight: 10}}>
                                <Button title="Upload Video to Box" onPress={this.createNewFeed}/>
                            </View>
                            <View style={{flex: 2}}>
                                <Button title="Cancel" color="red" style={{flex: 2}} onPress={this.cancelUpload}/>    
                            </View>
                         </View>      
      
                    </View>}
            </View>
        )
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
        color: "#dc3545"
    },
    MediaLayout: {
        paddingHorizontal: 20,
        width: screen.width - 40,
        flex: 1,
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: 'center',
        marginTop: '50%'
    },
    Media: {
        width: (screen.width - 60) / 2,
        height: (screen.width - 60) / 2,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderRadius: 10,
        borderColor: "#fff",
        justifyContent: "center",
        alignItems: "center"
    },
    video: {
        position: 'absolute',
        top: screen.height/5,
        bottom: 0,
        left: 10,
        right: 10,
        width: '95%',
        height:'100%'
    },
    buttonsContainer: {
        flex:1,
        position: 'absolute',
        top: screen.height-200,
        left: screen.width/4,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    loader: {
        position: 'absolute',
        left: screen.width/2-10,
        top: screen.height/3+10,
        color: 'white'
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 22
      },
      modalView: {
        margin: 20,
        backgroundColor: "white",
        borderRadius: 20,
        padding: 35,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: {
          width: 0,
          height: 2
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
      },
    
});