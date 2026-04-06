import { useCallback, useState, useEffect } from 'react'
import {View, Text, FlatList, TouchableOpacity,StyleSheet, ScrollView, ActivityIndicator, Alert,} from 'react-native'
import {SafeAreaView} from 'react-native-safe-area-context'
import ClothingCard from '../../components/ClothingCard'
import { colors, spacing, radius } from '../../theme'
import {useFocusEffect} from '@react-navigation/native'
import { getAllClothingItems, toggleFavorite, deleteClothingItem } from '../../backend/wardrobeService'
import { useAuth } from '../../backend/useAuth'


const CATEGORIES = ['All', 'Tops', 'Bottoms', 'Outerwear', 'Accessories']
const CATEGORY_COLORS = {
  Tops: '#F9A8D4',
  Bottoms: '#93C5FD',
  Outerwear: '#6EE7B7',
  Accessories: '#FCD34D',
  default: '#C4B5FD',
}
export default function WardrobeScreen({navigation}) {
  const {user} = useAuth()
  const [activeCategory, setActiveCategory] = useState('All')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)



  useEffect(() => {
    if(!user?.id) return
    loadItems()
  }, [user?.id])

  const loadItems = async () => {
    setLoading(true)
    const {items: fetchedItems, error} = await getAllClothingItems(user?.id)
    if (!error){
      setItems(fetchedItems)
    } 
    setLoading(false)
  }

  useFocusEffect(
    useCallback(() => {
      if(!user?.id || loading) return
      const syncItems = async() => {
        const {items: fetchedItems, error} = await getAllClothingItems(user.id)
        if(error) return
        setItems(prev => {
          const prevIds = prev.map(i => i.id).join()
          const nextIds = fetchedItems.map(i => i.id).join()
          return prevIds !== nextIds ? fetchedItems : prev
        })
      }
      syncItems()
    }, [user?.id, loading])
  )

  const filtered = activeCategory === 'All'
    ? items
    : items.filter(i => i.category.toLowerCase() === activeCategory.toLowerCase())

  const handleToggleFavorite = async (id, currentStatus) => {
    const {item ,error} =  await toggleFavorite(id, currentStatus)
    if(!error){
      setItems(prev => 
        prev.map(i => i.id === id? {...i, is_favorite: item.is_favorite} : i)
      )
    }
  }

  const handleDelete = async (id) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to remove this item from your wardrobe?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const { error } = await deleteClothingItem(id)
            if (!error) {
              setItems(prev => prev.filter(i => i.id !== id))
            }
          },
        },
      ]
    )
  }

  const renderCard = ({ item}) => (
    <View style={styles.cardWrapper}>
      <ClothingCard
        imageUri={item.image_url}
        category={item.category}
        isFavorite={item.is_favorite}
        onFavorite={() => handleToggleFavorite(item.id, item.is_favorite)}
        onDelete={() => handleDelete(item.id)}
        onAddToMixer={() => navigation.jumpTo('Mixer', 
          {
            scrollTo: {category: item.category, id:item.id},
            timestamp: Date.now()
          })}
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
        {CATEGORIES.map(cat => {
          const isActive =  activeCategory === cat
          const catColor = CATEGORY_COLORS[cat] || CATEGORY_COLORS.default
          return(
            <TouchableOpacity
              key={cat}
              style={[styles.chip, isActive && {backgroundColor: catColor, borderColor: catColor}]}
              onPress={() => setActiveCategory(cat)}
              activeOpacity={0.75}
            >
              <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                {cat}
              </Text>
            </TouchableOpacity>
          )
        })}
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
              paddingBottom: spacing.sumo,
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
    color: '#1a1a1a',
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
