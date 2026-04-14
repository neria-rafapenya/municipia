import React, { useEffect, useState } from 'react';
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  SlideInLeft,
  SlideOutLeft,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../context/AuthContext';
import { AuthStackParamList } from '../navigation/types';
import LogoNegativo from '../components/LogoNegativo';
import { colors } from '../theme/colors';
import { fontFamilies, fontSizes } from '../theme/typography';

type Nav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

const LoginScreen = () => {
  const navigation = useNavigation<Nav>();
  const { loginWithCredentials } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const keyboardOffset = useSharedValue(0);

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = (event: any) => {
      const height = event?.endCoordinates?.height ?? 0;
      const shift = Math.min(height * 0.45, 180);
      keyboardOffset.value = withTiming(-shift, { duration: event?.duration ?? 240 });
    };
    const onHide = (event: any) => {
      keyboardOffset.value = withTiming(0, { duration: event?.duration ?? 200 });
    };

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [keyboardOffset]);

  const contentShiftStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: keyboardOffset.value }],
  }));

  const handleLogin = async () => {
    if (!email || !password || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await loginWithCredentials(email.trim(), password);
    } catch (err: any) {
      setError(err?.message || 'No se pudo iniciar sesión');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <LinearGradient colors={["#A85DC9", "#EF5E9D"]} style={styles.container}>
      <KeyboardAvoidingView
        style={styles.inner}
        behavior={Platform.select({ ios: 'padding', android: undefined })}
      >
        <Animated.View
          entering={SlideInLeft.duration(320)}
          exiting={SlideOutLeft.duration(320)}
          style={[styles.content, contentShiftStyle]}
        >
          <View style={styles.logoWrap}>
            <LogoNegativo size={110} />
          </View>

          <Text style={styles.title}>Bienvenido</Text>
          <Text style={styles.subtitle}>Accede a tu municipio</Text>

          <View style={styles.form}>
            <TextInput
              placeholder="Email"
              placeholderTextColor={colors.slate}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
            />
            <View style={styles.passwordRow}>
              <TextInput
                placeholder="Contraseña"
                placeholderTextColor={colors.slate}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                style={[styles.input, styles.inputPassword]}
              />
              <Pressable
                style={styles.passwordIcon}
                onPress={() => setShowPassword((prev) => !prev)}
                accessibilityLabel={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                <MaterialIcons
                  name={showPassword ? 'visibility-off' : 'visibility'}
                  size={20}
                  color={colors.inkSoft}
                />
              </Pressable>
            </View>
          </View>

          <Pressable style={styles.primaryButton} onPress={handleLogin}>
            {submitting ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.primaryText}>Entrar</Text>
            )}
          </Pressable>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable onPress={() => navigation.navigate('Register')}>
            <Text style={styles.linkText}>Crear cuenta</Text>
          </Pressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
  },
  title: {
    fontFamily: fontFamilies.bold,
    fontSize: fontSizes.xl,
    color: colors.white,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.sm,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 10,
    textAlign: 'center',
  },
  logoWrap: {
    alignItems: 'center',
    marginBottom: 22,
  },
  form: {
    marginTop: 26,
    gap: 12,
    width: '100%',
  },
  passwordRow: {
    width: '100%',
    position: 'relative',
    justifyContent: 'center',
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 0,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontFamily: fontFamilies.regular,
    fontSize: fontSizes.md,
    color: colors.ink,
  },
  inputPassword: {
    paddingRight: 44,
  },
  passwordIcon: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
  },
  primaryButton: {
    backgroundColor: colors.ink,
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 18,
    alignItems: 'center',
    width: '100%',
  },
  primaryText: {
    fontFamily: fontFamilies.semiBold,
    fontSize: fontSizes.md,
    color: colors.white,
  },
  errorText: {
    marginTop: 12,
    textAlign: 'center',
    color: colors.danger,
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.sm,
  },
  linkText: {
    marginTop: 18,
    textAlign: 'center',
    color: colors.white,
    fontFamily: fontFamilies.medium,
    fontSize: fontSizes.sm,
  },
});

export default LoginScreen;
