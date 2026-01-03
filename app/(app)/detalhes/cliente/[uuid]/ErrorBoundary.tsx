import React from 'react';
import { Text, View } from 'react-native';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View className="flex-1 justify-center items-center p-6 bg-white">
          <Text className="text-red-500 text-lg font-semibold mb-2">
            Erro ao carregar conteúdo
          </Text>
          <Text className="text-gray-600 text-center">
            {this.state.error?.message || 'Ocorreu um erro inesperado'}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}
