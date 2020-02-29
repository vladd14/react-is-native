const { transformVariables, transformStyles, transformMediaMax, transformColors, transformCustomFontIcons,
    getSvgPathsFromRequires } = require('./styles');
const {initImports, cutImport, findModule, deleteModuleImport} = require('./imports');

const {
    exportConnectionTransform, importNotRequired, historyToNavigationTransform, removeFormTags, addFlowTags,
    platformTransforms, changePlatform, createAppJs, removeFunctionCall, changeTagName, addScreenDimensionListener,
    replaceStyleAfterFlowFunction, addNavigationRoutePropIntoFlowFunction, removeTagsWithBody, replaceHtmlForWithFocus,
    changeNextTag, addRunAfterInteractionsWrapper,
} = require('./codeTransformations');

let mainApp = `
import React from 'react';
import { storage } from '../helpers/storage';
import { bindActionCreators } from 'redux';
import * as appActions from '../reducers/app';
import * as userActions from '../reducers/user';
import * as loginActions from '../reducers/login';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { urls } from '../urls';
import { insarm_icons } from '../fonts/insarm_icons';
import * as dataActions from '../reducers/data';

const ModalWindowNotify = ({ appState, userState, loginState, data, actions, history, className, ...props }) => {
    const closeModalWindow = (event) => {
        if (appState.platform !== 'web' || (event && event.target === event.currentTarget)) {
            if (event) {
                event.preventDefault();
            }
            actions.setOverMenuState('');
        }
    };
    const storage_key = 'over_menu';
    const additional_class =
        appState.over_menu_state && appState.over_menu_state === 'over_menu' ? 'modal_window__active' : '';
    const { modal_view_class, data_type, item } = storage.getData({
        key: storage_key,
    })
        ? storage.getData({ key: storage_key })
        : {};

    const additional_view_modal_class = appState.over_menu_state === 'over_menu' ? 'over_menu' : '';

    const action = (() => {
        switch (data_type) {
            case 'contacts':
                return { title: 'Контактом', to_screen_name: 'person_view', to_data_type: 'person_app' };
            default:
                return { title: '' };
        }
    })(data_type);

    const openPage = () => {
        console.log('openPage From OverMenu');
        storage.setData({
            key: \`{action.to_screen_name}_{action.to_data_type}\`,
            platform: appState.platform,
        });
        storage.setInnerData({
            key: \`{action.to_screen_name}_{action.to_data_type}\`,
            inner_key: 'results',
            payload: [item],
        });
        actions.setModalWindowState('');
        actions.setOverMenuState('');
        history.push(urls[action.to_screen_name].path);
    };

    const addToContacts = () => {
        console.log('addToContacts From OverMenu');
        console.log('item', item);
    };

    const addToBookmarks = () => {
        console.log('addToContacts From OverMenu');
        console.log('item', item);
    };

    let actions_menu = [
        {
            name: 'Открыть',
            action: openPage,
            data_types: ['contacts'],
        },
        {
            name: 'в Контакты',
            action: addToContacts,
            data_types: ['contacts'],
        },
        {
            name: 'в Закладки',
            action: addToBookmarks,
            data_types: ['contacts'],
        },
    ];
    
    // const y_animated_position = animated_property._value;
    // if (direction === 'forward' && Math.abs(y_animated_position) < y_position) {
    //     animated_property.setValue(y_position);
    //     console.log('animated_property._value=', animated_property._value);
    //     actions.setHeaderTitleHeight(y_position);
    // }

    return (
        <div className={\`modal_window__container {additional_class}\`} onClick={(event) => closeModalWindow(event)}>
            <div
                className={\`card modal_window__view modal_window_notify {modal_view_class} {additional_view_modal_class}\`}>
                <div className={'modal_window__content justify_content_between flex_grow over_menu_content'}>
                    <span className={'close_rect'} onClick={(event) => closeModalWindow(event)}>
                        ×
                    </span>
                    <div className={'over_menu_header'}>
                        <span className={'margin_top_st'}>{\`Действия с {action.title}\`}</span>
                    </div>
                    <div className={'d_flex flex_column'}>
                        {actions_menu
                            .filter((item) => item.data_types.includes(data_type))
                            .map((item, index) => (
                                <span
                                    className={\`column_menu__item item_{index + 1} text_smaller_p20\`}
                                    onClick={(event) => item.action(event)}
                                    key={index}>
                                    <span /*native onClick={(event) => item.action(event)} native*/>{item.name}</span>
                                    <span className={'insarm_icon product_indicators__indicator'}>
                                        {insarm_icons.chevron_right_tiny}
                                    </span>
                                </span>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const mapStateToProps = (state) => ({
    appState: state.app,
    userState: state.user,
    loginState: state.login,
    data: state.data,
});
const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({ ...appActions, ...userActions, ...loginActions, ...dataActions }, dispatch),
});

export default withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    )(ModalWindowNotify),
);
`;

// transformVariables(variables);
// transformStyles(str);
// transformMediaMax(str, 'media');
// addScreenDimensionListener(mainApp);
// replaceStyleAfterFlowFunction(str);

// let str_3 = 'borderColor 1000 ease-in, backgroundColor 1000 ease-in';

// removeFormTags(mainApp, ['form']);
// findCloseModalTag(mainApp);
addRunAfterInteractionsWrapper(mainApp);

