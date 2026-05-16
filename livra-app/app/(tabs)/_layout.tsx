import { Tabs } from 'expo-router'
import TabBar from '../../src/components/TabBar'

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={() => <TabBar />}
      screenOptions={{ headerShown: false }}
    />
  )
}
