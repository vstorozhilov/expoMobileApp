import { View, ScrollView, Animated, LayoutAnimation, FlatList} from 'react-native';
import { Button, IconComponentProvider } from "@react-native-material/core";
import { useRef, useState, useEffect } from 'react';
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Post from './components/Post';
import { Text } from 'react-native';

// var previousFilterValue = -1;
// export var postRefs = null;
// export var heights = null;

// export function updateCredentials(forwardedIndex) {
//   postRefs  = postRefs.filter((__, index)=>(index!==forwardedIndex))
//   heights  = heights.filter((__, index)=>(index!==forwardedIndex))
// }

export default function App() {

  const [filter, setFilter] = useState(null);
  const [posts, setPosts] = useState([]);
  const scrollRef = useRef(null);


  const getNews = async ()=> {
    let response = await fetch('http://82.146.37.120:8080/documents?period=24');
    let JSresponse = await response.json();

   // let result = [];
   // for (let x = 0; x < JSresponse.length; x++) {
   //   if (x) {
   //       if (JSresponse[x].title != JSresponse[x-1].title) {
   //           result.push(JSresponse[x]);
   //       }
   //   }
   // }

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

  // let heights = Object.fromEntries(zip([posts, posts.map(()=>(useRef(new Animated.Value(0)).current))]));
  // let postRefs = Object.fromEntries(zip([posts, posts.map(()=>(useRef(null)))]));
  // let heights = posts.map(()=>(useRef(new Animated.Value(0)).current));
  // let postRefs = posts.map(()=>(useRef(null)));
  // console.log(postRefs);
  //const [currentScroll, setCurrentScroll] = useState(0);
  //const [animation, setAnimation] = useState(new Animated.Value(0));
  //const animation = useRef(new Animated.Value(0, {useNativeDriver : false})).current;
  // const boxInterpolation =  animation.interpolate({
  //   inputRange: [0, 1],
  //   outputRange:["red" , "blue"]
  // })
  // const transitions = useTransition(posts, {
  //   from: { opacity: 0 },
  //   enter: { opacity: 1 },
  //   leave: { opacity: 0 },
  //   delay: 200,
  // });

  // console.log(transitions[0])

  // useEffect(()=>{
  //   if (filter > -1) {
  //     previousFilterValue = filter;
  //     postRefs[filter].current.measureLayout(scrollRef.current, (x, y)=>{
  //       scrollRef.current.scrollTo({y});
  //     })
  //     Animated.timing(
  //       heights[filter],
  //       {
  //         toValue : Dimensions.get('window').height - 200,
  //         duration: 300,
  //         useNativeDriver : false
  //       }
  //     ).start();
  //   }
  //   if (filter ==  -2) {
  //     Animated.timing(
  //       heights[previousFilterValue],
  //       {
  //         toValue : 0,
  //         duration: 300,
  //         useNativeDriver : false
  //       }
  //     ).start();
  //   }
  // }, [filter]);

  // const onPressButton = (e)=>{
  //   console.log(e.nativeEvent.layout)
  //   setIsCollapsed(!isCollapsed);
  // }

  // const scrollHandler = (event)=>{
  //   currentScrollTop = event.nativeEvent.contentOffset['y'];
  // }

  return (
    <IconComponentProvider IconComponent={MaterialCommunityIcons}>
    <View  style={{
        paddingTop : 30,
        flex : 1,
        backgroundColor : 'black'}}>
      <ScrollView scrollEnabled={filter !== null ? false : true} ref={scrollRef} contentContainerStyle={{
        justifyContent : 'flex-start',
        alignItems : 'center',
        backgroundColor : 'black'
      }}>
        {posts.length ? posts.map((item)=>(
          <Post scrollRef={scrollRef} setPosts={setPosts} posts={posts} setFilter={setFilter} item={item} filter={filter} key={item.id}/>
        )) :
         <Text style={{paddingTop: 100, fontSize : 15, color : 'white'}}>Пожалуйста, подождите. Новости уже загружаются</Text>}
      </ScrollView>
    </View>
    </IconComponentProvider>
  );
}

// const styles = StyleSheet.create({
//   // container: {
//   //   flex : 1,
//   //   // width: '100%',
//   //   // height: '100%',
//   //   backgroundColor: '#000000',
//   //   justifyContent: 'flex-start',
//   //   alignItems: 'center'
//   // },
//   nestedContainer: {

//     //flex : 1,
//     //height : '100%',
//     //maxHeight: '100%',
//     //flexBasis : 30,
//     marginTop: 30,
//     width: '90%',
//     backgroundColor: '#1f1f1f',
//     //alignItems: 'center',
//     justifyContent: 'space-between',
//     borderRadius: 25
//   },
//   titleContainer : {
//     paddingLeft : 15,
//     paddingTop: 10,
//     flexDirection : 'row',
//     alignItems: 'center',
//     color : 'white'
//     //flexDirection: 'row',
//   },
//   mainContainer : {
//     color : '#ffffff',
//     paddingLeft : 15,
//     paddingRight : 15,
//     //flex : 1,
//     width : '100%',
//     flexDirection : 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center'
//   }
// });
