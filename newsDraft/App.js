import { ScrollView, View, VirtualizedList, StatusBar, Dimensions} from 'react-native';
import { FlatList } from 'react-native-bidirectional-infinite-scroll'
import { IconComponentProvider } from "@react-native-material/core";
import { useRef, useState, useEffect, createRef, useLayoutEffect } from 'react';
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Post from './components/Post';
import { Text, ActivityIndicator } from 'react-native';

var news = [];
var newsRefs = new Map();
var windowHeight = Dimensions.get('window').height;
var topAddedNews;
var prevWasLoaded = false;

var heightToScroll = 0;

export default function App() {

  const [offset, setOffset] = useState(0);
  const [filter, setFilter] = useState(null);
  const [posts, setPosts] = useState([]);
  const scrollRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [blankHeight, setBlankHeight] = useState(0);
  const [enabled, setEnabled] = useState(true);

  const effect = async () => {
    // console.log('effect');
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
    setEnabled(false);
    setIsLoading(true);
    setTimeout(()=>{
      setPosts(prev => {
        prevWasLoaded = true;
        let shortenedPrev;
        shortenedPrev = prev.slice(0, prev.length - 5);
        // topAddedNews = news.slice(5 * (offset - 1), (5 * offset)).map(item=>item._id);
        prev.slice(prev.length - 5, ).forEach((item)=>{newsRefs.delete(item.id)})
        // console.log(offset)
        return news.slice(5 * (offset - 3), (5 * (offset - 2))).map(item=>({
          title : item.title,
          link : item.link,
          published : item.published,
          summary : item.ds_insight.insight,
          repost_cnt : item.repost_cnt,
          id : item._id
        })).concat(shortenedPrev);
      });
      setIsLoading(false);
      setOffset(prev=>prev - 1);
    }, 2000);
  }

  const getNewsNext = async ()=> {
    // console.log('Some amount of news was requested');
    setIsLoading(true);
    setTimeout(()=>{
      if (offset > 1) {
        // let totalDeletedHeight = posts.slice(1, 6).map(item=>(newsRefs.get(item.id))).reduce((a, b)=>(a + b));
        // setBlankHeight(prev=>prev + totalDeletedHeight + 35);
        posts.slice(0, 5).forEach(item=>{ newsRefs.delete(item.id) });
        heightToScroll = posts.slice(5, 10).map(item=>newsRefs.get(item.id)).reduce((a, b)=>(a + b)) - windowHeight + 35;
      }
      setPosts(prev => {
        let shortenedPrev;
        if (offset > 1) {
          shortenedPrev = prev.slice(5,);
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
    console.log('effect');
    if (offset == 0 && !posts.length) effect();
    if (heightToScroll) {
      console.log('scroll down')
      scrollRef.current.getNativeScrollRef().scrollTo({y : heightToScroll, animated : false});
      heightToScroll = 0;
    }
    // if (prevWasLoaded == true) {
    //   setBlankHeight(
    //     prev => prev - topAddedNews.map(id=>newsRefs.get(id)).reduce((a, b)=>(a + b))
    //   );
    //     prevWasLoaded = false;
    // }
    if (prevWasLoaded == true) {
      console.log('scroll top');
      //console.log(posts.slice(0, 4));
      // console.log(posts.slice(0, 5).map(item=>newsRefs.get(item.id)));
      let hh = posts.slice(0, 5).map(item=>newsRefs.get(item.id)).reduce((a, b)=>(a + b), 0) + 35;
      console.log(`scrolled by : ${hh}`);
      scrollRef.current.getNativeScrollRef().scrollTo({
        y : hh,
        animated : false
      });
      prevWasLoaded = false;
    }
    setEnabled(true);
    //console.log(offset);
  }, [posts]);

  return (
    <IconComponentProvider IconComponent={MaterialCommunityIcons}>
    <View
    pointerEvents={enabled ? 'auto' : 'none'}
    style={{
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
            keyExtractor={(item, index)=>{
              // if (index == 0) return 'top_blank';
              // else
              return item.id;
            }}
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
                if (e.nativeEvent.contentOffset.y + windowHeight + 1 >= e.nativeEvent.contentSize.height  && e.nativeEvent.velocity.y > 0) {
                  // console.log('reached');
                  setEnabled(false);
                  getNewsNext();
                }
                if (e.nativeEvent.contentOffset.y == 0 && e.nativeEvent.velocity.y < 0) {
                  // console.log('reached');
                  setEnabled(false);
                  getNewsPrev();
                }
                // else if (e.nativeEvent.contentOffset.y <= blankHeight && e.nativeEvent.velocity.y < 0) {
                //   console.log('opoopiegr');
                //   scrollRef.current.getNativeScrollRef().scrollTo({
                //     x : 0,
                //     y : blankHeight,
                //     animated : false
                //   });
                //   setEnabled(false);
                //   getNewsPrev();
                // }
              }
            }
            renderItem={({ item, index })=>{
              // if (item == 'blank') return <View style={{height : blankHeight}}/>
              // else
              return <Post
                scrollRef={scrollRef}
                setPosts={setPosts}
                posts={posts}
                setFilter={setFilter}
                item={item}
                filter={filter}
                index={index}
                onLayout={
                  (layout, __)=>{
                    console.log('prp');
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
