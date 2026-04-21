import { useState, useRef, useCallback, useEffect } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Share, FlatList, useWindowDimensions, ActivityIndicator, Animated,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import ClothingCard from '../../components/ClothingCard'
import { colors, spacing } from '../../theme'
import { useAuth } from '../../backend/useAuth'
import { getClothingItemByCategory } from '../../backend/wardrobeService'
import { useFocusEffect } from '@react-navigation/native'

const CATEGORIES = ['Outerwear', 'Tops', 'Bottoms']

const CATEGORY_CONFIG = {
  Outerwear: { label: 'OUTERWEAR', accent: '#6EE7B7' },
  Tops:      { label: 'TOPS',      accent: '#F9A8D4' },
  Bottoms:   { label: 'BOTTOMS',   accent: '#93C5FD' },
}

export default function MixerScreen({ navigation, route }) {
  const { user } = useAuth()
  const [wardrobe, setWardrobe] = useState({ Tops: [], Outerwear: [], Bottoms: [] })
  const [isLoading, setIsLoading] = useState(true)
  const [selected, setSelected] = useState({ Tops: 0, Outerwear: 0, Bottoms: 0 })
  const fadeAnim = useRef(new Animated.Value(0)).current

  const flatListRefs = {
    Tops: useRef(null),
    Outerwear: useRef(null),
    Bottoms: useRef(null),
  }

  const { width } = useWindowDimensions()
  const cardWidth = width - 200

  useEffect(() => {
    if (!user?.id) return
    const initFetch = async () => {
      setIsLoading(true)
      const results = await Promise.all(
        CATEGORIES.map(cat => getClothingItemByCategory(user.id, cat))
      )
      const newWardrobe = {}
      CATEGORIES.forEach((cat, i) => { newWardrobe[cat] = results[i].items })
      setWardrobe(newWardrobe)
      setIsLoading(false)
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start()
    }
    initFetch()
  }, [user?.id])

  useFocusEffect(
    useCallback(() => {
      if (!user?.id) return
      const syncWardrobe = async () => {
        const results = await Promise.all(
          CATEGORIES.map(cat => getClothingItemByCategory(user.id, cat))
        )
        setWardrobe(prev => {
          const next = { ...prev }
          let hasChanges = false
          CATEGORIES.forEach((cat, i) => {
            const existingIds = new Set(prev[cat].map(item => item.id))
            const newItems = results[i].items.filter(item => !existingIds.has(item.id))
            if (newItems.length > 0) { next[cat] = [...prev[cat], ...newItems]; hasChanges = true }
          })
          return hasChanges ? next : prev
        })
      }
      syncWardrobe()
    }, [user?.id, isLoading])
  )

  useEffect(() => {
    const scrollTo = route.params?.scrollTo
    if (!scrollTo || !wardrobe[scrollTo.category]) return
    const index = wardrobe[scrollTo.category].findIndex(i => i.id === scrollTo.id)
    if (index === -1) return
    setTimeout(() => {
      flatListRefs[scrollTo.category]?.current?.scrollToIndex({ index, animated: true })
    }, 300)
    navigation.setParams({ scrollTo: null, timestamp: null })
  }, [route.params?.timestamp])

  const handleRandomize = () => {
    Animated.sequence([
      Animated.timing(fadeAnim, { toValue: 0.4, duration: 120, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start()
    const newSelected = {}
    CATEGORIES.forEach(cat => {
      if (wardrobe[cat].length === 0) return
      const randomIndex = Math.floor(Math.random() * wardrobe[cat].length)
      newSelected[cat] = randomIndex
      flatListRefs[cat].current?.scrollToIndex({ index: randomIndex, animated: true })
    })
    setSelected(newSelected)
  }

  const handleShare = async () => {
    try { await Share.share({ message: 'Check out my outfit from My Wardrobe app! 👗' }) }
    catch (e) { console.log(e) }
  }

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primaryDark} />
        </View>
      </SafeAreaView>
    )
  }

  const hasItems = CATEGORIES.some(cat => wardrobe[cat].length > 0)

  if (!hasItems) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Ionicons name="shirt-outline" size={48} color={colors.textMid} />
          <Text style={styles.emptyText}>Your wardrobe is empty</Text>
          <Text style={styles.emptySubtext}>Upload some clothes to start mixing!</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>TODAY'S LOOK</Text>
          <Text style={styles.title}>Mix & Match</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconBtn} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={20} color={colors.textDark} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shuffleBtn} onPress={handleRandomize}>
            <Ionicons name="shuffle-outline" size={16} color={colors.white} />
            <Text style={styles.shuffleBtnText}>SHUFFLE</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <View style={styles.outfitArea}>

            <View style={styles.cardsColumn}>
              {CATEGORIES.map((cat, catIndex) => {
                const items = wardrobe[cat]
                const config = CATEGORY_CONFIG[cat]
                const currentIndex = selected[cat] || 0

                if (items.length === 0) {
                  return (
                    <View key={cat}>
                      <View style={styles.rowHeader}>
                        <View style={[styles.categoryPill, { backgroundColor: config.accent }]}>
                          <Text style={styles.categoryPillText}>{config.label}</Text>
                        </View>
                      </View>
                      <View style={[styles.emptySlot, { width: cardWidth, borderColor: config.accent }]}>
                        <Ionicons name="add-circle-outline" size={32} color={config.accent} />
                        <Text style={[styles.emptySlotText, { color: config.accent }]}>No {cat}</Text>
                      </View>
                    </View>
                  )
                }

                return (
                  <View key={cat}>
                    {/* Row header with pill and counter */}
                    <View style={styles.rowHeader}>
                      <View style={[styles.categoryPill, { backgroundColor: config.accent }]}>
                        <Text style={styles.categoryPillText}>{config.label}</Text>
                      </View>
                      <Text style={styles.counter}>{currentIndex + 1} / {items.length}</Text>
                    </View>

                    <View style={{ overflow: 'hidden', width: cardWidth, alignSelf: 'center' }}>
                      <FlatList
                        ref={flatListRefs[cat]}
                        data={items}
                        keyExtractor={item => item.id}
                        horizontal
                        pagingEnabled
                        showsHorizontalScrollIndicator={false}
                        snapToInterval={cardWidth + spacing.md}
                        decelerationRate="fast"
                        onViewableItemsChanged={({ viewableItems }) => {
                          if (viewableItems[0]) {
                            setSelected(prev => ({ ...prev, [cat]: viewableItems[0].index }))
                          }
                        }}
                        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
                        renderItem={({ item }) => (
                          <View style={{ width: cardWidth, marginRight: spacing.md, height: 200 }}>
                            <View style={styles.cardWrapper}>
                              <ClothingCard
                                imageUri={item.image_url}
                                category={item.category}
                                style={{ flex: 1 }}
                              />
                              <View style={[styles.cardAccentBar, { backgroundColor: config.accent }]} />
                            </View>
                          </View>
                        )}
                      />
                    </View>

                    {/* Dots */}
                    {items.length > 1 && (
                      <View style={styles.dotsRow}>
                        {items.map((_, i) => (
                          <View
                            key={i}
                            style={[
                              styles.dot,
                              i === currentIndex && { ...styles.dotActive, backgroundColor: config.accent }
                            ]}
                          />
                        ))}
                      </View>
                    )}

                    {/* Divider between categories */}
                    {catIndex < CATEGORIES.length - 1 && (
                      <View style={styles.divider} />
                    )}
                  </View>
                )
              })}
            </View>

          </View>
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 2.5,
    color: colors.textLight,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    fontWeight: '400',
    color: colors.primaryDark,
    fontFamily: 'PatrickHand_400Regular',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  shuffleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryDark,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
  },
  shuffleBtnText: {
    color: colors.white,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  scroll: {
    paddingBottom: spacing.xl,
  },
  outfitArea: {
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.md,
  },
  cardsColumn: {
    flex: 1,
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingHorizontal: spacing.sm,
  },
  categoryPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  categoryPillText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#1a1a1a',
    letterSpacing: 1.5,
  },
  counter: {
    fontSize: 11,
    color: colors.textLight,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  cardWrapper: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardAccentBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.border,
  },
  dotActive: {
    width: 18,
    height: 5,
    borderRadius: 2.5,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
    marginHorizontal: spacing.sm,
  },
  emptySlot: {
    height: 160,
    borderRadius: 12,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    gap: spacing.xs,
    alignSelf: 'center',
  },
  emptySlotText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textDark,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textMid,
  },
})