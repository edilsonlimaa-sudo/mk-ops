import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    Pressable,
    Text,
    View,
} from 'react-native';
import MapView, { PROVIDER_DEFAULT } from 'react-native-maps';

interface CoordinatesMapModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (coordinates: string) => void;
  initialCoordinates?: string;
  isSaving?: boolean;
}

export function CoordinatesMapModal({
  visible,
  onClose,
  onSave,
  initialCoordinates,
  isSaving = false,
}: CoordinatesMapModalProps) {
  const mapRef = useRef<MapView>(null);
  const [markerCoordinate, setMarkerCoordinate] = useState({
    latitude: -15.7942,
    longitude: -47.8822,
  });
  const [region, setRegion] = useState({
    latitude: -15.7942,
    longitude: -47.8822,
    latitudeDelta: 0.002,
    longitudeDelta: 0.002,
  });
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  useEffect(() => {
    if (visible && initialCoordinates) {
      // Parse coordinates from string format: "-15.7942,-47.8822"
      const parts = initialCoordinates.split(',').map(s => s.trim());
      if (parts.length === 2) {
        const lat = parseFloat(parts[0]);
        const lng = parseFloat(parts[1]);
        if (!isNaN(lat) && !isNaN(lng)) {
          const newCoordinate = { latitude: lat, longitude: lng };
          setMarkerCoordinate(newCoordinate);
          setRegion({
            ...newCoordinate,
            latitudeDelta: 0.002,
            longitudeDelta: 0.002,
          });
          // Anima para a coordenada com zoom adequado
          setTimeout(() => {
            mapRef.current?.animateToRegion({
              ...newCoordinate,
              latitudeDelta: 0.002,
              longitudeDelta: 0.002,
            }, 500);
          }, 100);
        }
      }
    }
  }, [visible, initialCoordinates]);

  const handleGetCurrentLocation = async () => {
    try {
      setIsLoadingLocation(true);
      
      // Request permission
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permissão negada',
          'Precisamos de permissão para acessar sua localização.'
        );
        return;
      }

      // Get current position
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      setMarkerCoordinate({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
      mapRef.current?.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.002,
        longitudeDelta: 0.002,
      }, 500);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível obter a localização atual.');
      console.error('Error getting location:', error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  const handleSave = () => {
    const coordinatesString = `${markerCoordinate.latitude.toFixed(6)},${markerCoordinate.longitude.toFixed(6)}`;
    onSave(coordinatesString);
  };

  const handleZoomIn = () => {
    mapRef.current?.getCamera().then((camera) => {
      if (camera.zoom !== undefined) {
        mapRef.current?.animateCamera({ zoom: camera.zoom + 1 }, { duration: 300 });
      }
    });
  };

  const handleZoomOut = () => {
    mapRef.current?.getCamera().then((camera) => {
      if (camera.zoom !== undefined) {
        mapRef.current?.animateCamera({ zoom: camera.zoom - 1 }, { duration: 300 });
      }
    });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
    >
      <View className="flex-1 bg-white">
        {/* Header */}
        <View className="bg-sky-600 px-4 py-4 flex-row items-center justify-between">
          <View className="flex-1">
            <Text className="text-white text-xl font-bold">
              Ajustar Coordenadas
            </Text>
            <Text className="text-sky-100 text-sm mt-1">
              Mova o mapa para ajustar a localização
            </Text>
          </View>
          <Pressable
            onPress={onClose}
            className="w-10 h-10 items-center justify-center"
          >
            <Ionicons name="close" size={28} color="white" />
          </Pressable>
        </View>

        {/* Map */}
        <View className="flex-1 relative">
          <MapView
            ref={mapRef}
            style={{ flex: 1 }}
            provider={PROVIDER_DEFAULT}
            initialRegion={region}
            onRegionChangeComplete={(newRegion) => {
              setMarkerCoordinate({
                latitude: newRegion.latitude,
                longitude: newRegion.longitude,
              });
            }}
          />

          {/* Fixed Center Pin */}
          <View className="absolute top-1/2 left-1/2" style={{ marginLeft: -24, marginTop: -48 }}>
            <View className="items-center">
              <Ionicons name="location-sharp" size={48} color="#3b82f6" />
            </View>
          </View>

          {/* Zoom Controls */}
          <View className="absolute right-4 top-4 gap-2">
            <Pressable
              onPress={handleZoomIn}
              className="bg-white w-12 h-12 rounded-xl items-center justify-center shadow-lg border border-gray-200"
            >
              <Ionicons name="add" size={24} color="#1f2937" />
            </Pressable>
            <Pressable
              onPress={handleZoomOut}
              className="bg-white w-12 h-12 rounded-xl items-center justify-center shadow-lg border border-gray-200"
            >
              <Ionicons name="remove" size={24} color="#1f2937" />
            </Pressable>
          </View>

          {/* Hint */}
          <View className="absolute bottom-4 left-4 right-4">
            <View className="bg-white/95 px-4 py-3 rounded-xl shadow-lg border border-blue-100">
              <Text className="text-blue-600 text-sm font-semibold text-center">
                � Mova o mapa para posicionar o pin azul na localização exata
              </Text>
            </View>
          </View>
        </View>

        {/* Coordinates Display */}
        <View className="bg-gray-50 px-4 py-3 border-t border-gray-200">
          <Text className="text-gray-600 text-xs font-semibold mb-1">
            COORDENADAS ATUAIS
          </Text>
          <Text className="text-gray-800 text-base font-mono">
            {markerCoordinate.latitude.toFixed(6)}, {markerCoordinate.longitude.toFixed(6)}
          </Text>
        </View>

        {/* Actions */}
        <View className="px-4 py-4 bg-white border-t border-gray-200 gap-3">
          {/* Current Location Button */}
          <Pressable
            onPress={handleGetCurrentLocation}
            disabled={isLoadingLocation}
            className={`flex-row items-center justify-center bg-gray-100 py-3 px-4 rounded-xl ${
              isLoadingLocation ? 'opacity-50' : ''
            }`}
          >
            {isLoadingLocation ? (
              <ActivityIndicator size="small" color="#3b82f6" />
            ) : (
              <>
                <Ionicons name="locate" size={20} color="#3b82f6" />
                <Text className="text-blue-600 font-semibold ml-2">
                  Usar Minha Localização Atual
                </Text>
              </>
            )}
          </Pressable>

          {/* Save Button */}
          <Pressable
            onPress={handleSave}
            disabled={isSaving}
            className={`bg-blue-600 py-4 px-4 rounded-xl items-center justify-center ${
              isSaving ? 'opacity-70' : ''
            }`}
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text className="text-white font-bold text-base">
                Salvar Coordenadas
              </Text>
            )}
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
