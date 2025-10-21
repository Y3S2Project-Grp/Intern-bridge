import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface FooterProps {
  showSDG?: boolean;
}

export const Footer: React.FC<FooterProps> = ({ showSDG = true }) => {
  const currentYear = new Date().getFullYear();

  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => 
      console.error('Failed to open URL:', err)
    );
  };

  return (
    <View style={styles.container}>
      {/* SDG Section */}
      {showSDG && (
        <View style={styles.sdgSection}>
          <Text style={styles.sdgTitle}>Supporting Sustainable Development Goal 8</Text>
          <Text style={styles.sdgDescription}>
            Promoting inclusive and sustainable economic growth, employment and decent work for all
          </Text>
        </View>
      )}

      {/* Links Section */}
      <View style={styles.linksSection}>
        <View style={styles.linkColumn}>
          <Text style={styles.columnTitle}>Platform</Text>
          <TouchableOpacity>
            <Text style={styles.link}>About InternBridge</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.link}>How It Works</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.link}>Success Stories</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.linkColumn}>
          <Text style={styles.columnTitle}>Support</Text>
          <TouchableOpacity>
            <Text style={styles.link}>Help Center</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.link}>Contact Us</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.link}>Feedback</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.linkColumn}>
          <Text style={styles.columnTitle}>Legal</Text>
          <TouchableOpacity>
            <Text style={styles.link}>Privacy Policy</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.link}>Terms of Service</Text>
          </TouchableOpacity>
          <TouchableOpacity>
            <Text style={styles.link}>Cookie Policy</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Social Links */}
      <View style={styles.socialSection}>
        <TouchableOpacity 
          style={styles.socialButton}
          onPress={() => openLink('https://twitter.com/internbridge')}
        >
          <Text style={styles.socialIcon}>🐦</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.socialButton}
          onPress={() => openLink('https://linkedin.com/company/internbridge')}
        >
          <Text style={styles.socialIcon}>💼</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.socialButton}
          onPress={() => openLink('https://facebook.com/internbridge')}
        >
          <Text style={styles.socialIcon}>👍</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.socialButton}
          onPress={() => openLink('https://instagram.com/internbridge')}
        >
          <Text style={styles.socialIcon}>📷</Text>
        </TouchableOpacity>
      </View>

      {/* Copyright */}
      <View style={styles.copyrightSection}>
        <Text style={styles.copyrightText}>
          © {currentYear} InternBridge. All rights reserved.
        </Text>
        <Text style={styles.madeWithLove}>
          Made with ❤️ for rural youth empowerment
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1F2937',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  sdgSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  sdgTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
  },
  sdgDescription: {
    fontSize: 14,
    color: '#D1D5DB',
    textAlign: 'center',
    lineHeight: 20,
  },
  linksSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  linkColumn: {
    flex: 1,
    alignItems: 'flex-start',
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  link: {
    fontSize: 14,
    color: '#D1D5DB',
    marginBottom: 8,
  },
  socialSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  socialButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  socialIcon: {
    fontSize: 18,
  },
  copyrightSection: {
    alignItems: 'center',
  },
  copyrightText: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  madeWithLove: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
});

export default Footer;