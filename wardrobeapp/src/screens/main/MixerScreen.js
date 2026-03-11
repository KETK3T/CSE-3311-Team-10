import { useState, useRef } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, Share, FlatList, useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import ClothingCard from '../../components/ClothingCard';
import { colors, spacing,} from '../../theme';

const WARDROBE = {
  Tops:      [
    { id: 't1', category: 'Tops',      imageUri: null },
    { id: 't2', category: 'Tops',      imageUri: null },
    { id: 't3', category: 'Tops',      imageUri: null },
  ],
  Outerwear: [
    { id: 'o1', category: 'Outerwear', imageUri: null },
    { id: 'o2', category: 'Outerwear', imageUri: null },
  ],
  Bottoms:   [
    { id: 'b1', category: 'Bottoms',   imageUri: null },
    { id: 'b2', category: 'Bottoms',   imageUri: null },
    { id: 'b3', category: 'Bottoms',   imageUri: null },
  ],
};

const CATEGORIES = ['Tops', 'Outerwear', 'Bottoms'];

const randomFrom = (arr) => arr[Math.floor(Math.random() * arr.length)];

function CategoryRow({ category, items }) {
  const { width } = useWindowDimensions();
  const cardWidth = width - 120; 

  return (
    <FlatList
      data={items}
      keyExtractor={item => item.id}
      horizontal
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      snapToInterval={cardWidth + spacing.md}
      decelerationRate="fast"
      renderItem={({ item }) => (
        <View style={{ width: cardWidth, marginRight: spacing.md }}>
          <ClothingCard
            imageUri={item.imageUri}
            category={item.category}
          />
        </View>
      )}
    />
  );
}

export default function MixerScreen() {
  const [selected, setSelected] = useState({
    Tops: 0,
    Outerwear: 0,
    Bottoms: 0,
  });

  const flatListRefs = {
    Tops: useRef(null),
    Outerwear: useRef(null),
    Bottoms: useRef(null),
  };

  const { width } = useWindowDimensions();
  const cardWidth = width - 120;

  const handleRandomize = () => {
    const newSelected = {};
    CATEGORIES.forEach(cat => {
      const randomIndex = Math.floor(Math.random() * WARDROBE[cat].length);
      newSelected[cat] = randomIndex;
      flatListRefs[cat].current?.scrollToIndex({ index: randomIndex, animated: true });
    });
    setSelected(newSelected);
  };

  const handleShare = async () => {
    try {
      await Share.share({ message: 'Check out my outfit from My Wardrobe app! 👗' });
    } catch (e) { console.log(e); }
  };

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
            {CATEGORIES.map(cat => (
              <View key={cat}>
                <FlatList
                  ref={flatListRefs[cat]}
                  data={WARDROBE[cat]}
                  keyExtractor={item => item.id}
                  horizontal
                  pagingEnabled
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={cardWidth + spacing.md}
                  decelerationRate="fast"
                  style={{ marginBottom: spacing.md }}
                  renderItem={({ item }) => (
                    <View style={{ width: cardWidth, marginRight: spacing.md }}>
                      <ClothingCard
                        imageUri={item.imageUri}
                        category={item.category}
                      />
                    </View>
                  )}
                />
              </View>
            ))}
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
});