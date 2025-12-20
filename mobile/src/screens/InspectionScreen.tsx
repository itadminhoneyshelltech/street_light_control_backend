// mobile/src/screens/InspectionScreen.tsx
// Street light field inspection screen

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  Alert,
  StyleSheet,
  Switch,
} from 'react-native';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import { PERMISSIONS, request } from 'react-native-permissions';
import Geolocation from '@react-native-geolocation-service';
import { launchCamera } from 'react-native-image-picker';
import axios from 'axios';

const API_URL = 'http://192.168.1.4:8000/api'; // Change to your backend IP

interface InspectionState {
  light_id: string;
  inspection_id: number | null;
  photo: string | null;
  latitude: number | null;
  longitude: number | null;
  light_status: 'on' | 'off' | 'error';
  ward_number: number | null;
  brightness_level: number;
  notes: string;
  loading: boolean;
}

export const InspectionScreen: React.FC = () => {
  const [inspection, setInspection] = useState<InspectionState>({
    light_id: 'SL001', // Will be passed from navigation
    inspection_id: null,
    photo: null,
    latitude: null,
    longitude: null,
    light_status: 'off',
    ward_number: 100,
    brightness_level: 0,
    notes: '',
    loading: false,
  });

  const [token, setToken] = useState<string>('');

  useEffect(() => {
    initializeInspection();
  }, []);

  /**
   * Start new inspection
   */
  const initializeInspection = async () => {
    try {
      setInspection(prev => ({ ...prev, loading: true }));
      
      // Get auth token from storage
      const storedToken = await getAuthToken();
      setToken(storedToken);

      // Start inspection in backend
      const response = await axios.post(
        `${API_URL}/inspection/start`,
        {
          light_id: inspection.light_id,
          ward_number: inspection.ward_number,
        },
        {
          headers: { Authorization: `Bearer ${storedToken}` }
        }
      );

      setInspection(prev => ({
        ...prev,
        inspection_id: response.data.data.inspection_id,
        loading: false,
      }));

      Alert.alert('✅ Inspection Started', 'Ready to capture photo');
    } catch (error) {
      Alert.alert('❌ Error', 'Failed to start inspection');
      console.error(error);
      setInspection(prev => ({ ...prev, loading: false }));
    }
  };

  /**
   * Capture photo from camera
   */
  const capturePhoto = async () => {
    try {
      // Request camera permission
      const permission = await request(
        PERMISSIONS.ANDROID.CAMERA || PERMISSIONS.IOS.CAMERA
      );

      if (permission !== 'granted') {
        Alert.alert('❌ Permission Required', 'Camera permission needed');
        return;
      }

      launchCamera(
        {
          mediaType: 'photo',
          quality: 0.8,
          includeBase64: true,
        },
        async (response) => {
          if (response.didCancel) {
            return;
          }

          if (response.assets && response.assets[0]) {
            const photo = response.assets[0];
            
            setInspection(prev => ({
              ...prev,
              photo: photo.uri,
              loading: true,
            }));

            // Upload photo to backend
            try {
              await axios.post(
                `${API_URL}/inspection/photo`,
                {
                  inspection_id: inspection.inspection_id,
                  photo_base64: photo.base64,
                },
                {
                  headers: { Authorization: `Bearer ${token}` }
                }
              );

              Alert.alert('✅ Photo Uploaded', 'Now capture GPS location');
              setInspection(prev => ({ ...prev, loading: false }));
            } catch (error) {
              Alert.alert('❌ Upload Failed', 'Could not upload photo');
              console.error(error);
              setInspection(prev => ({ ...prev, loading: false }));
            }
          }
        }
      );
    } catch (error) {
      Alert.alert('❌ Error', 'Failed to capture photo');
      console.error(error);
    }
  };

  /**
   * Get GPS coordinates
   */
  const captureGPS = async () => {
    try {
      setInspection(prev => ({ ...prev, loading: true }));

      // Request location permission
      const permission = await request(
        PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION ||
          PERMISSIONS.IOS.LOCATION_WHEN_IN_USE
      );

      if (permission !== 'granted') {
        Alert.alert('❌ Permission Required', 'Location permission needed');
        return;
      }

      Geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          setInspection(prev => ({
            ...prev,
            latitude,
            longitude,
          }));

          // Send GPS to backend
          try {
            await axios.post(
              `${API_URL}/inspection/gps`,
              {
                inspection_id: inspection.inspection_id,
                latitude,
                longitude,
              },
              {
                headers: { Authorization: `Bearer ${token}` }
              }
            );

            Alert.alert(
              '✅ GPS Captured',
              `Lat: ${latitude.toFixed(4)}\nLon: ${longitude.toFixed(4)}`
            );
          } catch (error) {
            console.error(error);
          }

          setInspection(prev => ({ ...prev, loading: false }));
        },
        (error) => {
          Alert.alert('❌ GPS Error', error.message);
          setInspection(prev => ({ ...prev, loading: false }));
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch (error) {
      Alert.alert('❌ Error', 'Failed to get GPS');
      console.error(error);
      setInspection(prev => ({ ...prev, loading: false }));
    }
  };

  /**
   * Complete inspection
   */
  const completeInspection = async () => {
    try {
      if (!inspection.inspection_id) {
        Alert.alert('❌ Error', 'No inspection in progress');
        return;
      }

      setInspection(prev => ({ ...prev, loading: true }));

      await axios.post(
        `${API_URL}/inspection/complete`,
        {
          inspection_id: inspection.inspection_id,
          light_id: inspection.light_id,
          light_status: inspection.light_status,
          ward_number: inspection.ward_number,
          brightness_level: inspection.brightness_level,
          notes: inspection.notes,
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      Alert.alert('✅ Inspection Complete', 'Data saved successfully');
      
      // Reset for next inspection
      setInspection(prev => ({
        ...prev,
        inspection_id: null,
        photo: null,
        latitude: null,
        longitude: null,
        light_status: 'off',
        brightness_level: 0,
        notes: '',
        loading: false,
      }));

      // Start new inspection
      initializeInspection();
    } catch (error) {
      Alert.alert('❌ Error', 'Failed to complete inspection');
      console.error(error);
      setInspection(prev => ({ ...prev, loading: false }));
    }
  };

  /**
   * Helper to get auth token
   */
  const getAuthToken = async () => {
    // In real app, get from secure storage
    return 'your-jwt-token-here';
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🔦 Light Inspection</Text>
        <Text style={styles.subtitle}>Field Inspection App</Text>
      </View>

      {inspection.loading && (
        <ActivityIndicator size="large" color="#007AFF" />
      )}

      {/* Start Button */}
      {!inspection.inspection_id && (
        <TouchableOpacity
          style={styles.button}
          onPress={initializeInspection}
          disabled={inspection.loading}
        >
          <Text style={styles.buttonText}>📍 Start Inspection</Text>
        </TouchableOpacity>
      )}

      {inspection.inspection_id && (
        <>
          {/* Photo Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📸 Capture Photo</Text>
            {inspection.photo ? (
              <Image
                source={{ uri: inspection.photo }}
                style={styles.photo}
              />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoText}>No photo yet</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.button}
              onPress={capturePhoto}
              disabled={inspection.loading}
            >
              <Text style={styles.buttonText}>📷 Capture Photo</Text>
            </TouchableOpacity>
          </View>

          {/* GPS Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📍 Get GPS Coordinates</Text>
            {inspection.latitude && inspection.longitude ? (
              <View style={styles.gpsBox}>
                <Text style={styles.gpsText}>
                  Lat: {inspection.latitude.toFixed(8)}
                </Text>
                <Text style={styles.gpsText}>
                  Lon: {inspection.longitude.toFixed(8)}
                </Text>
              </View>
            ) : (
              <View style={styles.gpsBox}>
                <Text style={styles.gpsText}>Location not captured</Text>
              </View>
            )}
            <TouchableOpacity
              style={styles.button}
              onPress={captureGPS}
              disabled={inspection.loading}
            >
              <Text style={styles.buttonText}>📍 Get GPS</Text>
            </TouchableOpacity>
          </View>

          {/* Light Status Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>💡 Is Light On?</Text>
            <View style={styles.statusContainer}>
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  inspection.light_status === 'on' && styles.statusButtonActive,
                ]}
                onPress={() =>
                  setInspection(prev => ({ ...prev, light_status: 'on' }))
                }
              >
                <Text
                  style={[
                    styles.statusButtonText,
                    inspection.light_status === 'on' &&
                      styles.statusButtonTextActive,
                  ]}
                >
                  ✅ ON
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusButton,
                  inspection.light_status === 'off' &&
                    styles.statusButtonActive,
                ]}
                onPress={() =>
                  setInspection(prev => ({ ...prev, light_status: 'off' }))
                }
              >
                <Text
                  style={[
                    styles.statusButtonText,
                    inspection.light_status === 'off' &&
                      styles.statusButtonTextActive,
                  ]}
                >
                  ❌ OFF
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusButton,
                  inspection.light_status === 'error' &&
                    styles.statusButtonActive,
                ]}
                onPress={() =>
                  setInspection(prev => ({ ...prev, light_status: 'error' }))
                }
              >
                <Text
                  style={[
                    styles.statusButtonText,
                    inspection.light_status === 'error' &&
                      styles.statusButtonTextActive,
                  ]}
                >
                  ⚠️ ERROR
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Ward Number Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🏘️ Ward Number</Text>
            <View style={styles.valueBox}>
              <Text style={styles.valueText}>{inspection.ward_number}</Text>
            </View>
          </View>

          {/* Brightness Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              ⚡ Brightness Level: {inspection.brightness_level}%
            </Text>
            <View style={styles.sliderContainer}>
              {/* In real app, use Slider component */}
              <TouchableOpacity
                style={styles.button}
                onPress={() => {
                  const level = Math.floor(Math.random() * 100);
                  setInspection(prev => ({
                    ...prev,
                    brightness_level: level,
                  }));
                }}
              >
                <Text style={styles.buttonText}>📊 Measure Brightness</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Complete Button */}
          <TouchableOpacity
            style={[styles.button, styles.completeButton]}
            onPress={completeInspection}
            disabled={inspection.loading}
          >
            <Text style={styles.buttonText}>✅ Complete Inspection</Text>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  header: {
    marginBottom: 24,
    paddingVertical: 16,
    backgroundColor: '#FFE680',
    borderRadius: 12,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 20,
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  photo: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 12,
  },
  photoPlaceholder: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  photoText: {
    color: '#999',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  completeButton: {
    backgroundColor: '#4CAF50',
    marginBottom: 40,
  },
  gpsBox: {
    backgroundColor: '#F0F0F0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  gpsText: {
    fontSize: 14,
    color: '#333',
    marginVertical: 4,
    fontFamily: 'monospace',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statusButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 4,
    alignItems: 'center',
  },
  statusButtonActive: {
    backgroundColor: '#FFD700',
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  statusButtonTextActive: {
    color: '#000',
  },
  valueBox: {
    backgroundColor: '#FFD700',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  valueText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  sliderContainer: {
    marginVertical: 12,
  },
});

export default InspectionScreen;
