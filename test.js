const { transformVariables, transformStyles, transformMediaMax, transformColors } = require('./styles');
const {initImports, cutImport, findModule} = require('./imports');

const {
    exportConnectionTransform, importNotRequired, historyToNavigationTransform, removeFormTags, addFlowTags,
    platformTransforms, changePlatform, createAppJs, removeFunctionCall, changeTagName, addScreenDimensionListener,
    replaceStyleAfterFlowFunction, addNavigationRoutePropIntoFlowFunction
} = require('./codeTransformations');

let mainApp = `

import React from 'react';
import {
    Link,
    Redirect,
    withRouter
} from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PageHeader from '../components/PageHeader';
import { PageContainer, PageGlobalContainer } from '../containers/PageContainers';
import * as userActions from '../reducers/user';
import * as loginActions from '../reducers/login';
import * as appActions from '../reducers/app';
import { checkAuth, getUserProfile } from '../helpers/authorization';
import SimpleButton from '../elements/SimpleButton';
import { urls } from '../urls';
import { redirect_if_not_logged } from '../settings';
import { getLanguage } from '../platformTransforms/localization';

const Main = ({ appState, userState, loginState, actions, history, ...props }) => {
    if (!appState.language) {
        getLanguage(actions);
    }
    if (!userState.checkin) {
        checkAuth({ appState, userState, loginState, actions }).then();
    }
    const login_state = !userState.is_authenticated ? 'You are NOT authorized' : 'You are authorized';
    let body = userState.is_authenticated ? (
        <>
            <SimpleButton onClick={(event) => getUserProfile(event)} title={'getUserProfile'} />
            <h1>{'Mobile'}</h1>
        </>
    ) : (
        <>
            {appState.platform === 'web' ? (
                <>
                    <h1>{login_state}</h1>
                    <Link to={urls.login.path}>{'Goto Login'}</Link>
                </>
            ) : (
                <h1>{'Mobile'}</h1>
            )}
        </>
    );

    if (appState.platform !== 'web' && userState.checkin && !userState.is_authenticated && redirect_if_not_logged) {
        body = (
            <>
                <Redirect to={urls.login.path} />
            </>
        );
    }

    return (
        <>
            <PageGlobalContainer className={'container container_background_grey'}>
                <PageHeader avatar_url={'/agent-avatar-change'} {...props} />
                <PageContainer className={'container container_background_grey'}>
                    <div className={'container__limited'}>{body}</div>
                </PageContainer>
            </PageGlobalContainer>
        </>
    );
};

const mapStateToProps = (state) => ({
    appState: state.app,
    userState: state.user,
    loginState: state.login,
});
const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({ ...appActions, ...userActions, ...loginActions }, dispatch),
});

export default withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    )(Main),
);

`;


// transformVariables(variables);
// transformStyles(str);
// transformMediaMax(str, 'media');
// addScreenDimensionListener(mainApp);
// replaceStyleAfterFlowFunction(str);

// let str_3 = 'borderColor 1000 ease-in, backgroundColor 1000 ease-in';

// removeFormTags(mainApp, ['form']);
addNavigationRoutePropIntoFlowFunction(mainApp);

