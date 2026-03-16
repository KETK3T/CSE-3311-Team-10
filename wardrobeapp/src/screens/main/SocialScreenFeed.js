import React from 'react';
import { ScrollView, StyleSheet, View, Text } from 'react-native';
import SocialPostCard from '../../components/SocialPostCard';

export default function SocialScreenFeed() {
  return (
    <ScrollView style={{ flex:1,backgroundColor:'#000' }}>
      <Text style={{color:'white',fontSize:50,marginTop:100}}>THIS IS THE SOCIAL SECTION TEST</Text>
      <SocialPostCard 
        username="smarty_antha" 
        postImage="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800" 
      />
      
      <SocialPostCard 
        username="uta_student" 
        postImage="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=800" 
      />
      <View style={{height:50}} />
    </ScrollView>
  );
}

const styles=StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:'#000',
  },
  debugText:{
    color:'white',
    fontSize:50,
    marginTop:100,
    textAlign:'center'
  },
  header:{
    paddingVertical:15,
    borderBottomWidth:0.5,
    borderBottomColor:'#222',
    alignItems:'center',
    backgroundColor:'#000',
  },
  headerText:{
    color:'white',
    fontSize:20,
    fontWeight:'bold',
  }
});
  