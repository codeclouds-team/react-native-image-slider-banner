import React, { useEffect, useState, useRef} from 'react'
import { View, Image, BackHandler, Dimensions, Modal, StyleSheet, Animated, Platform, TouchableOpacity, ImageBackground} from 'react-native'
import Icon from 'react-native-vector-icons/Ionicons'
import { Indicator } from './indicator'
import { SliderHeader } from './sliderHeader'
import { styles } from './style'

const width = Dimensions.get('screen').width
const height = Dimensions.get('screen').height
let dynamicWidth = width-20;
let changeSliderListIndexByArrow;
const Os = Platform.OS
export const ImageSlider = ({
    data  = [
        {img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5a5uCP-n4teeW2SApcIqUrcQApev8ZVCJkA&usqp=CAU'},
        {img: 'https://thumbs.dreamstime.com/b/environment-earth-day-hands-trees-growing-seedlings-bokeh-green-background-female-hand-holding-tree-nature-field-gra-130247647.jpg'},
        {img: 'https://cdn.pixabay.com/photo/2015/04/19/08/32/marguerite-729510__340.jpg'}
       ],
    showHeader = false,
    headerRightComponent = null,
    headerLeftComponent = null,
    headerCenterComponent = null,
    headerStyle={},
    previewImageContainerStyle={},
    previewImageStyle={},
    caroselImageStyle={},
    caroselImageContainerStyle={},
    timer=2000,
    autoPlay=false,
    showIndicator=true,
    activeIndicatorStyle={},
    inActiveIndicatorStyle={},
    indicatorContainerStyle={},
    onItemChanged=(itemData) => { console.log(itemData) },
    localImg= false,
    onClick=null,
    children,
    closeIconColor="#000",
    blurRadius=50
}) => {
    const scrollX = React.useRef(new Animated.Value(0)).current
    const imageW = width * 0.7;
    const imageH = imageW * 1.54;
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [imageViewer, setImageViewer] = useState(false)
    const [currentIndex, setCurrentIndex] = useState(0)
    slider = useRef(null)

    const onViewRef = React.useRef(({viewableItems})=> {
        // Use viewable items in state or as intended
        if(viewableItems.length > 0) {
            let index = viewableItems[0].index
            onItemChanged(viewableItems[0].item)
            //dynamicWidth= (width-20) + index*20;
            
            console.log('HERE',index,dynamicWidth);
            setSelectedIndex(index)
        }
    })
    const viewConfigRef = React.useRef({ viewAreaCoveragePercentThreshold: 50 })

    useEffect(() => {
        if(autoPlay) {
            startAutoPlay()
        }
    }, []);

    useEffect(() => {
        if(!imageViewer) {
            if(autoPlay) {
                startAutoPlay()
            }
        }
    }, [currentIndex, imageViewer]);

    const changeSliderListIndex = () => {
        //console.log('yaha',slider.current);
        if (slider.current) {
            if(currentIndex == data.length - 1) {
                setCurrentIndex(0)
                slider.current.scrollToIndex({
                    index: currentIndex,
                    animated: true,
                  });
            }else {
                setCurrentIndex(currentIndex+1)
                slider.current.scrollToIndex({
                  index: currentIndex,
                  animated: true,
                });
            }
        }
      };

      changeSliderListIndexByArrow = (direction) => {
        //console.log('yaha',slider.current);
        if (slider.current) {
            let newIndex = 0;
            if(direction === 'left')
            {
                newIndex = (currentIndex === 0)?(data.length-1):(currentIndex-1)
            }
            else
            {
                newIndex = (currentIndex === data.length-1)?0:currentIndex+1
            }
            setCurrentIndex(newIndex);    
            console.log('current Index',currentIndex)
                slider.current.scrollToIndex({
                  index: newIndex,
                  animated: true,
                });
            }
        
      };
    
    const startAutoPlay = () => {
        if(!imageViewer) {
            setTimeout(() => {
                changeSliderListIndex()
            }, timer)
        }
      };
    
    const previewImage = () => {
        return (
            <Modal
                visible={imageViewer}
                onDismiss={() => setImageViewer(!imageViewer)}
                onRequestClose={() => setImageViewer(!imageViewer)}
            >
                    <View style={StyleSheet.absoluteFillObject}>
                        {data.map((val, ind) => {
                            const inputRange = [
                                (ind - 1) * width,
                                ind * width,
                                (ind + 1) * width,
                            ]
                            const opacity = scrollX.interpolate({
                                inputRange,
                                outputRange: [0, 1, 0]
                            })
                            return (
                                <Animated.Image 
                                    key={`image-${ind}`}
                                    source={localImg ? val.img : {uri: val.img}}
                                    style={[StyleSheet.absoluteFillObject, {opacity}]}
                                    blurRadius={blurRadius}
                                    
                                />
                            )
                        })}
                    </View>

                    <Animated.FlatList 
                        data={data}
                        keyExtractor={(_, index) => index.toString()}
                        onScroll={Animated.event(
                            [{nativeEvent: {contentOffset: {x: scrollX}}}],
                            {useNativeDriver: true}
                        )}
                        ListEmptyComponent
                        horizontal
                        pagingEnabled
                        initialScrollIndex={selectedIndex}  
                        pinchGestureEnabled={true}
                        onScrollToIndexFailed={info => {
                            const wait = new Promise(resolve => setTimeout(resolve, 500));
                            wait.then(() => {
                                slider.current?.scrollToIndex({ index: info.index, animated: true });
                            });
                        }}
                        showsHorizontalScrollIndicator={false}
                        renderItem={({item, index}) => {
                            return (
                                <View
                                style={[styles.previewImageContainerStyle, previewImageContainerStyle]}>
                                    <TouchableOpacity onPress={() => {        
                                            console.log(setSelectedIndex, index);                                    
                                            setSelectedIndex(index)
                                            //setImageViewer(!imageViewer)
                                        }} style={{position:'absolute', top: Os == "ios" ? 30 : 5 , left: 5}}>
                                        <Icon onPress={() => setImageViewer(!imageViewer)} name="close" size={34} color={closeIconColor} />
                                    </TouchableOpacity>
                                    <Image 
                                        source={localImg ? item.img : {uri: item.img}}
                                        style={[styles.previewImageStyle, previewImageStyle]}
                                    />
                                </View>
                            )
                        }}
                    /> 
            </Modal>

        )
    }
    return(
        <View>
            {imageViewer && previewImage()}
            <Animated.FlatList 
                ref={slider}
                data={data}
                keyExtractor={(_, index) => index.toString()}
                onScroll={Animated.event(
                    [{nativeEvent: {contentOffset: {x: scrollX}}}],
                    {useNativeDriver: true,
                    listener: event => {
                            const offsetX = event.nativeEvent.contentOffset.x
                            //console.log('Mylistner',offsetX);
                            
                    },
                    }
                )}
                //onScrollEndDrag={()=>{ console.log(dynamicWidth); }}
                horizontal
                pagingEnabled
                snapToInterval={dynamicWidth}
                decelerationRate="fast"
                pinchGestureEnabled={true}
                showsHorizontalScrollIndicator={false}
                onViewableItemsChanged={onViewRef.current}
                viewabilityConfig={viewConfigRef.current}
                initialScrollIndex={selectedIndex}  
                onScrollToIndexFailed={info => {
                    const wait = new Promise(resolve => setTimeout(resolve, 500));
                    wait.then(() => {
                    flatList.current?.scrollToIndex({ index: info.index, animated: true });
                    });
                }}
                renderItem={({item, index}) => {

                    const dynamicPadd = (index === data.length-1)?10:0;

                    return (
                        <View style={[caroselImageContainerStyle, { marginLeft:10, width:width-30, marginRight:dynamicPadd,zIndex: 99000 }]}>
                            <TouchableOpacity
                            activeOpacity={.9}
                            onPress={() => {
                                if(onClick) {
                                    onClick(item, index)
                                }else {
                                    console.log('index', index);
                                    setSelectedIndex(index)
                                    //setImageViewer(!imageViewer)
                                }
                            }}
                        >    
                                <ImageBackground
                                    source={localImg ? item.img : {uri: item.img}}
                                    style={[styles.caroselImageStyle, caroselImageStyle, { width:  width-30 }]}
                                >
                                    {showHeader && <SliderHeader headerStyle={headerStyle} rightComponent={headerRightComponent} leftComponent={headerLeftComponent} centerComponent={headerCenterComponent}/>}
                                </ImageBackground>
                            </TouchableOpacity>
                            {children}
                        </View>
                    )
                }}
            /> 
            <View style={{flex: 1, position: 'absolute', bottom: 20, alignSelf: 'center'}}>
                {showIndicator && 
                <Indicator 
                    data={data} 
                    currenIndex={selectedIndex} 
                    indicatorContainerStyle={indicatorContainerStyle}
                    activeIndicatorStyle={activeIndicatorStyle}
                    inActiveIndicatorStyle={inActiveIndicatorStyle}
                    />}
            </View>
        </View>
    )
}

export const changeSlide = (direction) => {
    console.log('CALLED******');
    changeSliderListIndexByArrow(direction)
}