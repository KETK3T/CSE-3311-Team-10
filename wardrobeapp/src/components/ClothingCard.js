// src/components/ClothingCard.js
import React from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius,} from '../theme';

export default function ClothingCard({
  imageUri,
  category = 'TOPS',
  isFavorite = false,
  onPress,
  onFavorite,
  style,
}) {
  return (
    <TouchableOpacity style={[styles.card, style]} onPress={onPress} activeOpacity={0.85}>
      <Image
        source={imageUri ? { uri: imageUri } : require('../../assets/Placeholder.jpeg')}
        style={styles.image}
        resizeMode="cover"
      />
      <View style={styles.banner}>
        <Text style={styles.bannerText}>{category.toUpperCase()}</Text>
        <TouchableOpacity onPress={onFavorite} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons
            name={isFavorite ? 'star' : 'star-outline'}
            size={16}
            color="#fff"
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.inputBg,
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  banner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.labelBg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  bannerText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
