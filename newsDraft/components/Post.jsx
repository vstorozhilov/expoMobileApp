
import { IconButton } from "@react-native-material/core";
import { StyleSheet, Text, View, Animated} from 'react-native';
import { Pressable} from "@react-native-material/core";
import React, { useEffect, useRef, useState } from 'react';
import Icon from 'react-native-vector-icons/AntDesign';
import {CardAction, CardButton} from 'react-native-material-cards';
import { Dimensions, Linking, LayoutAnimation } from 'react-native';
import { format } from "date-fns";

const Post = React.forwardRef((props, ref) => {

  const ownref = useRef()
  const titleContainerRef = useRef(null);
  const ownheight = useRef(new Animated.Value(0)).current;
  const iconRotation = useRef(new Animated.Value(0)).current;
  const ownOpacity = useRef(new Animated.Value(1)).current;
  const [isExist, setIsExist] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  const onPressButton = (e)=>{
    if (!isExpanded) {
      Animated.timing(iconRotation,
        {
          toValue : -180,
          duration : 300,
          useNativeDriver: true
        }).start();
      LayoutAnimation.configureNext({
        duration : 300,
        update: {type : 'linear'}
      });
      setIsExpanded(true);
      props.setFilter(props.item.id);
      setTimeout(()=>ownref.current.measureLayout(props.scrollRef.current.getNativeScrollRef(), (x, y)=>{
        props.scrollRef.current.getNativeScrollRef().scrollTo({y});
      }), 300);
    }
    else {
      Animated.timing(iconRotation,
        {
          toValue : 0,
          duration : 300,
          useNativeDriver: true
        }).start();
      // Animated.timing(
      //   ownheight,
      //   {
      //     toValue : 0,
      //     duration: 300,
      //     useNativeDriver : false
      //   }
      // ).start(()=>{
      //   props.setFilter(null);
      // });
      LayoutAnimation.configureNext({
        duration : 300,
        update: {type : 'linear'}
      });
      setIsExpanded(false);
      props.setFilter(null)
    };
  }

  // useEffect(()=>{
  //   Animated.timing(ownOpacity,
  //     {
  //       toValue : 1,
  //       duration : 500,
  //       useNativeDriver: true,
  //       delay: (props.posts.length > 6 ? 0 : 500 * props.index)
  //     }).start();
  // }, []);

  return (
      <Animated.View onLayout={props.onLayout} ref={ownref} style={{...styles.nestedContainer,
          opacity : ownOpacity,
          height : isExist ? (isExpanded ? Dimensions.get('window').height - 35 : undefined ) : 0,
          marginBottom : isExist ? 7 : 0,
        }}>
        <View>
        <View ref={titleContainerRef} style={styles.titleContainer}>
          <IconButton
          onPress={async()=>{await Linking.openURL(props.item.link);}}
              style={{
              backgroundColor : 'blue',
              borderRadius : 10
            }}
            icon={props => <Icon name="export" {...props} />}
            color="white"
          />
          <Text style={{
          flex : 1,
          color : 'white',
          fontSize : 15,
          paddingLeft: 10}}>{props.item.title}</Text>
        </View>
        <View style={styles.mainContainer}>
          <View style={{flexDirection : 'row'}}>
            <Text style={{color : 'white', marginRight : 10}}>{format(new Date(props.item.published), "dd.MM.yy")}</Text>
            <Text style={{color : 'yellow'}}>{props.item.link.split('/')[2]}</Text>
          </View>
          <Pressable onPress={onPressButton}
          pressEffect="ripple"
          pressEffectColor='white'>
          <Animated.View style={{
            transform : [{rotateZ :
              iconRotation.interpolate(
                {
                  inputRange: [-180, 0],
                  outputRange: ['-180deg', '0deg']
                }
              )}],
            borderRadius : 15
          }}>
            <Icon color="white"size={30}  name="down"/>
          </Animated.View>
          </Pressable>
        </View>
        <Animated.ScrollView style={{height : ownheight}}>
            <Text style={{
                color : 'white',
                textAlign : 'justify',
                padding : 10
              }}>
              {props.item.summary} 
              </Text>
        </Animated.ScrollView>
        </View>
        <View>
        <CardAction
          inColumn={false}>
            <IconButton
            disabled={props.item.id === props.filter}
            onPress={()=>{
                LayoutAnimation.configureNext({
                  duration : 500,
                  update: {type : 'linear'}
                });
                setIsExist(false);
                setTimeout(()=>{
                  props.setPosts(props.posts.filter(item=>{
                    return item.id !== props.item.id
                  }));
                  if (props.filter === props.item.id) {
                    props.setFilter(null);
                  }}, 500);
              }}
            style={{
                margin : 5,
                transform : [{
                  scaleX : -1
                }
                ]}}
              icon={props => <Icon  name="dislike1" {...props} />}
              color="white"
            />
        </CardAction>
        </View>
      </Animated.View>
  );
});

const styles = StyleSheet.create({
  nestedContainer: {
    width : Dimensions.get('window').width - 20,
    backgroundColor: '#1f1f1f',
    justifyContent: 'space-between',
    borderRadius: 25
  },
  titleContainer : {
    paddingLeft : 15,
    paddingTop: 10,
    flexDirection : 'row',
    alignItems: 'center',
    color : 'white'
  },
  mainContainer : {
    color : '#ffffff',
    paddingLeft : 15,
    paddingRight : 15,
    width : '100%',
    flexDirection : 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
});

export default Post;
