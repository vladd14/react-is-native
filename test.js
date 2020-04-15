const { transformVariables, transformStyles, transformMediaMax, transformColors, transformCustomFontIcons,
    getSvgPathsFromRequires } = require('./styles');
const {initImports, cutImport, findModule, deleteModuleImport} = require('./imports');

const {
    withRouterDelete, importNotRequired, historyToNavigationTransform, removeFormTags, addFlowTags,
    platformTransforms, changePlatform, createAppJs, removeFunctionCall, changeTagName, addScreenDimensionListener,
    replaceStyleAfterFlowFunction, addNavigationRoutePropIntoFlowFunction, removeTagsWithBody, replaceHtmlForWithFocus,
    changeNextTag, addRunAfterInteractionsWrapper,
} = require('./codeTransformations');

let mainApp = `
import React from 'react';
import { BrowserRouter as Navigation, Switch, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import './index.scss';
import Main from './apps/Main';

import { store } from './reducers';
import { urls } from './urls';

const App = () => {
    return (
        <Provider store={store}>
            <Navigation>
                <Switch>
                    <Route path={urls.person_app.path}>
                        <Main screen_name={'person_app'} />
                    </Route>
                    <Route path={urls.messenger_settings.path}>
                        <Main screen_name={'messenger_settings'} />
                    </Route>
                    <Route path={urls.login.path}>
                        <Main screen_name={'login'} />
                    </Route>
                    <Route path={urls.main.path}>
                        <Main screen_name={'main'} />
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
// findCloseModalTag(mainApp);
createAppJs(mainApp);

