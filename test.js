const { transformVariables, transformStyles, transformMediaMax, transformColors, transformCustomFontIcons,
    getSvgPathsFromRequires } = require('./styles');
const {initImports, cutImport, findModule, deleteModuleImport} = require('./imports');

const {
    exportConnectionTransform, importNotRequired, historyToNavigationTransform, removeFormTags, addFlowTags,
    platformTransforms, changePlatform, createAppJs, removeFunctionCall, changeTagName, addScreenDimensionListener,
    replaceStyleAfterFlowFunction, addNavigationRoutePropIntoFlowFunction, removeTagsWithBody, replaceHtmlForWithFocus,
    findCloseModalTag,
} = require('./codeTransformations');

let mainApp = `
/**
 * @format
 * @flow
 */
import React from 'react';
import Avatar from '../components/Avatar';
import { translator } from '../helpers/translate';
import { storage } from '../helpers/storage';
import { default_user_logo } from '../requirements';
import { bindActionCreators } from 'redux';
import * as appActions from '../reducers/app';
import * as userActions from '../reducers/user';
import * as loginActions from '../reducers/login';
import { connect } from 'react-redux';
import SimpleButton from '../elements/SimpleButton';
import { Modal } from 'react-native';
import { Div, TextTag } from '../platformTransforms';

const ModalWindow: () => React$Node = ({ appState, userState, loginState, actions, className, ...props }) => {
    const closeModalWindow = (event) => {
        event.preventDefault();
        if (event.target === event.currentTarget) {
            actions.setModalWindowState(false);
        }
    };

    const additional_class = appState.modal_window_state ? 'modal_window__active' : '';
    const modal_visibility = !!additional_class;
    const { message, modal_view_class, type = 'user_actions' } = storage.getData({ key: 'modal_message' })
        ? storage.getData({ key: 'modal_message' })
        : {};

    const avatar_url = '';
    const avatar = default_user_logo;
    const avatar_type = '';
    const avatar_alt = 'Avatar';

    return (
        <Div className={'modal_window__container'} onPress={(event) => closeModalWindow(event)}>
            <Modal
                className={'card modal_window__view'}
                visible={modal_visibility}
                animationType={'slide'}
                onRequestClose={(event) => closeModalWindow(event)}
                presentationStyle={'pageSheet'}
            >
                <Div className={'modal_window__content justify_content_between flex_grow'}>
                    <TextTag tagType={'span'} className={'close_rect'} onPress={(event) => closeModalWindow(event)}>
                        ×
                    </TextTag>
                    <Div>
                        {type === 'user_actions' ? (
                            <Div className={'logo justify_content_center'}>
                                <Avatar to={avatar_url} src={avatar} type={avatar_type} alt={avatar_alt} />
                            </Div>
                        ) : (
                            <></>
                        )}
                    </Div>
                    <Div>
                        <TextTag tagType={'p'} className={'text_centered text_weight_500'}>{message}</TextTag>
                    </Div>
                    <Div className={'text_centered margin_bottom_st_x2'}>
                        <SimpleButton
                            title={translator('OK', appState.language)}
                            additional_class={'small size-changing blue'}
                            onPress={(event) => closeModalWindow(event)}
                        />
                    </Div>
                </Div>
                {/* closeModalTag */}
            </Div>
        </Div>
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

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(ModalWindow);
`;

// transformVariables(variables);
// transformStyles(str);
// transformMediaMax(str, 'media');
// addScreenDimensionListener(mainApp);
// replaceStyleAfterFlowFunction(str);

// let str_3 = 'borderColor 1000 ease-in, backgroundColor 1000 ease-in';

// removeFormTags(mainApp, ['form']);
// findCloseModalTag(mainApp);
console.log(findCloseModalTag(mainApp));

