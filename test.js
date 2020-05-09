const { transformVariables, transformStyles, transformMediaMax, transformColors, transformCustomFontIcons,
    getSvgPathsFromRequires } = require('./styles');
const {initImports, cutImport, findModule, deleteModuleImport} = require('./imports');

const {
    withRouterDelete, importNotRequired, historyToNavigationTransform, removeFormTags, addFlowTags,
    platformTransforms, changePlatform, createAppJs, removeFunctionCall, changeTagName, addScreenDimensionListener,
    replaceStyleAfterFlowFunction, addNavigationRoutePropIntoFlowFunction, removeTagsWithBody, replaceHtmlForWithFocus,
    changeNextTag, addRunAfterInteractionsWrapper, transformModalToNative, deleteJSRequires, testHtmlTokens,
} = require('./codeTransformations');

let mainApp = `
import React from 'react';
import { isItemHasObjectShape, makeFunctionalNameString, makeStringTitled } from '../../helpers/tools';
import { screens_by_app_array, screens_by_type_names_array } from '../../app_structure/screens';
import { references, storage } from '../../helpers/storage';
import { store, store_actions } from '../../reducers';
import { useHistory } from 'react-router-dom';
import { getRef } from '../../helpers/elements_functional_properties';

const StepName = ({ appState, userState, storeState, actions, ...props }) => {
    const history = useHistory();
    // onLayout - for native. Keep it here for native
    let { screen_name, data_type, additional_class, Ref, onLayout } = props;
    const store_state = store.getState();
    const app_storage_state = store_state.app_storage;
    const screens_state = store_state.app_screens;
    const current_screen_number = screens_state[screen_name] ? screens_state[screen_name].screen_number : 0;

    const connection_internet_error = appState.screen_errors
        ? appState.screen_errors.all.length ||
          (appState.screen_errors[history.location.pathname] &&
              appState.screen_errors[history.location.pathname].length)
            ? 'alert_on'
            : ''
        : '';

    const localClick = ({ to_screen_name, to_data_type, item }) => {
        const store_state = store.getState();
        const app_storage_state = store_state.app_storage;
        const current_screen_name = screen_name;
        const theme_state = store_state[\`{current_screen_name}_theme\`];
        const current_data_type = screens_by_app_array[current_screen_name][current_screen_number].name;

        console.log('current_screen_name=', current_screen_name);
        console.log('current_data_type=', current_data_type);

        if (!item.static_item) {
            const to_screen_number = screens_by_type_names_array[current_screen_name].indexOf(to_data_type);
            const header_height = theme_state.header_height;
            const current_key = \`{current_screen_name}_{current_data_type}_scroll\`;
            const next_key = \`{current_screen_name}_{to_data_type}_scroll\`;
            const scroll_current_position_y =
                app_storage_state[current_screen_name] &&
                app_storage_state[current_screen_name][current_data_type] &&
                app_storage_state[current_screen_name][current_data_type].y
                    ? app_storage_state[current_screen_name][current_data_type].y
                    : 0;

            const scroll_next_position_y =
                app_storage_state[current_screen_name] &&
                app_storage_state[current_screen_name][to_data_type] &&
                app_storage_state[current_screen_name][to_data_type].y
                    ? app_storage_state[current_screen_name][to_data_type].y
                    : 0;

            if (scroll_current_position_y < header_height) {
                const ref = references.getReference(current_key);
                const behaviour =
                    current_key === next_key
                        ? appState.platform !== 'web'
                            ? true
                            : 'smooth'
                        : appState.platform !== 'web'
                        ? false
                        : 'auto';
                if (appState.platform !== 'web') {
                    ref.scrollToOffset({ offset: header_height, animated: behaviour });
                } else if (ref) {
                    let animated_property = storage.getData({ key: \`{current_screen_name}_header\` }).animated_property;
                    if (animated_property < header_height) {
                        animated_property = header_height;
                        storage.setDataSpread({
                            key: \`{current_screen_name}_header\`,
                            ...{
                                ...storage.getData({ key: \`{current_screen_name}_header\` }),
                                animated_property: animated_property,
                            },
                        });
                    }
                    ref.scroll({ left: 0, top: header_height, behavior: behaviour });
                }
            }

            console.log('scroll_next_position_y=', scroll_next_position_y);
            console.log('header_height=', header_height);
            console.log('current_key=', current_key);
            console.log('next_key=', next_key);

            if (scroll_next_position_y < header_height && current_key !== next_key) {
                const ref1 = references.getReference(next_key);
                if (appState.platform !== 'web') {
                    console.log('ref1=', ref1);
                    // if data_type was changed (horizontal scroll has changed) set animation value for native)
                    let animated_property = storage.getData({ key: \`{current_screen_name}_header\` }).animated_property;
                    if (animated_property._value < header_height) {
                        animated_property.setValue(-header_height);
                    }
                    ref1.scrollToOffset({ offset: header_height, animated: false });
                } else if (ref1) {
                    ref1.scroll({ left: 0, top: header_height, behavior: 'auto' });
                }
            }
            // for native. In web it's using css transitions with div class changing
            if (appState.platform !== 'web') {
                const ref2 = references.getReference(\`{current_screen_name}_horizontal_container\`);
                if (ref2) {
                    const offset = appState.screen_data.width * to_screen_number;
                    ref2.scrollToOffset({
                        offset: offset,
                        animated: false,
                    });
                }
            }
            // Be sure it's placing here (animating menu buttons)
            //setState({ ...state, screen_number: to_screen_number });
            // actions.setMenu
            actions[\`set{makeFunctionalNameString(to_screen_name)}MenuData\`]({
                screen_number: to_screen_number,
            });

            // for web pages updating
            if (current_key !== next_key) {
                let current_screen_state = {};
                current_screen_state[current_screen_name] = {};
                current_screen_state[current_screen_name].screen_number = to_screen_number;
                actions.setAppScreensData({
                    ...current_screen_state,
                });
                // change list header position on web platform
                if (appState.platform === 'web') {
                    actions[\`update{makeFunctionalNameString(to_screen_name)}ThemeState\`]({});
                }
                // if user not authenticated we don't need to render column view at all
                if (userState.is_authenticated) {
                    if (
                        to_data_type !== 'messages' &&
                        !store_state[\`{to_screen_name}_{to_data_type}\`].results.length
                    ) {
                        // if data doesn't exist in column view rerender it.
                        // In rerender process we check data for this column on server.
                        actions[
                            \`update{makeFunctionalNameString(to_screen_name)}{makeStringTitled(to_data_type)}State\`
                        ]({});
                    }
                }
            } else {
                actions[\`update{makeFunctionalNameString(to_screen_name)}{makeStringTitled(to_data_type)}State\`]({});
            }
        } else if (item.static_item) {
            // here goes buttons events
            if (item.name === 'search') {
                storage.setData({
                    key: 'modal_message',
                    ...{
                        screen_name: current_screen_name,
                        modal_view_class: 'modal_state_primary',
                        type: 'actions',
                        animation_type: 'slide',
                        presentation_style: 'pageSheet',
                        transparent: false,
                    },
                });
                actions.setAppModalsData({ modal_window_state: 'search' });
            }
        }
    };

    const startCalculation = () => {
        const store_state = store.getState();
        const app_storage_state = store_state.app_storage;
        const storage_data = {};
        storage_data[screen_name] = app_storage_state[screen_name] ? { ...app_storage_state[screen_name] } : {};
        storage_data[screen_name].osago_start = true;
        actions.setAppStorageData({ ...storage_data });
        actions[\`set{makeFunctionalNameString(screen_name)}HorizontalViewData\`]({
            ...storage_data,
        });
        console.log('start calc');
    };
    const nextClick = (to_screen_number) => {
        const store_state = store.getState();
        const app_storage_state = store_state.app_storage;
        const current_screen_name = screen_name;
        let current_screen_state = {};
        current_screen_state[current_screen_name] = {};
        current_screen_state[current_screen_name].screen_number = to_screen_number;

        if (appState.platform !== 'web') {
            const ref2 = references.getReference(\`{current_screen_name}_horizontal_container\`);
            if (ref2) {
                const offset = appState.screen_data.width * to_screen_number;
                ref2.scrollToOffset({
                    offset: offset,
                    animated: true,
                });
            }
        }
        actions.setAppScreensData({
            ...current_screen_state,
        });
    };

    additional_class = additional_class ? additional_class : '';
    const additional_mobile_menu_props = appState.platform !== 'web' ? { showsHorizontalScrollIndicator: false } : {};
    const active_indicator =
        app_storage_state && app_storage_state[screen_name] && app_storage_state[screen_name].osago_start
            ? 'active_indicator'
            : '';

    const max_steps = 5;
    const step_info = (() => {
        if (data_type === 'step_one') {
            return { step: 0, name: 'транспорт' };
        } else if (data_type === 'step_two') {
            return { step: 1, name: 'Страхователь' };
        } else if (data_type === 'step_three') {
            return { step: 2, name: 'Собственник' };
        } else if (data_type === 'step_four') {
            return { step: 3, name: 'Водители' };
        } else if (data_type === 'step_five') {
            return { step: 4, name: 'Расчет' };
        }
    })();
    return (
        <li className={\`li decoration_header {active_indicator}\`}>
            <div
                className={\`menu_after_header__container menu_after_header__osago_calc align_items_center {additional_class}\`}
                {...getRef({
                    screen_name: screen_name,
                    data_type: data_type,
                    reducer_name: 'theme',
                    reducer_property: 'menu_height',
                })}>
                <div {...additional_mobile_menu_props} className={'menu_after_header__menu'}>
                    <div className={'link_underline__container'}>
                        <span
                            className={'link_underline__link color_brand'}
                            onClick={(event) => startCalculation(event)}>
                            {app_storage_state &&
                            app_storage_state[screen_name] &&
                            app_storage_state[screen_name].osago_start
                                ? step_info.name
                                : 'поехали'}
                        </span>
                    </div>
                </div>
                <div
                    className={\`decoration_arrow__rhombic decoration_arrow__back_arrow decoration_arrow__{active_indicator} {
    current_screen_number || 'display_off'
}\`}
                    onClick={(event) => nextClick(step_info.step - 1)}>
                    <span
                        className={'decoration_arrow__body color_osago text_smaller_p10'}
                        onClick={(event) => nextClick(step_info.step - 1)}>
                        {step_info.step}
                    </span>
                </div>
                <div
                    className={\`decoration_arrow__rhombic decoration_arrow__{active_indicator} {
    current_screen_number < max_steps - 1 || 'display_off'
}\`}
                    onClick={(event) => nextClick(step_info.step + 1)}>
                    <span className={'decoration_arrow__body'} onClick={(event) => nextClick(step_info.step + 1)}>
                        {step_info.step + 2}
                    </span>
                </div>
            </div>
            <div>ssss</div>
        </li>
    );
};
export default StepName;

`

// transformVariables(variables);
// transformStyles(str);
// transformMediaMax(str, 'media');
// addScreenDimensionListener(mainApp);
// replaceStyleAfterFlowFunction(str);

// let str_3 = 'borderColor 1000 ease-in, backgroundColor 1000 ease-in';

// removeFormTags(mainApp, ['form']);
// findCloseModalTag(mainApp);
// transformModalToNative(mainApp);
testHtmlTokens(mainApp);
