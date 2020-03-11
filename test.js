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
import { createSlice } from '@reduxjs/toolkit';
import { detect_language } from '../settings';

export const appSlice = createSlice({
    name: 'app',
    initialState: {
        counter: 0,
        platform: 'web',
        os: '',
        browser: null,
        language: null,
        default_language: 'RU',
        connection_state: '',
        await_request: [],
        loading: {
            main: false,
            person_view: false,
            messenger_settings: false,
            test_view: false,
            login: false,
        },
        title_header_height: 0,
        screen_data: '',
        screen_errors: {
            all: [],
        },
        current_screen_number: {},
        messenger_state: null,
        modal_window_state: '',
        over_menu_state: '',
    },
    reducers: {
        setLanguage: (state, action) => {
            state.language =
                detect_language && action.payload ? action.payload : state.language || state.default_language;
        },
        setBrowser: (state, action) => {
            state.browser = action.payload;
        },
        setConnectionState: (state, action) => {
            const error_connection_message = 'Отсутствует подключение к интернет';
            state.connection_state = action.payload;
            if (state.connection_state === 'error') {
                state.await_request.splice(0, state.await_request.length - 1);
                if (!state.screen_errors.all.includes(error_connection_message)) {
                    state.screen_errors.all.push(error_connection_message);
                }
            } else if (state.screen_errors.all && state.screen_errors.all.includes(error_connection_message)) {
                state.screen_errors.all.splice(state.screen_errors.all.indexOf(error_connection_message), 1);
            }
        },
        updateScreenDimensions: (state, action) => {
            if (!state.screen_data) {
                state.screen_data = {};
            }
            state.screen_data = { ...state.screen_data, ...action.payload };
        },
        setOS: (state, action) => {
            state.os = action.payload;
        },
        setStatusBarHeight: (state, action) => {
            if (!state.screen_data) {
                state.screen_data = {};
            }
            state.screen_data.status_bar_height = action.payload.status_bar_height;
        },
        setHeaderHeight: (state, action) => {
            if (!state.screen_data) {
                state.screen_data = {};
            }
            state.screen_data.header_height = action.payload;
        },
        setAppTitleHeight: (state, action) => {
            state.title_header_height = action.payload;
        },
        setScreenErrors: (state, action) => {
            Object.keys(action.payload).forEach((key) => {
                state.screen_errors[key] = action.payload[key];
            });
        },
        cleanScreenErrors: (state, action) => {
            if (state.screen_errors[action.payload]) {
                state.screen_errors[action.payload].splice(0, state.screen_errors[action.payload].length);
            }
        },
        setCurrentScreenNumber: (state, action) => {
            const { screen_number, screen_name } = action.payload;
            state.current_screen_number[screen_name] = screen_number;
        },
        setMessengerState: (state, action) => {
            state.messenger_state = action.payload;
        },
        setModalWindowState: (state, action) => {
            state.modal_window_state = action.payload;
        },
        setOverMenuState: (state, action) => {
            state.over_menu_state = action.payload;
        },
        setLoadingState: (state, action) => {
            const { screen_name, data_type, loading_state } = action.payload;
            state.loading[screen_name] = loading_state;
        },
        updateAppState: (state, action) => {
            state.counter++;
        },
    },
});

// Extract the action creators object and the reducer
const { actions, reducer } = appSlice;
// Extract and export each action creator by name
export const {
    setLanguage,
    setBrowser,
    updateScreenDimensions,
    setOS,
    setStatusBarHeight,
    setConnectionState,
    setScreenErrors,
    cleanScreenErrors,
    setCurrentScreenNumber,
    setMessengerState,
    setModalWindowState,
    setHeaderHeight,
    setOverMenuState,
    setAppTitleHeight,
    setLoadingState,
    updateAppState,
} = actions;
// Export the reducer, either as a default or named export
export default reducer;
`;

// transformVariables(variables);
// transformStyles(str);
// transformMediaMax(str, 'media');
// addScreenDimensionListener(mainApp);
// replaceStyleAfterFlowFunction(str);

// let str_3 = 'borderColor 1000 ease-in, backgroundColor 1000 ease-in';

// removeFormTags(mainApp, ['form']);
// findCloseModalTag(mainApp);
changePlatform(mainApp);

