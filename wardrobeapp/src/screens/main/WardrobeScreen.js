import { useState } from 'react';
import {View, Text, FlatList, TouchableOpacity,StyleSheet, ScrollView,} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import ClothingCard from '../../components/ClothingCard';
import { colors, spacing, radius } from '../../theme';

const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Outerwear', 'Accessories'];

const MOCK_ITEMS = [
  { id: '1', category: 'Tops',      imageUri: null, isFavorite: false },
  { id: '2', category: 'Outerwear', imageUri: null, isFavorite: true  },
  { id: '3', category: 'Bottoms',   imageUri: null, isFavorite: false },
  { id: '4', category: 'Tops',      imageUri: null, isFavorite: false },
  { id: '5', category: 'Bottoms',   imageUri: null, isFavorite: true  },
  { id: '6', category: 'Outerwear', imageUri: null, isFavorite: false },
];

export default function WardrobeScreen() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [items, setItems] = useState(MOCK_ITEMS);

  const filtered = activeCategory === 'All'
    ? items
    : items.filter(i => i.category.toLowerCase() === activeCategory.toLowerCase());

  const toggleFavorite = (id) => {
    setItems(prev =>
      prev.map(item => item.id === id ? { ...item, isFavorite: !item.isFavorite } : item)
    );
  };

  const renderCard = ({ item, index }) => (
    <View style={styles.cardWrapper}>
      <ClothingCard
        imageUri={item.imageUri}
        category={item.category}
        isFavorite={item.isFavorite}
        onFavorite={() => toggleFavorite(item.id)}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.title}>My Wardrobe</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        style={{overflow: 'visible', paddingLeft: spacing.md,}}
      >
        {CATEGORIES.map(cat => (
          <TouchableOpacity
            key={cat}
            style={[styles.chip, activeCategory === cat && styles.chipActive]}
            onPress={() => setActiveCategory(cat)}
            activeOpacity={0.75}
          >
            <Text style={[styles.chipText, activeCategory === cat && styles.chipTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FlatList
        data={filtered}
        renderItem={renderCard}
        keyExtractor={item => item.id}
        numColumns={2}
        contentContainerStyle={{
            paddingHorizontal: spacing.md,
            paddingBottom: spacing.lg,
            flexGrow: 0,
            justifyContent: 'flex-start',
          }}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        style={{flex: 0, marginTop: spacing.md,}}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 0, backgroundColor: colors.background, justifyContent: 'flex-start', height: 'auto' },
  title: {
    fontSize: 28,
    fontWeight: '400',
    color: colors.textDark,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    fontFamily: 'PatrickHand_400Regular',
  },
  filterRow: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.sm,
  },
  chip: {
    height: 36,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,

    borderRadius: radius.full,
    backgroundColor: colors.inputBg,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: colors.textDark,
    borderColor: colors.textDark,
  },
  chipText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textMid,
    paddingBottom: spacing.sm,
    includeFontPadding: false,
  },
  chipTextActive: {
    color: colors.white,
  },
  grid: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.lg,
    justifyContent: 'flex-start',
    flexGrow: 0 ,
  },
  row: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  cardWrapper: {
    flex: 1,
  },
});
