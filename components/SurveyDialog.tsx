import React from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';
import { Button, Dialog, IconButton, Portal, Text } from 'react-native-paper';

interface SurveyDialogProps {
  visible: boolean;
  onDismiss: () => void;
  onStartSurvey: () => void;
}

const { width } = Dimensions.get('window');

export default function SurveyDialog({ visible, onDismiss, onStartSurvey }: SurveyDialogProps) {
  return (
    <Portal>
      <Dialog visible={visible} onDismiss={onDismiss} style={styles.dialog}>
        <View style={styles.header}>
          <IconButton icon="close" iconColor="#ffffff" size={24} onPress={onDismiss} style={styles.closeBtn} />
        </View>
        
        <View style={styles.bannerContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1540747737956-37872404797a?w=800' }}
            style={styles.bannerImage}
            resizeMode="cover"
          />
          <View style={styles.logoOverlay}>
            <View style={styles.logoIconSmall} />
            <Text style={styles.logoText}>cricheroes</Text>
            <Text style={styles.logoSub}>Your cricket matters</Text>
          </View>
        </View>

        <Dialog.Content style={styles.content}>
          <Text style={styles.title}>Help us improve</Text>
          <Text style={styles.desc}>
            We'd love to understand how CricHeroes is helping your game and where we can improve the experience further.
          </Text>

          <Button
            mode="contained"
            onPress={onStartSurvey}
            style={styles.surveyBtn}
            buttonColor="#009688"
            textColor="#ffffff"
          >
            Start survey
          </Button>
        </Dialog.Content>
      </Dialog>
    </Portal>
  );
}

const styles = StyleSheet.create({
  dialog: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    padding: 0,
    marginHorizontal: 20,
  },
  header: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
  },
  closeBtn: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    margin: 0,
  },
  bannerContainer: {
    height: 180,
    backgroundColor: '#e53935',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bannerImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.8,
  },
  logoOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(211, 47, 47, 0.85)',
    padding: 16,
    borderRadius: 12,
  },
  logoIconSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffffff',
  },
  logoText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 4,
  },
  logoSub: {
    color: '#e0e0e0',
    fontSize: 10,
  },
  content: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#c62828',
    marginBottom: 8,
    textAlign: 'center',
  },
  desc: {
    fontSize: 14,
    color: '#616161',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  surveyBtn: {
    width: '100%',
    borderRadius: 8,
    paddingVertical: 6,
  },
});