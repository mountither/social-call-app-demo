import { createStackNavigator } from '@react-navigation/stack';
import React from 'react'
import SignIn from '../../screens/authentication/SignIn';
import SignUp from '../../screens/authentication/SignUp';


const {Screen, Navigator} = createStackNavigator();

const AuthStack = () => {
    return (
        <Navigator >
            <Screen 
                name="Sign In"
                component={SignIn}
                options={{headerShown: false}}
            />
              <Screen 
                name="Sign Up"
                options={{headerShown: false}}
                component={SignUp}
            />
        </Navigator>
    )
}

export default AuthStack
