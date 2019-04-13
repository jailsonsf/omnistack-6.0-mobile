import React, { Component } from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import ImagePicker from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import FileViewer from 'react-native-file-viewer';

import socket from 'socket.io-client';

import api from '../../services/api';
import Icon from 'react-native-vector-icons/MaterialIcons';

import { distanceInWords } from 'date-fns';
import pt from 'date-fns/locale/pt';

import styles from './styles';

export default class Box extends Component {
  state = { 
    box: {} 
  }

  async componentDidMount() {
    const box = await AsyncStorage.getItem('@RocketBox:box');

    this.subscribeToNewFiles(box);

    const response = await api.get(`boxes/${box}`);

    this.setState({ box: response.data });
  }

  handleUpload = () => {
    ImagePicker.launchImageLibrary({}, async upload => {
      if (upload.error) {
        console.log('Erro')
      } else if (upload.didCancel) {
        console.log('Envio cancelado')
      } else {
        const data = new FormData();

        data.append('file', {
          uri: upload.uri,
          type: upload.type,
          name: upload.fileName,
        });

        api.post(`boxes/${this.state.box._id}/files`, data);
      }
    })
  }

  subscribeToNewFiles = (box) => {
    const io = socket('https://omnistack-backend.herokuapp.com');

    io.emit('connectRoom', box);

    io.on('file', data => {
        this.setState({ box: {...this.state.box, files: [data, ...this.state.box.files]} });
    })
  }

  openFile = async file => {
    try {
      const filePath = `${RNFS.DocumentDirectoryPath}/${file.title}`;

      await RNFS.downloadFile({
        fromUrl: file.url,
        toFile: filePath
      })

      await FileViewer.open(filePath);

    } catch (err) {
      return
    }
  }

  renderItem = ({ item }) => (
    <TouchableOpacity
      onPress={() => this.openFile(item)}
      style={styles.file}
    >
      <View style={styles.fileInfo}>
        <Icon name="insert-drive-file" size={24} color="#a5cfff"/>
        <Text style={styles.fileTitle}>{item.title}</Text>
      </View>

      <Text style={styles.fileDate}>
        há{" "}
        {distanceInWords(item.createdAt, new Date(), {
          locale: pt
        })}
      </Text>
    </TouchableOpacity>
  )

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.boxTitle}>{this.state.box.title}</Text>

        <FlatList
          style={styles.list}
          data={this.state.box.files}
          keyExtractor={item => item._id}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          renderItem={this.renderItem}
        />

        <TouchableOpacity style={styles.fab} onPress={this.handleUpload}>
          <Icon name="cloud-upload" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    )
  }
}
