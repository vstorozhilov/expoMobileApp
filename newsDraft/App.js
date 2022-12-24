import { View, ScrollView} from 'react-native';
import { FlatList } from 'react-native-bidirectional-infinite-scroll'
import { IconComponentProvider } from "@react-native-material/core";
import { useRef, useState, useEffect } from 'react';
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Post from './components/Post';
import { Text, ActivityIndicator } from 'react-native';

var news = []

export default function App() {

  const [offset, setOffset] = useState(0);
  const [filter, setFilter] = useState(null);
  const [posts, setPosts] = useState([]);
  const scrollRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  const effect = async () => {
    setIsLoading(true);
    let response = await fetch('http://82.146.37.120:8080/documents?period=1');
    let JSresponse = await response.json();
    news = [...JSresponse];
    setIsLoading(false);
    setPosts(prev => prev.concat(JSresponse.map(item=>({title : item.title,
      link : item.link,
      published : item.published,
      summary : item.summary,
      repost_cnt : item.repost_cnt,
      id : (Math.random() + 1).toString(36)
    })).slice(5 * offset, 5 * offset + 5)));
    setOffset(prev=>prev + 1);
  }

  const getNews = async ()=> {
    setIsLoading(true);
    setTimeout(()=>{
      setPosts(prev => prev.concat(news.map(item=>({title : item.title,
        link : item.link,
        published : item.published,
        summary : item.ds_insight.insight,
        repost_cnt : item.repost_cnt,
        id : (Math.random() + 1).toString(36)
      })).slice(5 * offset, 5 * offset + 5)));
      setOffset(prev=>prev + 1);
      setIsLoading(false);
    }, 2000);
    // setIsLoading(true);
    // let response = await fetch('http://82.146.37.120:8080/documents?period=1');
    // let JSresponse = await response.json();
    // setIsLoading(false);

    // setPosts(prev => prev.concat(JSresponse.map(item=>({title : item.title,
    //   link : item.link,
    //   published : item.published,
    //   summary : item.ds_insight.insight,
    //   repost_cnt : item.repost_cnt,
    //   id : (Math.random() + 1).toString(36)
    // })).slice(5 * offset, 5 * offset + 5)));
    // setOffset(prev=>prev + 1);
  };


  useEffect(()=>{
    effect();
  }, []);

  return (
    <IconComponentProvider IconComponent={MaterialCommunityIcons}>
    <View  style={{
        flex : 1,
        paddingTop : 30,
        backgroundColor : 'black',
        alignItems: 'center'}}>
            <FlatList
            onEndReached={getNews}
            scrollEnabled={filter !== null ? false : true}
            ref={scrollRef}
            contentContainerStyle={{
              justifyContent : 'flex-start',
              alignItems : 'center'
            }}
            data={posts}
              renderItem={({ item, index })=>(
                <Post scrollRef={scrollRef} setPosts={setPosts} posts={posts} setFilter={setFilter} item={item} filter={filter} key={item.id} index={index}/>
              )}/>
        {isLoading ? <ActivityIndicator size="large" style={{}}/> : null}
    </View>
    </IconComponentProvider>
  );
}
