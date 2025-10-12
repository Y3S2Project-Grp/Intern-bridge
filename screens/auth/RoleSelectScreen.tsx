import { Ionicons } from '@expo/vector-icons';
import { StackNavigationProp } from '@react-navigation/stack';
import React from 'react';
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { UserRole } from '../../constants/Roles';
import { AuthStackParamList } from '../../navigation/AuthNavigator';

type RoleSelectScreenNavigationProp = StackNavigationProp<
  AuthStackParamList,
  'RoleSelect'
>;

interface Props {
  navigation: RoleSelectScreenNavigationProp;
}

const RoleSelectScreen: React.FC<Props> = ({ navigation }) => {
  const roles = [
    {
      id: UserRole.YOUTH,
      title: 'Youth / Student',
      description: 'Looking for internship opportunities and career growth',
      icon: 'school',
      color: Colors.primary,
    },
    {
      id: UserRole.ORG,
      title: 'Organization',
      description: 'Want to post internships and find talented youth',
      icon: 'business',
      color: Colors.secondary,
    },
    {
      id: UserRole.ADMIN,
      title: 'Administrator',
      description: 'Manage platform, verify organizations, and view analytics',
      icon: 'shield-checkmark',
      color: Colors.success,
    },
  ];

  const handleRoleSelect = (role: UserRole) => {
    navigation.navigate('Register', { role });
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Choose Your Role</Text>
        <Text style={styles.subtitle}>
          Select how you want to use InternBridge
        </Text>
      </View>

      <View style={styles.rolesContainer}>
        {roles.map((role) => (
          <TouchableOpacity
            key={role.id}
            style={[styles.roleCard, { borderLeftColor: role.color }]}
            onPress={() => handleRoleSelect(role.id)}
          >
            <View style={styles.roleHeader}>
              <View style={[styles.iconContainer, { backgroundColor: role.color }]}>
                <Ionicons name={role.icon as any} size={24} color={Colors.white} />
              </View>
              <Text style={styles.roleTitle}>{role.title}</Text>
            </View>
            <Text style={styles.roleDescription}>{role.description}</Text>
            
            <View style={styles.roleFooter}>
              <Text style={styles.selectText}>Select</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.primary} />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.footerLink}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginVertical: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray,
    textAlign: 'center',
  },
  rolesContainer: {
    marginBottom: 40,
  },
  roleCard: {
    backgroundColor: Colors.white,
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  roleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.dark,
  },
  roleDescription: {
    fontSize: 14,
    color: Colors.gray,
    lineHeight: 20,
    marginBottom: 16,
  },
  roleFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectText: {
    color: Colors.primary,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    paddingBottom: 40,
  },
  footerText: {
    color: Colors.gray,
  },
  footerLink: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
});

export default RoleSelectScreen;