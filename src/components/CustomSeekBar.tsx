import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    PanResponder,
    Animated,
    Dimensions,
    GestureResponderEvent,
} from 'react-native';

interface CustomSeekBarProps {
    value: number;
    duration: number;
    onSeek: (value: number) => void;
    onSlidingStart?: () => void;
    onSlidingComplete?: (value: number) => void;
}

export const CustomSeekBar: React.FC<CustomSeekBarProps> = ({
    value,
    duration,
    onSeek,
    onSlidingStart,
    onSlidingComplete,
}) => {
    const [width, setWidth] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [dragValue, setDragValue] = useState(0);

    // Use dragValue while dragging, otherwise use prop value
    const displayValue = isDragging ? dragValue : value;

    const getPercentage = () => {
        if (duration > 0) {
            return Math.min(Math.max(displayValue / duration, 0), 1);
        }
        return 0;
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt, gestureState) => {
                setIsDragging(true);
                onSlidingStart?.();
                // Calculate initial drag value but don't seek yet
                const percentage = Math.max(0, Math.min(1, evt.nativeEvent.locationX / width));
                setDragValue(percentage * duration);
            },
            onPanResponderMove: (evt, gestureState) => {
                handleTouch(evt.nativeEvent.locationX);
            },
            onPanResponderRelease: (evt, gestureState) => {
                const finalValue = handleTouch(evt.nativeEvent.locationX, true);
                setIsDragging(false);
                if (finalValue !== null) {
                    onSeek(finalValue);
                    onSlidingComplete?.(finalValue);
                }
            },
            onPanResponderTerminate: () => {
                setIsDragging(false);
            },
        })
    ).current;

    const handleTouch = (locationX: number, isRelease: boolean = false): number | null => {
        if (width > 0 && duration > 0) {
            const percentage = Math.max(0, Math.min(1, locationX / width));
            const newValue = percentage * duration;

            setDragValue(newValue);
            return newValue;
        }
        return null;
    };

    const percent = getPercentage() * 100;

    return (
        <View
            style={styles.container}
            onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
            {...panResponder.panHandlers}
        >
            <View style={styles.trackContainer} pointerEvents="none">
                <View style={styles.track} />
                <View style={[styles.fill, { width: `${percent}%` }]} />
                <View style={[styles.thumb, { left: `${percent}%` }]} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 60,
        justifyContent: 'center',
        backgroundColor: 'transparent', // Capture touches
    },
    trackContainer: {
        height: 4,
        width: '100%',
        justifyContent: 'center',
    },
    track: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 2,
    },
    fill: {
        height: '100%',
        backgroundColor: '#ff6b6b',
        borderRadius: 2,
    },
    thumb: {
        position: 'absolute',
        width: 16,
        height: 16,
        backgroundColor: 'white',
        borderRadius: 8,
        top: -6,
        marginLeft: -8, // Center thumb
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
});
