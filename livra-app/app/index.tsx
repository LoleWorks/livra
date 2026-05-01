import { Redirect } from 'expo-router'
import { useAuth } from '../src/context/AuthContext'
import { View, ActivityIndicator } from 'react-native'
import { tokens as T } from '../src/theme/tokens'

export default function Index() {
  const { session, customer, loading } = useAuth()

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: T.color.bg }}>
        <ActivityIndicator color={T.color.primary} />
      </View>
    )
  }

  if (!session) return <Redirect href="/onboarding" />

  // Logged in but hasn't finished onboarding (no customer row yet)
  if (!customer) return <Redirect href="/onboarding/name" />

  return <Redirect href="/(tabs)/home" />
}
