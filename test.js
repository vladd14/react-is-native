const { transformVariables, transformStyles, transformMediaMax, transformColors, transformCustomFontIcons,
    getSvgPathsFromRequires } = require('./styles');
const {initImports, cutImport, findModule, deleteModuleImport} = require('./imports');

const {
    withRouterDelete, importNotRequired, historyToNavigationTransform, removeFormTags, addFlowTags,
    platformTransforms, changePlatform, createAppJs, removeFunctionCall, changeTagName, addScreenDimensionListener,
    replaceStyleAfterFlowFunction, addNavigationRoutePropIntoFlowFunction, removeTagsWithBody, replaceHtmlForWithFocus,
    changeNextTag, addRunAfterInteractionsWrapper, transformModalToNative, deleteJSRequires, addKeyboardAvoidingViewWrapper,
} = require('./codeTransformations');

let mainApp = `
import React from 'react';
import { references } from '../helpers/storage';
import { checkPermissions } from '../helpers/network';
import { Columns } from '../components_connections/DataTypeRelatedViews';
import ColumnView from './ColumnView';
import { store } from '../reducers';
import { screens_by_app_array } from '../app_structure/screens';
import { horizontalViewProps } from '../helpers/elements_functional_properties';
import FooterLoaderComponent from './FooterLoaderComponent';
import EmptyListComponent from './EmtyListComponent';

const HorizontalView = ({ storeState, screensState, actions, trace, ...rest }) => {
    const { screen_name, onClick, onScroll, column_list_props = {} } = rest;
    const store_state = store.getState();
    const app_state = store_state.app_settings;

    if (app_state.platform !== 'web') {
        screensState = store_state.app_screens;
    }

    const current_screen_number = screensState[screen_name] ? screensState[screen_name].screen_number : 0;

    // const current_data_type = screens_by_app_array[screen_name][current_screen_number].name;
    const columns_array = screens_by_app_array[screen_name];

    const additional_mobile_props_horizontal_list =
        app_state.platform !== 'web'
            ? {
                  ...column_list_props,
              }
            : {
                  // ...column_list_props,
              };
    const additional_mobile_props_render_list =
        app_state.platform !== 'web'
            ? {
                  ...column_list_props,
                  ListFooterComponent: screen_name !== 'osago_calc' ? FooterLoaderComponent : null,
                  ListEmptyComponent: EmptyListComponent,
              }
            : {
                  ...column_list_props,
                  ListEmptyComponent: EmptyListComponent,
              };
    return (
        <ul
            keyboard_avoiding_view={'keyboard_avoiding_view'}
            className={horizontal_container view_position_{current_screen_number + 1}}
            {...horizontalViewProps({ screen_name: screen_name })}
            {...additional_mobile_props_horizontal_list}
            ref={(component) => {
                references.setReference({
                    key: {screen_name}_horizontal_container,
                    ref: component,
                });
            }}>
            {columns_array
                .filter((item) => item.render_component && (!item.permissions || checkPermissions(item.permissions)))
                .map((item, index) => {
                    const Render = Columns[{item.screen}_{item.name}] || ColumnView;
                    return (
                        <Render
                            {...{
                                ...additional_mobile_props_render_list,
                                column_number: index,
                                primary_key: item.primary_key,
                                screen_name: item.screen,
                                data_type: item.name,
                                onScroll: (event) =>
                                    onScroll &&
                                    onScroll(event, {
                                        key: {screen_name}_{item.name}_scroll,
                                        scroll_data_type: item.name,
                                        from: 'list',
                                    }),
                                Ref: ({ key, ref }) => {
                                    references.setReference({ key: key, ref: ref });
                                },
                                onClick: (event) => onClick && onClick(event),
                            }}
                            key={index}
                        />
                    );
                })}
        </ul>
    );
};
export default HorizontalView;
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
addKeyboardAvoidingViewWrapper(mainApp);
