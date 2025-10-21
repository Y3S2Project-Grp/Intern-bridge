import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Colors } from '../constants/Colors';
import YouthHomeScreen from '../screens/home/YouthHomeScreen';
import InternshipListScreen from '../screens/internships/InternshipListScreen';
import InternshipDetailScreen from '../screens/internships/InternshipDetailsScreen';
import YouthProfileScreen from '../screens/profile/YouthProfileScreen';
import ApplicationsScreen from '../screens/applications/MyApplicationsScreen';
import EligibilityScreen from '../screens/eligibility/EligibilityScreen';
import CVBuilderScreen from '../screens/eligibility/CVBuilderScreen';
import CVPreviewScreen from '../screens/eligibility/CVPreviewScreen';
import PortfolioScreen from '../screens/portfolio/PortfolioScreen';
import PortfolioBuilderScreen from '../screens/portfolio/PortfolioBuilderScreen';
import PortfolioPreviewScreen from '../screens/portfolio/PortfolioPreviewScreen';

export type YouthStackParamList = {
  YouthTabs: undefined;
  InternshipDetail: { internshipId: string };
  YouthProfile: undefined;
  Eligibility: undefined;
  CVBuilder: undefined;
  CVPreview: { cvData: any };
  Portfolio: undefined;
  PortfolioBuilder: { projectId?: string };
  PortfolioPreview: { portfolioData: any };
};

const Stack = createNativeStackNavigator<YouthStackParamList>();
const Tab = createBottomTabNavigator();

const YouthTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.gray,
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={YouthHomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Internships" 
        component={InternshipListScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="briefcase" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Applications" 
        component={ApplicationsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={YouthProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const YouthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: Colors.primary,
        },
        headerTintColor: Colors.white,
      }}
    >
      <Stack.Screen 
        name="YouthTabs" 
        component={YouthTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="InternshipDetail" 
        component={InternshipDetailScreen}
        options={{ title: 'Internship Details' }}
      />
      <Stack.Screen 
        name="YouthProfile" 
        component={YouthProfileScreen}
        options={{ title: 'My Profile' }}
      />
      <Stack.Screen 
        name="Eligibility" 
        component={EligibilityScreen}
        options={{ title: 'Check Eligibility' }}
      />
      <Stack.Screen 
        name="CVBuilder" 
        component={CVBuilderScreen}
        options={{ title: 'Build CV' }}
      />
      <Stack.Screen 
        name="CVPreview" 
        component={CVPreviewScreen}
        options={{ title: 'CV Preview' }}
      />
      <Stack.Screen 
        name="Portfolio" 
        component={PortfolioScreen}
        options={{ title: 'My Portfolio' }}
      />
      <Stack.Screen 
        name="PortfolioBuilder" 
        component={PortfolioBuilderScreen}
        options={{ title: 'Build Portfolio' }}
      />
      <Stack.Screen 
        name="PortfolioPreview" 
        component={PortfolioPreviewScreen}
        options={{ title: 'Portfolio Preview' }}
      />
    </Stack.Navigator>
  );
};

export default YouthNavigator;