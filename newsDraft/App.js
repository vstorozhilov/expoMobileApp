import { ScrollView, View, VirtualizedList, StatusBar, Dimensions, Pressable, Text, FlatList, UIManager} from 'react-native';
import { IconComponentProvider } from "@react-native-material/core";
import { useRef, useState, useEffect, createRef, useLayoutEffect } from 'react';
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Post from './components/Post';
import { ActivityIndicator } from 'react-native';

// remove before move into production (icons could be saved by built app package)
import * as Font from 'expo-font';
import Icon from 'react-native-vector-icons/AntDesign';

var reference_id = null;
var newsHeights = new Map();
var windowHeight = Dimensions.get('window').height;
var prevWasLoaded = false;
var nextWasLoaded = false;
var heightToScroll = 0;
var bunchSize = 10;
var offset = 0;

export default function App() {

  const [posts, setPosts] = useState([]);
  const scrollRef = useRef(null);
  const [isNextLoading, setIsNextLoading] = useState(false);
  const [isPrevLoading, setIsPrevLoading] = useState(false);
  const [enabled, setEnabled] = useState(true);

  const getFirstNewsBunch = async () => {
    setEnabled(false);
    setIsNextLoading(true);

    // remove before move into production (icons could be saved by built app package)
    await Font.loadAsync(Icon.font);

    let response = await fetch(`http://82.146.37.120:8080/documents?limit=${bunchSize}`);
    let json = await response.json();
    reference_id = json[0]['_id']


    setIsNextLoading(false);

    if (json.length == bunchSize) {
      setPosts(prev => prev.concat(json.map(item=>({title : item.title,
        link : item.link,
        published : item.published,
        summary : item.summary,
        repost_cnt : item.repost_cnt,
        id : item._id
      }))));
      offset++;
    }
  }

  const getNewsPrev = async () => {
    setEnabled(false);
    setIsPrevLoading(true);
    // checks if a callback for newer news was called very first
    let response = await fetch(`http://82.146.37.120:8080/documents?offset=${Math.abs(posts.length == bunchSize ? 0 : offset - 3) * bunchSize}&limit=${bunchSize}&reference_id=${reference_id}&newer=${(posts.length == bunchSize ? true : offset < 3) ? true : false}`);
    let json = await response.json();
    setIsPrevLoading(false);
    if (json.length == bunchSize) {
      prevWasLoaded = true;
      setPosts(prev => {
        // checks if a callback for newer news was called very first
        if (prev.length == 2 * bunchSize) {
          prev.slice(prev.length - bunchSize, ).forEach((item)=>{newsHeights.delete(item.id)})
          prev = prev.slice(0, prev.length - bunchSize);
          offset--;
        }
        return json.map(item=>({
          title : item.title,
          link : item.link,
          published : item.published,
          summary : item.summary,
          repost_cnt : item.repost_cnt,
          id : item._id
        })).concat(prev);
      });
    }
    else {
      setEnabled(true);
    }
  }

  const getNewsNext = async ()=> {
    setIsNextLoading(true);
    setEnabled(false);

    let response = await fetch(`http://82.146.37.120:8080/documents?offset=${Math.abs(offset) * bunchSize}&limit=${bunchSize}&reference_id=${reference_id}&newer=${offset < 0 ? true : false}`);
    let json = await response.json();
    setIsNextLoading(false);

    if (json.length == bunchSize) {
      if (posts.length == 2 * bunchSize) {
        nextWasLoaded = true;
        posts.slice(0, bunchSize).forEach(item=>{ newsHeights.delete(item.id) });
        heightToScroll = posts.slice(bunchSize, 2 * bunchSize).map(item=>newsHeights.get(item.id)).reduce((a, b)=>{if (b > 0) b += 7; return a + b;}, 0) - windowHeight + 2 * 67;
      }
      setPosts(prev => {
        if (posts.length == 2 * bunchSize) {
          prev = prev.slice(bunchSize,);
        }
        return prev.concat(json.map(item=>({
          title : item.title,
          link : item.link,
          published : item.published,
          summary : item.summary,
          repost_cnt : item.repost_cnt,
          id : item._id
        })))});
      offset++;
    }
    else {
      setEnabled(true);
    }
  };

  useEffect(()=>{
    // console.log(newsHeights);
    if (!posts.length) {
      getFirstNewsBunch();
    }
    if (nextWasLoaded) {
      // console.log('scroll down')
      scrollRef.current.scrollToOffset({offset : heightToScroll, animated : false});
      heightToScroll = 0;
      nextWasLoaded = false;
    }
    if (prevWasLoaded) {
      scrollRef.current.scrollToOffset({offset : bunchSize * (154 + 7), animated : false});
      prevWasLoaded = false;
    }
    setEnabled(true);
  }, [posts]);

  const FlatList_Header = () => {
    return (
      <Pressable style={{
        borderRadius: 25,
        height: 60,
        width: Dimensions.get('window').width - 20,
        backgroundColor: '#1f1f1f',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 7
      }}
      onPress={
          ()=>{
            setEnabled(false);
            getNewsPrev()
          }
        }>
        {isPrevLoading ? <ActivityIndicator size="large" style={{}}/> :
        <Text style={{ fontSize: 15, color: 'white' }}> Загрузить более новые </Text>}
      </Pressable>
    );
  }

  const FlatList_Footer = () => {
    return (
      <Pressable style={{
        borderRadius: 25,
        height: 60,
        width: Dimensions.get('window').width - 20,
        backgroundColor: '#1f1f1f',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 7
      }}
      onPress={
          ()=>{
            setEnabled(false);
            getNewsNext()
          }
        }>
        {isNextLoading ? <ActivityIndicator size="large" style={{}}/> :
        <Text style={{ fontSize: 15, color: 'white' }}> Загрузить более старые </Text>}
      </Pressable>
    );
  }

  return (
    <IconComponentProvider IconComponent={MaterialCommunityIcons}>
    <View
    pointerEvents={enabled ? 'auto' : 'none'}
    style={{
        flex : 1,
        justifyContent : 'center',
        backgroundColor : 'black'}}>
            <FlatList
            ListHeaderComponent={
              FlatList_Header
            }
            ListFooterComponent={
              FlatList_Footer
            }
            keyExtractor={(item, index)=>{
              return item.id;
            }}
            ref={scrollRef}
            contentContainerStyle={{
              justifyContent : 'flex-start',
              alignItems : 'center'
            }}
            data={posts}
            onScrollToIndexFailed={info => {
              scrollRef.current.scrollToIndex({index : bunchSize - 2,
                animated : false,
                viewPosition : 1})
            }}
            renderItem={({ item, index })=>{
              return <Post
                bunchSize={bunchSize}
                scrollRef={scrollRef}
                setPosts={setPosts}
                newsHeights={newsHeights}
                item={item}
                index={index}
                onLayout={
                  (layout, __)=>{
                    newsHeights.set(item.id, layout.nativeEvent.layout.height);
                  }
                }/>
            }}
            />
    </View>
    </IconComponentProvider>
  );
}
