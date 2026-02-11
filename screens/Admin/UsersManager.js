import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const UsersManager = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>UsersManager - В разработке</Text>
      <Text style={styles.subtext}>Этот раздел находится в разработке</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
  },
  subtext: {
    fontSize: 16,
    color: '#7f8c8d',
  },
});

export default UsersManager;
