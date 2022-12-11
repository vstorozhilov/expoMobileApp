
import { IconButton } from "@react-native-material/core";
import { StyleSheet, Text, View, Animated} from 'react-native';
import { Pressable} from "@react-native-material/core";
import React, { useEffect, useRef, useState } from 'react';
import Icon from 'react-native-vector-icons/AntDesign';
import {CardAction, CardButton} from 'react-native-material-cards';
import { Dimensions, Linking } from 'react-native';
import { format } from "date-fns";

const Post = React.forwardRef((props, ref) => {

  const ownref = useRef(null);
  const ownheight = useRef(new Animated.Value(0)).current;
  const iconRotation = useRef(new Animated.Value(0)).current;
  const ownOpacity = useRef(new Animated.Value(0)).current;

  const onPressButton = (e)=>{
    if (props.filter !== props.index) { 
      Animated.timing(iconRotation,
        {
          toValue : -180,
          duration : 300,
          useNativeDriver: true
        }).start();
      Animated.timing(
        ownheight,
        {
          toValue : Dimensions.get('window').height - 178,
          duration: 300,
          useNativeDriver : false
        }
      ).start(()=>{
        props.setFilter(props.index);
      });
      ownref.current.measureLayout(props.scrollRef.current, (x, y)=>{
        props.scrollRef.current.scrollTo({y});
      });
    }
    else {
      Animated.timing(iconRotation,
        {
          toValue : 0,
          duration : 300,
          useNativeDriver: true
        }).start();
      Animated.timing(
        ownheight,
        {
          toValue : 0,
          duration: 300,
          useNativeDriver : false
        }
      ).start(()=>{
        props.setFilter(-2);
      });
    };
  }

  useEffect(()=>{
    Animated.timing(ownOpacity,
      {
        toValue : 1,
        duration : 500,
        useNativeDriver: true,
        delay: 500 * props.index
      }).start();
  }, []);

  return (
      <Animated.View ref={ownref} style={{...styles.nestedContainer,
          opacity : ownOpacity
        }}>
        <View style={{flex : 1}}>
        <View style={styles.titleContainer}>
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
            disabled={props.item.index === props.filter}
            onPress={()=>{
                props.setPosts(props.posts.filter(item=>{
                  return item.index !== props.item.index
                }));
                if (props.filter === props.item.index) {
                  props.setFilter(-2);
                }}
              }
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
    marginTop: 7,
    width: '90%',
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
