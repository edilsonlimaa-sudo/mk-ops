import { ScrollView, Text, View } from 'react-native';

export default function Index() {
  return (
    <ScrollView className="flex-1 bg-gray-50">
      <View className="p-6">
        {/* Header */}
        <View className="mb-8 mt-12">
          <Text className="text-4xl font-bold text-gray-900 mb-2">MK-Auth Mobile</Text>
          <Text className="text-lg text-gray-600">Com NativeWind/Tailwind ✅</Text>
        </View>

        {/* Card Azul */}
        <View className="bg-blue-500 rounded-2xl p-6 mb-4 shadow-lg">
          <Text className="text-white text-2xl font-bold mb-2">Pronto para começar</Text>
          <Text className="text-blue-100">React Native + Expo + TypeScript</Text>
        </View>

        {/* Card Branco com Pills */}
        <View className="bg-white rounded-xl p-6 mb-4 shadow-md">
          <Text className="text-xl font-semibold text-gray-800 mb-4">Bibliotecas instaladas</Text>
          <View className="flex-row justify-between items-center">
            <View className="bg-green-100 px-3 py-2 rounded-lg">
              <Text className="text-green-700 text-xs font-medium">Zustand</Text>
            </View>
            <View className="bg-yellow-100 px-3 py-2 rounded-lg">
              <Text className="text-yellow-700 text-xs font-medium">React Query</Text>
            </View>
            <View className="bg-red-100 px-3 py-2 rounded-lg">
              <Text className="text-red-700 text-xs font-medium">Axios</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View className="mt-8 mb-12 items-center">
          <Text className="text-gray-500 text-sm">Próximo: Autenticação 🔐</Text>
        </View>
      </View>
    </ScrollView>
  );
}
