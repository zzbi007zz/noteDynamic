import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../theme';
import { Card } from '../../components/card';
import { Button } from '../../components/button';
import { useAuthStore } from '../../store/auth-store';

export const SettingsScreen: React.FC = () => {
  const { user, signOut } = useAuthStore();
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await signOut();
    } catch {
      // Error handled in store
    }
  };

  const renderSettingItem = (
    icon: string,
    title: string,
    subtitle?: string,
    onPress?: () => void
  ) => (
    <TouchableOpacity
      key={title}
      style={styles.settingItem}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingIconContainer}>
        <Icon name={icon} size={22} color={colors.primary} />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        {subtitle && (
          <Text style={styles.settingSubtitle}>{subtitle}</Text>
        )}
      </View>
      {onPress && (
        <Icon name="chevron-right" size={20} color={colors.gray400} />
      )}
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      {/* User Profile Card */}
      <View style={styles.profileSection}>
        <Card style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.displayName?.[0]?.toUpperCase() ||
                  user?.email?.[0]?.toUpperCase() ||
                  '?'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>
                {user?.displayName || 'User'}
              </Text>
              <Text style={styles.profileEmail}>{user?.email}</Text>
            </View>
          </View>
        </Card>
      </View>

      {/* Settings Sections */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <Card>
          {renderSettingItem(
            'bell-outline',
            'Notifications',
            'Manage notification settings'
          )}
          <View style={styles.divider} />
          {renderSettingItem(
            'theme-light-dark',
            'Appearance',
            'Light or dark theme'
          )}
          <View style={styles.divider} />
          {renderSettingItem(
            'shield-check-outline',
            'Privacy & Security',
            'Manage your security'
          )}
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        <Card>
          {renderSettingItem(
            'help-circle-outline',
            'Help Center',
            'Get help with QuickNote'
          )}
          <View style={styles.divider} />
          {renderSettingItem(
            'message-text-outline',
            'Contact Us',
            'Send us feedback'
          )}
          <View style={styles.divider} />
          {renderSettingItem(
            'information-outline',
            'About',
            'Version 0.0.1'
          )}
        </Card>
      </View>

      {/* Logout Button */}
      <View style={styles.logoutSection}>
        <Button
          title="Sign Out"
          onPress={handleLogout}
          variant="outline"
          size="large"
        />
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

import { TouchableOpacity } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  profileSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  profileCard: {
    marginBottom: 0,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.white,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.gray800,
  },
  profileEmail: {
    fontSize: 14,
    color: colors.gray500,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gray500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  settingIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingContent: {
    flex: 1,
    marginLeft: 12,
  },
  settingTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.gray800,
  },
  settingSubtitle: {
    fontSize: 13,
    color: colors.gray500,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.gray100,
    marginLeft: 64,
  },
  logoutSection: {
    paddingHorizontal: 16,
    marginTop: 32,
  },
  bottomSpacing: {
    height: 32,
  },
});
