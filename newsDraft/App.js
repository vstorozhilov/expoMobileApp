import { View, ScrollView} from 'react-native';
import { FlatList } from 'react-native-bidirectional-infinite-scroll'
import { IconComponentProvider } from "@react-native-material/core";
import { useRef, useState, useEffect } from 'react';
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Post from './components/Post';
import { Text } from 'react-native';

export default function App() {

  const [filter, setFilter] = useState(null);
  const [posts, setPosts] = useState([]);
  const scrollRef = useRef(null);

  const getNews = async ()=> {
    let response = await fetch('http://82.146.37.120:8080/documents?period=24');
    let JSresponse = await response.json();

    setPosts(JSresponse.map((item, index)=>({title : item.title,
      link : item.link,
      published : item.published,
      summary : item.ds_insight.insight,
      repost_cnt : item.repost_cnt,
      id : item._id
    })).slice(0, 5));
  };

  useEffect(()=>{
    getNews();
  }, []);

  return (
    <IconComponentProvider IconComponent={MaterialCommunityIcons}>
    <View  style={{
        flex : 1,
        paddingTop : 30,
        backgroundColor : 'black',
        alignItems: 'center'}}>
        {posts.length ?
            <FlatList
            scrollEnabled={filter !== null ? false : true}
            ref={scrollRef}
            contentContainerStyle={{
              justifyContent : 'flex-start',
              alignItems : 'center'
            }}
            data={posts}
              renderItem={({ item, index })=>(
                <Post scrollRef={scrollRef} setPosts={setPosts} posts={posts} setFilter={setFilter} item={item} filter={filter} key={item.id} index={index}/>
              )}
            />
        :
         <Text style={{paddingTop: 100, fontSize : 15, color : 'white'}}>Пожалуйста, подождите. Новости уже загружаются</Text>}
    </View>
    </IconComponentProvider>
  );
}
