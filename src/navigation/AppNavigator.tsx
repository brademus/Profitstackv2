import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { theme } from '../theme';
import { useAuth } from '../hooks/useAuth';

// Screens
import { AuthScreen } from '../screens/AuthScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { VenturesScreen } from '../screens/VenturesScreen';
import { VentureDetailScreen } from '../screens/VentureDetailScreen';
import { AddTransactionScreen } from '../screens/AddTransactionScreen';
import { AddVentureScreen } from '../screens/AddVentureScreen';
import { TimeLogScreen } from '../screens/TimeLogScreen';
import { TaxCenterScreen } from '../screens/TaxCenterScreen';
import { ScorecardScreen } from '../screens/ScorecardScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { PaywallScreen } from '../screens/PaywallScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return (
    <View style={{
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 4,
    }}>
      <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.colors.bgCard,
          borderTopColor: theme.colors.border,
          borderTopWidth: 1,
          height: 85,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={VenturesScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="💸" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Tax"
        component={TaxCenterScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="🧾" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon emoji="⚙️" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <View style={{
        flex: 1,
        backgroundColor: theme.colors.bg,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        <Text style={{ fontSize: 40 }}>📊</Text>
        <Text style={{
          color: theme.colors.textPrimary,
          fontSize: theme.fontSize.xl,
          fontWeight: theme.fontWeight.bold,
          marginTop: 16,
        }}>VentureStack</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!session ? (
          <Stack.Screen name="Auth" component={AuthScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen
              name="VentureDetail"
              component={VentureDetailScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="AddTransaction"
              component={AddTransactionScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="AddVenture"
              component={AddVentureScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="TimeLog"
              component={TimeLogScreen}
              options={{ presentation: 'modal' }}
            />
            <Stack.Screen
              name="TaxCenter"
              component={TaxCenterScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="Scorecard"
              component={ScorecardScreen}
              options={{ presentation: 'card' }}
            />
            <Stack.Screen
              name="Paywall"
              component={PaywallScreen}
              options={{ presentation: 'modal' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
