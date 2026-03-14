import { useCallback, useState, useEffect } from 'react';
import {View, Text, FlatList, TouchableOpacity,StyleSheet, ScrollView, ActivityIndicator,} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import ClothingCard from '../../components/ClothingCard';
import { colors, spacing, radius } from '../../theme';
import {useFocusEffect} from '@react-navigation/native';
import { getAllClothingItems, toggleFavorite } from '../../backend/wardrobeService';


const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Outerwear', 'Accessories'];

const MOCK_USER_ID = 'user-1'
// const MOCK_ITEMS = [
//   { id: '1', category: 'Tops',      imageUri: null, isFavorite: false },
//   { id: '2', category: 'Outerwear', imageUri: null, isFavorite: true  },
//   { id: '3', category: 'Bottoms',   imageUri: null, isFavorite: false },
//   { id: '4', category: 'Tops',      imageUri: null, isFavorite: false },
//   { id: '5', category: 'Bottoms',   imageUri: null, isFavorite: true  },
//   { id: '6', category: 'Outerwear', imageUri: null, isFavorite: false },
// ];

export default function WardrobeScreen() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadItems()
    },[])
  )

  const loadItems = async () => {
    setLoading(true)
    const {items, error} = await getAllClothingItems(MOCK_USER_ID)
    console.log('Items in wardrobe:',items)
    if (!error) setItems(items)
    setLoading(false)
  }


  const filtered = activeCategory === 'All'
    ? items
    : items.filter(i => i.category.toLowerCase() === activeCategory.toLowerCase());

  const handleToggleFavorite = async (id) => {
    const {item ,erro} =  await toggleFavorite(id)
    if(!error){
      setItems(prev => 
        prev.map(i => i.id === id? {...i, is_favorite: item.is_favorite} : i)
      )
    }
  };

  const renderCard = ({ item, index }) => (
    <View style={styles.cardWrapper}>
      <ClothingCard
        imageUri={item.image_url}
        category={item.category}
        isFavorite={item.is_favorite}
        onFavorite={() => handleToggleFavorite(item.id)}
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
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size='large' color={colors.primaryDark} />
        </View>
      ) : (
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

          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Looks Like your wardrobe is empty</Text>
              <Text style={styles.emptySubText}>Upload a clothing item to add clothes!!!</Text>
            </View>
          }
        />
      )}
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
    height: 42,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    textAlign: 'center',
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
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: spacing.xl * 3,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.textDark,
    fontFamily: 'PatrickHand_400Regular',
  },
  emptySubText: {
    fontSize: 14,
    color: colors.textLight,
    marginTop: spacing.sm,
  },
});
