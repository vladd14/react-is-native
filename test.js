const { transformVariables, transformStyles, transformMediaMax, transformColors, transformCustomFontIcons,
    getSvgPathsFromRequires } = require('./styles');
const {initImports, cutImport, findModule, deleteModuleImport} = require('./imports');

const {
    exportConnectionTransform, importNotRequired, historyToNavigationTransform, removeFormTags, addFlowTags,
    platformTransforms, changePlatform, createAppJs, removeFunctionCall, changeTagName, addScreenDimensionListener,
    replaceStyleAfterFlowFunction, addNavigationRoutePropIntoFlowFunction, removeTagsWithBody, replaceHtmlForWithFocus
} = require('./codeTransformations');

let mainApp = `
import React from 'react';
import { BrowserRouter as Navigation, Switch, Route } from 'react-router-dom';
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
                    <Route path={urls.messenger_settings.path}>
                        <Main />
                    </Route>
                    <Route path={urls.login.path}>
                        <Login />
                    </Route>
                    <Route path={urls.main.path}>
                        <Main />
                    </Route>
                </Switch>
            </Navigation>
        </Provider>
    );
};

export default App;
`;

// transformVariables(variables);
// transformStyles(str);
// transformMediaMax(str, 'media');
// addScreenDimensionListener(mainApp);
// replaceStyleAfterFlowFunction(str);

// let str_3 = 'borderColor 1000 ease-in, backgroundColor 1000 ease-in';

// removeFormTags(mainApp, ['form']);
createAppJs(mainApp);

