import { ScrollView, View, VirtualizedList, StatusBar} from 'react-native';
import { FlatList } from 'react-native-bidirectional-infinite-scroll'
import { IconComponentProvider } from "@react-native-material/core";
import { useRef, useState, useEffect, createRef } from 'react';
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Post from './components/Post';
import { Text, ActivityIndicator } from 'react-native';

var news = [];
var newsRefs = new Map();

export default function App() {

  const [offset, setOffset] = useState(0);
  const [filter, setFilter] = useState(null);
  const [posts, setPosts] = useState([]);
  const scrollRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);

  const effect = async () => {
    setIsLoading(true);
    let response = await fetch('http://82.146.37.120:8080/documents?limit=50');
    let JSresponse = await response.json();
    news = [...JSresponse];
    news.slice(5 * offset, 5 * offset + 5).forEach(item=>{
      newsRefs.set(item._id, createRef());
    })
    setIsLoading(false);
    setPosts(prev => prev.concat(news.map(item=>({title : item.title,
      link : item.link,
      published : item.published,
      summary : item.summary,
      repost_cnt : item.repost_cnt,
      id : item._id
    })).slice(5 * offset, 5 * offset + 5)));
    setOffset(prev=>prev + 1);
  }

  const getNewsPrev = async () => {
    setIsLoading(true);
    setTimeout(()=>{

      // setPosts(prev => news.slice(5 * offset - 10, 5 * offset - 5)).map(item=>({title : item.title,
      //     link : item.link,
      //     published : item.published,
      //     summary : item.ds_insight.insight,
      //     repost_cnt : item.repost_cnt,
      //     id : (Math.random() + 1).toString(36)
      // }).concat())

      setPosts(prev => {
        let shortenedPrev;
        // if (offset > 1) shortenedPrev = prev.slice(5,);
        // else shortenedPrev = prev;
        shortenedPrev = prev;
        return shortenedPrev.concat(news.slice(5 * offset, 5 * offset + 5).map(item=>({
          title : item.title,
          link : item.link,
          published : item.published,
          summary : item.ds_insight.insight,
          repost_cnt : item.repost_cnt,
          id : item._id
        })));
      });
      setOffset(prev=>prev + 1);
      setIsLoading(false);
    }, 2000);
  }

  const getNewsNext = async ()=> {
    setIsLoading(true);
    setTimeout(()=>{
      // setPosts(prev => prev.concat(news.map(item=>({title : item.title,
      //   link : item.link,
      //   published : item.published,
      //   summary : item.ds_insight.insight,
      //   repost_cnt : item.repost_cnt,
      //   id : (Math.random() + 1).toString(36)
      // })).slice(5 * offset, 5 * offset + 5)));

      setPosts(prev => {
        let shortenedPrev;
        // if (offset > 1) shortenedPrev = prev.slice(1,);
        // else shortenedPrev = prev;
        // let shortenedPrev = prev.slice(5,);
        shortenedPrev = prev;
        news.slice(5 * offset, 5 * offset + 5).forEach((item)=>{
          newsRefs.set(item._id, createRef());
        })
        return shortenedPrev.concat(news.slice(5 * offset, 5 * offset + 5).map(item=>({
          title : item.title,
          link : item.link,
          published : item.published,
          summary : item.ds_insight.insight,
          repost_cnt : item.repost_cnt,
          id : item._id
        })));
      });
      setIsLoading(false);
      // if (offset > 1) scrollRef.current.scrollToIndex({index : 5, animated : false})
      setOffset(prev=>prev + 1);
      console.log(posts.length);
      // console.log(newsRefs);
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
    if (offset == 0) effect();
    // if (offset > 1) scrollRef.current.scrollToOffset({
    //   offset : 0,
    //   animated : true
    // })
    console.log(posts.length);
  }, []);

  return (
    <IconComponentProvider IconComponent={MaterialCommunityIcons}>
    <View  style={{
        flex : 1,
        justifyContent : 'center',
        backgroundColor : 'black'}}>
          {/* <View style={{
            height : 500,
            backgroundColor : 'yellow'
          }}>
            <ScrollView style={{
              flex : 1,
              backgroundColor : 'yellow'
            }}>
              <View style={{
                height: 100000,
                backgroundColor : 'red'
              }}>
              </View>
            </ScrollView>
          </View> */}
            <FlatList
            initialNumToRender={30}
            refreshing
            keyExtractor={item=>item.id}
            onEndReached={getNewsNext}
            scrollEnabled={filter !== null ? false : true}
            ref={scrollRef}
            contentContainerStyle={{
              justifyContent : 'flex-start',
              alignItems : 'center'
            }}
            // getItemCount={(data)=>{return data.length}}
            // getItem={(data, index)=>(data[index])}
            data={posts}
            renderItem={({ item, index })=>{
              // let itemRef = createRef();
              // if (!newsRefs.get(item.id)) newsRefs.set(item.id, itemRef);
              return <Post key={item.id} ref={newsRefs.get(item.id)} scrollRef={scrollRef} setPosts={setPosts} posts={posts} setFilter={setFilter} item={item} filter={filter} index={index}/>
            }}
            FooterLoadingIndicator={()=>
              <ActivityIndicator size="large" style={{}}/>
            }
            />
        {isLoading ? <ActivityIndicator size="large" style={{}}/> : null}
    </View>
    </IconComponentProvider>
  );
}
