import { ScrollView, View, VirtualizedList, StatusBar, Dimensions} from 'react-native';
import { FlatList } from 'react-native-bidirectional-infinite-scroll'
import { IconComponentProvider } from "@react-native-material/core";
import { useRef, useState, useEffect, createRef } from 'react';
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Post from './components/Post';
import { Text, ActivityIndicator } from 'react-native';

var news = [];
var newsRefs = new Map();
var windowHeight = Dimensions.get('window').height;
var prevWasLoaded = false;

export default function App() {

  const [offset, setOffset] = useState(0);
  const [filter, setFilter] = useState(null);
  const [posts, setPosts] = useState(['blank']);
  const scrollRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [blankHeight, setBlankHeight] = useState(0);

  const effect = async () => {
    setIsLoading(true);
    let response = await fetch('http://82.146.37.120:8080/documents?limit=50');
    let JSresponse = await response.json();
    news = [...JSresponse];

    setIsLoading(false);
    setPosts(prev => prev.concat(news.slice(5 * offset, 5 * offset + 5).map(item=>({title : item.title,
      link : item.link,
      published : item.published,
      summary : item.summary,
      repost_cnt : item.repost_cnt,
      id : item._id
    }))));
    setOffset(prev=>prev + 1);
  }

  const getNewsPrev = async () => {
    setIsLoading(true);
    setTimeout(()=>{
      setPosts(prev => {
        prevWasLoaded = true;
        let shortenedPrev;
        shortenedPrev = prev.slice(0, prev.length - 5);
        return news.slice(5 * (offset - 1), (5 * offset)).map(item=>({
          title : item.title,
          link : item.link,
          published : item.published,
          summary : item.ds_insight.insight,
          repost_cnt : item.repost_cnt,
          id : item._id
        })).concat(shortenedPrev);
      });
      setOffset(prev=>prev - 1);
      setIsLoading(false);
    }, 2000);
  }

  const getNewsNext = async ()=> {
    console.log('Some amount of news was requested');
    setIsLoading(true);
    setTimeout(()=>{
      if (offset > 1) {
        let totalDeletedHeight = posts.slice(1, 6).map(item=>(newsRefs.get(item.id))).reduce((a, b)=>(a + b));
        setBlankHeight(prev=>prev + totalDeletedHeight + 35);
      }
      setPosts(prev => {
        let shortenedPrev;
        if (offset > 1) {
          shortenedPrev = [prev[0]].concat(prev.slice(6,));
        }
        else shortenedPrev = prev;
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
      setOffset(prev=>prev + 1);
    }, 2000);
  };


  useEffect(()=>{
    if (offset == 0) effect();
    if (prevWasLoaded == true) {
      setBlankHeight(prev=>
        prev - newsRefs.slice(0, 5).reduce((a, b)=>(a + b)));
    }
    // if (offset > 1) scrollRef.current.scrollToOffset({
    //   offset : 0,
    //   animated : true
    // })
    // console.log(posts.length);
  }, [posts]);

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
            // onEndReached={getNewsNext}
            scrollEnabled={filter !== null ? false : true}
            ref={scrollRef}
            contentContainerStyle={{
              justifyContent : 'flex-start',
              alignItems : 'center'
            }}
            // getItemCount={(data)=>{return data.length}}
            // getItem={(data, index)=>(data[index])}
            data={posts}
            onScroll={
              (e)=>{
                if (e.nativeEvent.contentOffset.y + windowHeight + 1 >= e.nativeEvent.contentSize.height) {
                  console.log('reached');
                  getNewsNext();
                }
              }
            }
            renderItem={({ item, index })=>{
              // let itemRef = createRef();
              // if (!newsRefs.get(item.id)) newsRefs.set(item.id, itemRef);
              if (item == 'blank') return <View key='top_blank' style={{height : blankHeight}}/>
              else return <Post
                key={item.id}
                // ref={newsRefs.get(item.id)[0]}
                scrollRef={scrollRef}
                setPosts={setPosts}
                posts={posts}
                setFilter={setFilter}
                item={item}
                filter={filter}
                index={index}
                onLayout={
                  (layout, __)=>{
                    newsRefs.set(item.id, layout.nativeEvent.layout.height);
                  }
                }/>
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
