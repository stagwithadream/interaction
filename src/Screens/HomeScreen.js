import React, {PureComponent} from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Button, Card} from 'react-native';
import { getDataAsync} from '../utils/Api';

class HomeScreen extends PureComponent {
    constructor(props) {
        super(props);
        this.navigateToCamera = this.navigateToCamera.bind(this);
    }
    componentDidMount() {
        // let data = getDataAsync('hospital/hello/').then(data =>
        //     {
        //       console.log(data);
        //     });
    }
     navigateToCamera(e) {
        this.props.navigation.navigate(e);
    }
    render() {
        return (
            <View style={{flex: 1, flexDirection: 'column', justifyContent: 'center', marginTop: '30%', marginLeft: '30%'}}>
                <View style={{flex: 1, width: '50%', height: '80%'}}>
                    <Button
                    onPress={() => this.navigateToCamera("Video Record")}
                    style={{height: '80%', width:30}}
                    title="Record Video"
                    />
                </View>
                <View style={{flex: 1,width: '50%'}}>
                    <Button
                    onPress={() => this.navigateToCamera("Upload")}
                    title="Upload Video"
                    color="black"
                    accessibilityLabel="Learn more about this purple button"
                    />
                </View>

            </View>
        );
    }
}

export default HomeScreen;
