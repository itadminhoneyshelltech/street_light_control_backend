// mobile/src/screens/Dashboard.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { useAuthStore } from '../store/authStore';
import { lightService } from '../services/api';

const { width } = Dimensions.get('window');

interface Statistics {
  totalLights: number;
  lightsOn: number;
  lightsOff: number;
  lightsInError: number;
}

export const Dashboard: React.FC = ({ navigation }: any) => {
  const { user, token } = useAuthStore();
  const [stats, setStats] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      navigation.replace('Login');
    } else {
      fetchStats();
    }
  }, [token]);

  const fetchStats = async () => {
    try {
      const data = await lightService.getCitySummary(user?.city);
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ label, value, color }: any) => (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🚦 Street Light Control</Text>
        <Text style={styles.userInfo}>{user?.name} ({user?.role})</Text>
      </View>

      {loading ? (
        <Text style={styles.loading}>Loading...</Text>
      ) : (
        <View style={styles.statsContainer}>
          <StatCard label="Total Lights" value={stats?.totalLights || 0} color="#667eea" />
          <StatCard label="Lights ON" value={stats?.lightsOn || 0} color="#ffd700" />
          <StatCard label="Lights OFF" value={stats?.lightsOff || 0} color="#4a90e2" />
          <StatCard label="In Error" value={stats?.lightsInError || 0} color="#ff6b6b" />
        </View>
      )}

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.navButton, styles.navButtonPrimary]}
          onPress={() => navigation.navigate('Lights')}
        >
          <Text style={styles.navButtonText}>Control Lights</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, styles.navButtonSecondary]}
          onPress={() => navigation.navigate('Map')}
        >
          <Text style={styles.navButtonText}>View Map</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    backgroundColor: '#667eea',
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  userInfo: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  loading: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    padding: 15,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 5,
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  buttonContainer: {
    padding: 15,
    gap: 12,
  },
  navButton: {
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  navButtonPrimary: {
    backgroundColor: '#667eea',
  },
  navButtonSecondary: {
    backgroundColor: '#764ba2',
  },
  navButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
