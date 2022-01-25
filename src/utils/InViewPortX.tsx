import React, { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { View, ViewProps, Dimensions } from 'react-native';

type InViewPortXProps = {
    children: ReactNode,
    viewProps?: ViewProps,
    onChange: Function,
}

const InViewPortX = ({ children, viewProps, onChange }: InViewPortXProps) => {
    const viewRef = useRef<View>(null);

    const lastValue = useRef<boolean | undefined>(undefined)

    const [viewState, setViewState] = useState({
        rectTop: 0,
        rectBottom: 0,
        rectWidth: 0
    })

   
    // const usePrevious = (value : any) => {
    //     const ref = useRef();
    //     useEffect(() => {
    //         ref.prevLateVal = value;
    //     });
    //     return ref.prevLateVal;
    // }

    const isInViewPort = () => {
        const window = Dimensions.get('window')
        const isVisible =
            viewState.rectBottom != 0 &&
            viewState.rectTop >= 0 &&
            viewState.rectBottom <= window.height &&
            viewState.rectWidth > 0 &&
            viewState.rectWidth <= window.width
        if (lastValue.current !== isVisible) {
            console.log(isVisible);
            lastValue.current = isVisible
            onChange(isVisible)
        }
    }
    console.log(viewState.rectTop);

    useEffect(() => {
        //start playing
        const interval = setInterval(() => {
            if (!viewRef.current) return
    
            viewRef.current.measure((x, y, width, height, pageX, pageY) => {
                setViewState({
                    rectTop: pageY,
                    rectBottom: pageY + height,
                    rectWidth: pageX + width
                })
            })
            isInViewPort()
        }, 200)

        //stop playing
        return () => {
            clearInterval(interval)
            onChange(false)
        }

    }, [viewState.rectTop])

    return (
        <View
            collapsable={false}
            ref={viewRef}
            {...viewProps}
        >
            {children}
        </View>
    )
};

export default InViewPortX;
