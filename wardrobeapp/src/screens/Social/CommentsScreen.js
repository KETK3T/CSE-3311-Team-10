import React,{useState,useEffect} from 'react';
import {View,Text,StyleSheet,TextInput,TouchableOpacity,FlatList,KeyboardAvoidingView,Platform,ActivityIndicator} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {supabase} from '../../backend/supabase-client';
import {useAuth} from '../../backend/useAuth';

export default function CommentsScreen({route,navigation}){
  const {postId}=route.params;
  const {user}=useAuth();
  const [comments,setComments]=useState([]);
  const [inputText,setInputText]=useState('');
  const [loading,setLoading]=useState(true);
  const [posting,setPosting]=useState(false);

  const fetchComments=async()=>{
    try{
      const {data,error}=await supabase
        .from('post_comments')
        .select(`
          id,
          content,
          created_at,
          user_id,
          profiles(username)
        `)
        .eq('post_id',postId)
        .order('created_at',{ascending:true});

      if(error) throw error;
      setComments(data||[]);
    }catch(err){
      console.log("Error fetching comments:",err.message);
    }finally{
      setLoading(false);
    }
  };

  const handlePostComment=async()=>{
    if(!inputText.trim()||!user) return;
    setPosting(true);
    try{
      const {error}=await supabase
        .from('post_comments')
        .insert([{
          post_id:postId,
          user_id:user.id,
          content:inputText.trim()
        }]);

      if(error) throw error;
      
      setInputText('');
      fetchComments(); 
    }catch(err){
      console.log("Post comment error:",err.message);
    }finally{
      setPosting(false);
    }
  };

  useEffect(()=>{
    fetchComments();
  },[]);

  const renderComment=({item})=>(
    <View style={styles.commentRow}>
      <View style={styles.avatar}>
        <Ionicons name="person" size={16} color="white"/>
      </View>
      <View style={styles.commentBubble}>
        <Text style={styles.username}>@{item.profiles?.username||`User_${item.user_id.slice(0,5)}`}</Text>
        <Text style={styles.content}>{item.content}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={()=>navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={28} color="white"/>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Comments</Text>
        <View style={{width:28}}/>
      </View>

      {loading?(
        <ActivityIndicator color="#7C5CBF" style={{marginTop:20}}/>
      ):(
        <FlatList
          data={comments}
          keyExtractor={item=>item.id}
          renderItem={renderComment}
          contentContainerStyle={{padding:15}}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Be the first to comment!</Text>
          }
        />
      )}

      <KeyboardAvoidingView 
        behavior={Platform.OS==='ios'?'padding':'height'}
        keyboardVerticalOffset={Platform.OS==='ios'?90:0}
      >
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Add a comment..."
            placeholderTextColor="#666"
            value={inputText}
            onChangeText={setInputText}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendBtn, !inputText.trim()&&{opacity:0.5}]}
            onPress={handlePostComment}
            disabled={!inputText.trim()||posting}
          >
            {posting?(
              <ActivityIndicator color="white" size="small"/>
            ):(
              <Ionicons name="send" size={20} color="white"/>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles=StyleSheet.create({
  container:{flex:1,backgroundColor:'#000'},
  header:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',paddingTop:50,paddingBottom:15,borderBottomWidth:1,borderBottomColor:'#222'},
  backBtn:{paddingHorizontal:15},
  headerTitle:{color:'white',fontSize:18,fontWeight:'bold'},
  commentRow:{flexDirection:'row',marginBottom:20},
  avatar:{width:32,height:32,borderRadius:16,backgroundColor:'#333',justifyContent:'center',alignItems:'center',marginRight:12},
  commentBubble:{flex:1,backgroundColor:'#111',padding:12,borderRadius:12,borderTopLeftRadius:4},
  username:{color:'#7C5CBF',fontWeight:'bold',marginBottom:4,fontSize:13},
  content:{color:'white',fontSize:14,lineHeight:20},
  emptyText:{color:'#666',textAlign:'center',marginTop:40},
  inputContainer:{flexDirection:'row',padding:15,backgroundColor:'#0A0A0A',borderTopWidth:1,borderTopColor:'#222',alignItems:'flex-end'},
  input:{flex:1,backgroundColor:'#1A1A1A',color:'white',borderRadius:20,paddingHorizontal:15,paddingTop:12,paddingBottom:12,minHeight:40,maxHeight:100,marginRight:10},
  sendBtn:{width:44,height:44,borderRadius:22,backgroundColor:'#7C5CBF',justifyContent:'center',alignItems:'center'}
});