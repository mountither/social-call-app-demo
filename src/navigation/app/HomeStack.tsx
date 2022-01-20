import { createStackNavigator } from '@react-navigation/stack';
import React from 'react'
import Topics from '../../screens/home/Topics';


const {Screen, Navigator} = createStackNavigator();

const HomeStack = () => {
    return (
        <Navigator>
            <Screen 
                name="Topics"
                options={{headerShown: false}}
                component={Topics}
            />
        </Navigator>
    )
}

export default HomeStack
