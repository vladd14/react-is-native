const { transformVariables, transformStyles, transformMediaMax, transformColors } = require('./styles');
const {initImports, cutImport, findModule, deleteModuleImport} = require('./imports');

const {
    exportConnectionTransform, importNotRequired, historyToNavigationTransform, removeFormTags, addFlowTags,
    platformTransforms, changePlatform, createAppJs, removeFunctionCall, changeTagName, addScreenDimensionListener,
    replaceStyleAfterFlowFunction, addNavigationRoutePropIntoFlowFunction, removeTagsWithBody
} = require('./codeTransformations');

let mainApp = `

import React from 'react';
import {
    BrowserRouter as Navigation,
    Switch,
    Route
} from 'react-router-dom';
import { Provider } from 'react-redux';
import './index.scss';
import Login from './apps/Login';
import Main from './apps/Main';

import store from './store';
import { urls } from './urls';

const App = () => {
    return (
        <Provider store={store}>
            <Navigation>
                <Switch>
                    <Route path={urls.login.path}>
                        <Login/>
                    </Route>
                    <Route path={urls.main.path}>
                        <Main/>
                    </Route>
                </Switch>
            </Navigation>
        </Provider>
    );
};

export default App;

`;

const needs = `

const Stack = createNativeStackNavigator();

const App: () => React$Node = () => {
    enableScreens();
    return (
        <Provider store={store}>
            <NavigationNativeContainer>
                <Stack.Navigator
                    initialRouteName={'main'}
                    screenOptions={({ ...props }) => ({
                        headerTintColor: colors.brand_color,
                        headerTranslucent: true,
                        headerRight: () => <PageHeader {...props} />,
                    })}>
                    <Stack.Screen name={'main'} component={Main} />
                    <Stack.Screen name={'login'} component={Login} />
                </Stack.Navigator>
            </NavigationNativeContainer>
        </Provider>
    );
};

`;

// transformVariables(variables);
// transformStyles(str);
// transformMediaMax(str, 'media');
// addScreenDimensionListener(mainApp);
// replaceStyleAfterFlowFunction(str);

// let str_3 = 'borderColor 1000 ease-in, backgroundColor 1000 ease-in';

// removeFormTags(mainApp, ['form']);
createAppJs(mainApp);

