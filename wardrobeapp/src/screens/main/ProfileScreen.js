import  { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView,} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ClothingCard from '../../components/ClothingCard';
import { colors, spacing, radius } from '../../theme';


const MOCK_FAVORITES = [
  { id: '1', category: 'Bottoms', imageUri: null, isFavorite: true },
  { id: '2', category: 'Bottoms', imageUri: null, isFavorite: true },
  { id: '3', category: 'Outerwear', imageUri: null, isFavorite: true },
  { id: '4', category: 'Outerwear', imageUri: null, isFavorite: true },
];

const STATS = [
  { label: 'Items',     value: '23'  },
  { label: 'outfits',   value: '41'  },
  { label: 'Followers', value: '2.3k' },
];

export default function ProfileScreen() {
  const [favorites, setFavorites] = useState(MOCK_FAVORITES);

  const toggleFavorite = (id) => {
    setFavorites(prev =>
      prev.map(f => f.id === id ? { ...f, isFavorite: !f.isFavorite } : f)
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView showsVerticalScrollIndicator={false}>

        <View style={styles.avatarWrapper}>
          <View style={styles.avatarCircle}>
            <Ionicons name="person" size={56} color={colors.textMid} />
          </View>
        </View>


        <Text style={styles.username}>USERNAME</Text>


        <View style={styles.statsRow}>
          {STATS.map(stat => (
            <View key={stat.label} style={styles.stat}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </View>
          ))}
        </View>


        <View style={styles.editRow}>
          <TouchableOpacity style={styles.editBtn}>
            <Text style={styles.editText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Favorites</Text>


        <View style={styles.grid}>
          {favorites.map((item, index) => (
            <View key={item.id} style={styles.cardWrapper}>
              <ClothingCard
                imageUri={item.imageUri}
                category={item.category}
                isFavorite={item.isFavorite}
                onFavorite={() => toggleFavorite(item.id)}
              />
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  avatarWrapper: { alignItems: 'center', marginTop: spacing.xl },
  avatarCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.inputBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  username: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: colors.textDark,
    marginTop: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xl,
    marginTop: spacing.md,
  },
  stat: { alignItems: 'center' },
  statValue: { fontSize: 18, fontWeight: '700', color: colors.textDark },
  statLabel: { fontSize: 12, color: colors.textLight, marginTop: 2 },
  editRow: { alignItems: 'center', marginTop: spacing.md },
  editBtn: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.full,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  editText: { fontSize: 14, fontWeight: '500', color: colors.textDark },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginTop: spacing.lg,
  },
  sectionTitle: {
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
    color: colors.textDark,
    paddingVertical: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  cardWrapper: {
    width: '47%',
  },
});
