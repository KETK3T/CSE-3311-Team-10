import { useCallback, useState, useEffect } from 'react';
import {View, Text, FlatList, TouchableOpacity,StyleSheet, ScrollView, ActivityIndicator,} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import ClothingCard from '../../components/ClothingCard';
import { colors, spacing, radius } from '../../theme';
import {useFocusEffect} from '@react-navigation/native';
import { getAllClothingItems, toggleFavorite, deleteClothingItem } from '../../backend/wardrobeService';
import { useAuth } from '../../backend/useAuth';


const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Outerwear', 'Accessories'];

// const MOCK_USER_ID = '34f19f18-0889-4773-b27c-6bada8f795c4'

export default function WardrobeScreen() {
  const {user} = useAuth()
  const [activeCategory, setActiveCategory] = useState('All');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      loadItems()
    },[user])
  )

  const loadItems = async () => {
    if(!user?.id) return
    setLoading(true)
    const {items: fetchedItems, error} = await getAllClothingItems(user?.id)
    if (!error){
      setItems(fetchedItems)
    } 
    setLoading(false)
  }


  const filtered = activeCategory === 'All'
    ? items
    : items.filter(i => i.category.toLowerCase() === activeCategory.toLowerCase());

  const handleToggleFavorite = async (id, currentStatus) => {
    const {item ,error} =  await toggleFavorite(id, currentStatus)
    if(!error){
      setItems(prev => 
        prev.map(i => i.id === id? {...i, is_favorite: item.is_favorite} : i)
      )
    }
  }

  const handleDelete = async (id) => {
    const { error } = await deleteClothingItem(id);
    if (!error) {
      setItems(prev => prev.filter(i => i.id !== id));
    }
  }

  const renderCard = ({ item}) => (
    <View style={styles.cardWrapper}>
      <ClothingCard
        imageUri={item.image_url}
        category={item.category}
        isFavorite={item.is_favorite}
        onFavorite={() => handleToggleFavorite(item.id, item.is_favorite)}
        onDelete={() => handleDelete(item.id)}
        onAddToMixer={() => console.log('Add to mixer:', item.id)}
      />
    </View>
  )

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
  )
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
})
