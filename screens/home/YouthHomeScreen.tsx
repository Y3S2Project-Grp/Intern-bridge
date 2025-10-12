import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useNavigation } from '@react-navigation/native';
import { YouthStackParamList } from '../../navigation/YouthNavigator';
import { StackNavigationProp } from '@react-navigation/stack';

type YouthHomeScreenNavigationProp = StackNavigationProp<YouthStackParamList>;

const YouthHomeScreen = () => {
  const navigation = useNavigation<YouthHomeScreenNavigationProp>();

  const quickActions = [
    {
      title: 'Check Eligibility',
      description: 'Check if you meet requirements',
      icon: '✅',
      onPress: () => navigation.navigate('Eligibility'),
      color: Colors.primary,
    },
    {
      title: 'Browse Internships',
      description: 'Find available opportunities',
      icon: '💼',
      onPress: () => navigation.navigate('YouthTabs', { screen: 'Internships' }),
      color: Colors.secondary,
    },
    {
      title: 'My Applications',
      description: 'View your applications',
      icon: '📋',
      onPress: () => navigation.navigate('YouthTabs', { screen: 'Applications' }),
      color: Colors.success,
    },
    {
      title: 'Build CV',
      description: 'Create your professional CV',
      icon: '📝',
      onPress: () => navigation.navigate('CVBuilder'),
      color: Colors.info,
    },
     {
      title: 'Build Portfolio',
      description: 'Showcase your projects',
      icon: '🎨',
      onPress: () => navigation.navigate('Portfolio'),
      color: Colors.warning,
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcome}>Welcome to InternBridge</Text>
        <Text style={styles.subtitle}>Find your perfect internship opportunity</Text>
      </View>

      <View style={styles.quickActions}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.actionCard, { borderLeftColor: action.color }]}
              onPress={action.onPress}
            >
              <Text style={styles.actionIcon}>{action.icon}</Text>
              <Text style={styles.actionTitle}>{action.title}</Text>
              <Text style={styles.actionDescription}>{action.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.white,
    padding: 20,
    paddingTop: 40,
  },
  welcome: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray,
  },
  quickActions: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: Colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.dark,
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 12,
    color: Colors.gray,
    lineHeight: 16,
  },
});

export default YouthHomeScreen;