import { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, Alert, Image, ScrollView, KeyboardAvoidingView, Platform, Linking } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
// Auth imports geçici olarak devre dışı

export default function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [isSignup, setIsSignup] = useState(false);
  const [password, setPassword] = useState('');
  const [loginSettings, setLoginSettings] = useState({
    logo_url: '',
    cover_image_url: '',
    background_type: 'gradient',
      gradient_colors: {
        start: '#2da2ff',
        middle: '#1b8ae6',
        end: '#0d6efd'
      },
    slogan: 'Qappish\'le...',
    show_facebook: true,
    show_google: true,
    show_apple: false,
    show_phone: true,
    show_manual_signup: true,
    terms_url: '',
    privacy_url: ''
  });
  const router = useRouter();
  
  // Form validation geçici olarak devre dışı
  const { control } = useForm();

  // Fetch login settings from admin panel with real-time updates
  useEffect(() => {
    const fetchLoginSettings = async () => {
      try {
        console.log('🔄 Fetching login settings from API...');
        const response = await fetch('http://192.168.1.143:3001/api/settings');
        console.log('📡 Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📦 API response:', data);
        
        if (data.settings?.login) {
          console.log('✅ Updating login settings:', data.settings.login);
          setLoginSettings(prev => {
            const newSettings = {
              ...prev,
              ...data.settings.login
            };
            console.log('📊 Previous settings:', prev);
            console.log('🆕 New login settings:', newSettings);
            console.log('📝 Slogan changed from', prev.slogan, 'to', newSettings.slogan);
            return newSettings;
          });
        } else {
          console.log('❌ No login settings found in API response');
        }
      } catch (error) {
        console.log('💥 Could not fetch login settings, using defaults:', error);
      }
    };

    // Initial fetch
    fetchLoginSettings();

          // Poll for updates every 10 seconds (daha az sıklıkta)
          const interval = setInterval(fetchLoginSettings, 10000);

          return () => clearInterval(interval);
  }, []);

  const handleLogin = () => {
    setLoading(true);
    // Direkt yönlendir, hiçbir auth logic yok
    router.replace('/(tabs)');
  };

  const handleSignup = () => {
    setLoading(true);
    // Direkt yönlendir, hiçbir auth logic yok
    router.replace('/(tabs)');
  };

  const handleTermsPress = async () => {
    try {
      const url = 'https://qappio.com/kullanici-sozlesmesi';
      const supported = await Linking.canOpenURL(url);
      
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Hata', 'Kullanıcı sözleşmesi sayfası açılamadı');
      }
    } catch (error) {
      Alert.alert('Hata', 'Kullanıcı sözleşmesi sayfası açılamadı');
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Full Screen Background */}
      {loginSettings.background_type === 'image' && loginSettings.cover_image_url ? (
        <Image 
          source={{ uri: loginSettings.cover_image_url }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      ) : (
        <LinearGradient
          colors={[
            loginSettings.gradient_colors?.start || '#2da2ff', 
            loginSettings.gradient_colors?.middle || '#1b8ae6',
            loginSettings.gradient_colors?.end || '#0d6efd'
          ]}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
      )}
      
      {/* Overlay for better text readability */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.3)' }} />

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo Section */}
          <View style={{ alignItems: 'center', marginBottom: 40 }}>
            {loginSettings.logo_url ? (
              <Image 
                source={{ uri: loginSettings.logo_url }}
                style={{ height: 80, width: 80, marginBottom: 16 }}
                resizeMode="contain"
              />
            ) : (
              <View style={{ 
                width: 80, 
                height: 80, 
                backgroundColor: 'rgba(255,255,255,0.2)', 
                borderRadius: 20, 
                justifyContent: 'center', 
                alignItems: 'center',
                marginBottom: 16
              }}>
                <Text style={{ fontSize: 32, fontWeight: 'bold', color: 'white' }}>Q</Text>
              </View>
            )}
            <Text style={{ fontSize: 36, fontWeight: 'bold', color: 'white', marginBottom: 8 }}>
              Qappio
            </Text>
            <Text style={{ fontSize: 16, color: 'rgba(255,255,255,0.9)', textAlign: 'center' }}>
              {loginSettings.slogan || 'Qappish\'le...'}
            </Text>
          </View>

          {/* Form Elements - No Card */}
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'white', marginBottom: 32, textAlign: 'center' }}>
              {isSignup ? 'Hesap Oluştur' : 'Giriş Yap'}
            </Text>

            {/* Email Input */}
            <View style={{ marginBottom: 16 }}>
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                backgroundColor: 'rgba(255,255,255,0.2)', 
                borderRadius: 16, 
                borderWidth: 1, 
                borderColor: 'rgba(255,255,255,0.3)', 
                paddingHorizontal: 16, 
                paddingVertical: 4,
                marginBottom: 8
              }}>
                <Controller
                  control={control}
                  name="email"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={{ flex: 1, fontSize: 16, color: 'white' }}
                      placeholder="ornek@email.com"
                      placeholderTextColor="rgba(255,255,255,0.7)"
                      value={value}
                      onChangeText={onChange}
                      onBlur={onBlur}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                  )}
                />
              </View>
            </View>

            {/* Password Input (Signup only) */}
            {isSignup && (
              <View style={{ marginBottom: 16 }}>
                <View style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  borderRadius: 16, 
                  borderWidth: 1, 
                  borderColor: 'rgba(255,255,255,0.3)', 
                  paddingHorizontal: 16, 
                  paddingVertical: 4,
                  marginBottom: 8
                }}>
                  <TextInput
                    style={{ flex: 1, fontSize: 16, color: 'white' }}
                    placeholder="Şifreniz"
                    placeholderTextColor="rgba(255,255,255,0.7)"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>
            )}

                    {/* Login Button - Geçici olarak ana uygulamaya yönlendir */}
                    <Pressable
                      style={{
                        backgroundColor: loading ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.9)',
                        paddingVertical: 16,
                        borderRadius: 16,
                        marginBottom: 16,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                        elevation: 4,
                      }}
                      onPress={handleLogin}
                      disabled={loading}
                    >
                      <Text style={{ color: loading ? 'rgba(0,0,0,0.5)' : '#2da2ff', fontSize: 16, fontWeight: '600', textAlign: 'center' }}>
                        {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                      </Text>
                    </Pressable>

            {/* Toggle Signup/Login - Geçici olarak devre dışı */}
            <Pressable 
              style={{ marginBottom: 24 }}
              onPress={handleSignup}
              disabled={loading}
            >
              <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: 16, textAlign: 'center', fontWeight: '500' }}>
                {loading ? 'Giriş yapılıyor...' : 'Hesabınız yok mu? Kayıt olun'}
              </Text>
            </Pressable>

            {/* Social Login */}
            {(loginSettings.show_google || loginSettings.show_facebook) && (
              <>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
                  <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.3)' }} />
                  <Text style={{ marginHorizontal: 16, color: 'rgba(255,255,255,0.8)', fontSize: 14 }}>veya</Text>
                  <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.3)' }} />
                </View>

                        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 16 }}>
                          {loginSettings.show_google && (
                            <Pressable 
                              style={{
                                width: 60,
                                height: 60,
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                borderRadius: 16,
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderWidth: 1,
                                borderColor: 'rgba(255,255,255,0.3)',
                              }}
                              onPress={handleLogin}
                              disabled={loading}
                            >
                              <Ionicons name="logo-google" size={24} color="#fff" />
                            </Pressable>
                          )}

                          {loginSettings.show_facebook && (
                            <Pressable 
                              style={{
                                width: 60,
                                height: 60,
                                backgroundColor: 'rgba(255,255,255,0.2)',
                                borderRadius: 16,
                                justifyContent: 'center',
                                alignItems: 'center',
                                borderWidth: 1,
                                borderColor: 'rgba(255,255,255,0.3)',
                              }}
                              onPress={handleLogin}
                              disabled={loading}
                            >
                              <Ionicons name="logo-facebook" size={24} color="#fff" />
                            </Pressable>
                          )}
                        </View>

                {/* Kullanıcı Sözleşmesi Linki */}
                <Pressable 
                  style={{ alignItems: 'center', marginTop: 16 }}
                  onPress={handleTermsPress}
                >
                  <Text style={{ 
                    color: 'rgba(255,255,255,0.8)', 
                    fontSize: 12, 
                    textAlign: 'center',
                    textDecorationLine: 'underline'
                  }}>
                    Kullanıcı Sözleşmesi
                  </Text>
                </Pressable>
              </>
            )}
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
