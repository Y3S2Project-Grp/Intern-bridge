import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';
import { Colors } from '../constants/Colors';
import ApplicantsListScreen from '../screens/applications/ApplicantsListScreen';
import OrgHomeScreen from '../screens/home/OrgHomeScreen';
import AddInternshipScreen from '../screens/internships/AddInternshipScreen';
import EditInternshipScreen from '../screens/internships/EditInternshipScreen';
import InternshipListScreen from '../screens/internships/InternshipListScreen';
import OrgProfileScreen from '../screens/profile/OrgProfileScreen';

export type OrgStackParamList = {
  OrgHome: undefined;
  OrgProfile: undefined;
  AddInternship: undefined;
  EditInternship: { internshipId: string };
  InternshipList: undefined;
  ApplicantsList: { internshipId: string };
};

const Stack = createNativeStackNavigator<OrgStackParamList>();
const Tab = createBottomTabNavigator();

const OrgTabs = () => {
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
        component={OrgHomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="business" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Internships" 
        component={InternshipListScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={OrgProfileScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

const OrgNavigator = () => {
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
        name="OrgHome" 
        component={OrgTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AddInternship" 
        component={AddInternshipScreen}
        options={{ title: 'Post New Internship' }}
      />
      <Stack.Screen 
        name="EditInternship" 
        component={EditInternshipScreen}
        options={{ title: 'Edit Internship' }}
      />
      <Stack.Screen 
        name="ApplicantsList" 
        component={ApplicantsListScreen}
        options={{ title: 'Applicants' }}
      />
    </Stack.Navigator>
  );
};

export default OrgNavigator;