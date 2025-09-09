import { useState } from 'react'
import { Alert, StyleSheet, View, AppState, Text } from 'react-native'
import { supabase } from '../../lib/supabase'
import { Button, Input } from '@rneui/themed'

AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    supabase.auth.startAutoRefresh()
  } else {
    supabase.auth.stopAutoRefresh()
  }
})

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  async function signInWithEmail() {
    setLoading(true)
    setErrorMessage('')
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMessage(error.message)
      Alert.alert('Hata', error.message)
    }
    setLoading(false)
  }

  async function signUpWithEmail() {
    setLoading(true)
    setErrorMessage('')
    const {
      data: { session },
      error,
    } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setErrorMessage(error.message)
      Alert.alert('Hata', error.message)
    } else if (!session) {
      Alert.alert('Doğrulama', 'Lütfen e-posta kutunuzu kontrol edin ve hesabınızı doğrulayın.')
    }
    setLoading(false)
  }

  return (
    <View style={styles.container}>
      <Input
        label="Email"
        leftIcon={{ type: 'font-awesome', name: 'envelope' }}
        onChangeText={setEmail}
        value={email}
        placeholder="email@address.com"
        autoCapitalize="none"
        keyboardType="email-address"
        containerStyle={styles.inputContainer}
      />
      <Input
        label="Password"
        leftIcon={{ type: 'font-awesome', name: 'lock' }}
        onChangeText={setPassword}
        value={password}
        secureTextEntry
        placeholder="Şifre"
        autoCapitalize="none"
        containerStyle={styles.inputContainer}
      />
      {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
      <View style={styles.buttonRow}>
        <Button
          title="Giriş Yap"
          disabled={loading}
          onPress={signInWithEmail}
          buttonStyle={styles.signInButton}
          containerStyle={styles.buttonContainer}
          loading={loading}
        />
        <Button
          title="Kayıt Ol"
          disabled={loading}
          onPress={signUpWithEmail}
          buttonStyle={styles.signUpButton}
          containerStyle={styles.buttonContainer}
          loading={loading}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: 60,
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  buttonContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  signInButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    paddingVertical: 12,
  },
  signUpButton: {
    backgroundColor: '#50E3C2',
    borderRadius: 8,
    paddingVertical: 12,
  },
  errorText: {
    color: '#D32F2F',
    textAlign: 'center',
    marginTop: 10,
  },
})
