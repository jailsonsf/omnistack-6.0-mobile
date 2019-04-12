import React, { Component } from 'react';

import { View, Text, Image, TextInput, TouchableOpacity } from 'react-native';

import styles from './styles';

import logo from '../../assets-mobile/logo.png';

export default class Main extends Component {
  render() {
    return(
        <View styles={styles.container}>
            <Image style={styles.logo} source={logo} />

            <TextInput 
                style={styles.input}
                placeholder="Crie um box"
                placeholderTextColor="#999"
                autoCapitalize="none"
                autoCorrect={false}
                underlineColorAndroid="transparent"
            />

            <TouchableOpacity onPress={() => {}} style={styles.button}>
                <Text style={styles.buttonText}>Criar</Text>
            </TouchableOpacity>
        </View>
    );
  }
}
