import React, {useState} from 'react'
import { View, Image, Text, StyleSheet, TouchableOpacity,Modal,Pressable } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { colors, radius,spacing} from '../theme'
import TopIcon from '../../assets/tops-icon.png';
import BotIcon from '../../assets/bottoms-icon.png';
import OuterIcon from '../../assets/outerwear-icon.png';

const CATEGORY_COLORS = {
  Tops: '#F9A8D4',
  Bottoms: '#93C5FD',
  Outerwear: '#6EE7B7',
  Accessories: '#FCD34D',
  default: '#C4B5FD',
}

export default function ClothingCard({
  imageUri,
  category = 'TOPS',
  brand = null,
  isFavorite = false,
  isPrivate = false,
  onPress,
  onFavorite,
  onDelete,
  onAddToMixer,
  onTogglePrivate,
  isOwner = true,
  style,
  showCategory = true,
}) {
  const [menuVisible, setMenuVisible] = useState(false)
  const bannerColor = CATEGORY_COLORS[category] || CATEGORY_COLORS.default
  return (
    <>
<TouchableOpacity
  style={[styles.card, style]}
  onPress={onPress}
  onLongPress={isOwner ? () => setMenuVisible(true) : null}
  activeOpacity={0.85}
  delayLongPress={400}
>
  <Image
    source={imageUri ? { uri: imageUri } : require('../../assets/wardrobe-logo.png')}
    style={styles.image}
    resizeMode="cover"
  />

  {showCategory && (   
    <View style={[styles.banner, { backgroundColor: bannerColor }]}>
          <Image source={category.toUpperCase() === 'TOPS' ? TopIcon : category.toUpperCase() === 'BOTTOMS' ? BotIcon : OuterIcon} 
                  style={styles.categoryIcon} />
      <Text style={styles.bannerText} numberOfLines={1}>
        {brand ? `${brand.toUpperCase()} · ${category.toUpperCase()}` : category.toUpperCase()}
      </Text> 
      <View style={styles.bannerRight}>
        {isPrivate && (
          <Ionicons name="lock-closed" size={12} color='#fff' style={{marginRight: 6}}/>
        )}
      </View>
      <TouchableOpacity onPress={onFavorite} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons
          name={isFavorite ? 'star' : 'star-outline'}
          size={16}
          color="#fff"
        />
      </TouchableOpacity>
    </View>
  )}

</TouchableOpacity>

      <Modal
        visible={menuVisible}
        transparent
        animationType='fade'
        onRequestClose={() => setMenuVisible(false)}
      >

        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menu}>
            <TouchableOpacity
              style ={styles.menuItem}
              onPress={() => {
                onFavorite?.()
                setMenuVisible(false)
              }}
            >
              <Ionicons
                name={isFavorite?'star':'star-outline'}
                size={22}
                color={colors.primaryDark}
              />

              <Text style={styles.menuText}>
                {isFavorite ? 'Unfavorite' : 'Favorite'}
              </Text>
            </TouchableOpacity>
          <View styles={styles.divider}/>
            
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              onAddToMixer?.()
              setMenuVisible(false)
            }}
          >
            <Ionicons  name="shuffle-outline" size={22} color={colors.textDark} />
            <Text style={styles.menuText}>Add to Mixer</Text>
          </TouchableOpacity>
          <TouchableOpacity
          style={styles.menuItem}
            onPress={() => {
              onTogglePrivate?.()
              setMenuVisible(false)
            }}
          >
            <Ionicons name={isPrivate ? 'lock-open-outline' : 'lock-closed-outline'} size={22} color={colors.textDark}/>
            <Text style={styles.menuText}>
                {isPrivate ? 'Make Public' : 'Make Private'}
              </Text>
          </TouchableOpacity>
          <View styles={styles.divider}/>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              onDelete?.()
              setMenuVisible(false)
            }}
          >

            <Ionicons name="trash-outline" size={22} color='red'/>
            <Text style={[styles.menuText, {color: 'red'}]}>Delete</Text>
          </TouchableOpacity>
          </View>
        </Pressable>

      </Modal>

    </>

  )
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
    color: '#1a1a1a',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menu: {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    width: 220,
    paddingVertical: spacing.sm,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  menuText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textDark,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
  },
  categoryIcon: {
    width: 30,
    height: 30,
    resizeMode: 'cover',
    alignContent: 'left',
  },
  bannerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
})