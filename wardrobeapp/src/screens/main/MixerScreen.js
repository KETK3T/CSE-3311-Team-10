import { useState, useRef, useEffect,useCallback } from 'react'
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Share, FlatList, useWindowDimensions, ActivityIndicator
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'
import ClothingCard from '../../components/ClothingCard'
import { colors, spacing,} from '../../theme'
import { useAuth } from '../../backend/useAuth'
import { getClothingItemByCategory } from '../../backend/wardrobeService'
import {useFocusEffect} from '@react-navigation/native'

const CATEGORIES = ['Outerwear', 'Tops', 'Bottoms']


export default function MixerScreen() {

  const {user} = useAuth()
  const [wardrobe, setWardrobe] = useState({Tops: [], Outerwear: [], Bottoms: []})
  const [isLoading, setIsLoading] = useState(true)
  const [selected, setSelected] = useState({
    Tops: 0,
    Outerwear: 0,
    Bottoms: 0,
  })

  const flatListRefs = {
    Tops: useRef(null),
    Outerwear: useRef(null),
    Bottoms: useRef(null),
  }

  const { width } = useWindowDimensions()
  const cardWidth = width - 120



  useFocusEffect(
    useCallback(() => {
      if(!user?.id) return
      const fetchWardrobe = async () => {
        setIsLoading(true)
        const results = await Promise.all(
        CATEGORIES.map(cat => getClothingItemByCategory(user.id, cat))
        )
        const newWardrobe = {}
        CATEGORIES.forEach((cat, i) => {
          newWardrobe[cat] = results[i].items
        })

        setWardrobe(newWardrobe)
        setIsLoading(false)
      }
      fetchWardrobe()
    }, [user?.id])
  )

  const handleRandomize = () => {
    const newSelected = {};
    CATEGORIES.forEach(cat => {
      if(wardrobe[cat].length === 0) return
      const randomIndex = Math.floor(Math.random() * wardrobe[cat].length);
      newSelected[cat] = randomIndex;
      flatListRefs[cat].current?.scrollToIndex({ index: randomIndex, animated: true });
    });
    setSelected(newSelected);
  }

  const handleShare = async () => {
    try {
      await Share.share({ message: 'Check out my outfit from My Wardrobe app! 👗' });
    } catch (e) { console.log(e); }
  }

  if(isLoading){
    return(
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primaryDark}/>
        </View>
      </SafeAreaView>
    )
  }

  const hasItems = CATEGORIES.some(cat => wardrobe[cat].length > 0)

  if(!hasItems){
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Text style={styles.title}>Mix & Match</Text>
        </View>
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

      <View style={styles.header}>
        <Text style={styles.title}>Mix & Match</Text>
        <Text style={styles.subtitle}>
          Find your perfect look or{' '}
          <Text style={styles.randomizeLink} onPress={handleRandomize}>
            RANDOMIZE
          </Text>
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.outfitArea}>

          <TouchableOpacity style={styles.sideBtn} onPress={handleRandomize}>
            <Ionicons name="refresh" size={28} color={colors.textDark} />
          </TouchableOpacity>

          <View style={styles.cardsColumn}>
            {CATEGORIES.map(cat => {
              const items = wardrobe[cat]
              if (items.length === 0){
                return(
                  <View key={cat} style={[styles.emptySlot, {width: cardWidth, height: 200}]}>
                    <Ionicons name="add-circle-outline" size={32} color={colors.textMid}/>
                    <Text style={styles.emptySlotText}>No {cat}</Text>
                  </View>
                )
              }
            return(
              <FlatList
                key={cat}
                ref={flatListRefs[cat]}
                data={items}
                keyExtractor={item => item.id}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                snapToInterval={cardWidth + spacing.md}
                decelerationRate="fast"
                style={{ marginBottom: spacing.md }}
                renderItem={({ item }) => (
                  <View style={{ width: cardWidth, marginRight: spacing.md, height: 200}}>
                    <ClothingCard
                      imageUri={item.image_url}
                      category={item.category}
                    />
                  </View>
                )}
              />
              )
            })}
          </View>

          <TouchableOpacity style={styles.sideBtn} onPress={handleShare}>
            <Ionicons name="share-social-outline" size={28} color={colors.textDark} />
          </TouchableOpacity>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    alignItems: 'center',
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  title: {
    fontSize: 28,
    fontWeight: '400',
    color: colors.primaryDark,
    fontFamily: 'PatrickHand_400Regular',
  },
  subtitle: {
    fontSize: 13,
    color: colors.textMid,
    marginTop: 2,
  },
  randomizeLink: {
    color: colors.primaryDark,
    fontWeight: '700',
  },
  scroll: {
    paddingBottom: spacing.xl,
  },
  outfitArea: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.md,
  },
  sideBtn: {
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.sm,
  },
  cardsColumn: {
    flex: 1,
  },
  emptySlot: {
    height: 160,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  emptySlotText: {
    fontSize: 13,
    color: colors.textMid,
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
});