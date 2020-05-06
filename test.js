const { transformVariables, transformStyles, transformMediaMax, transformColors, transformCustomFontIcons,
    getSvgPathsFromRequires } = require('./styles');
const {initImports, cutImport, findModule, deleteModuleImport} = require('./imports');

const {
    withRouterDelete, importNotRequired, historyToNavigationTransform, removeFormTags, addFlowTags,
    platformTransforms, changePlatform, createAppJs, removeFunctionCall, changeTagName, addScreenDimensionListener,
    replaceStyleAfterFlowFunction, addNavigationRoutePropIntoFlowFunction, removeTagsWithBody, replaceHtmlForWithFocus,
    changeNextTag, addRunAfterInteractionsWrapper, transformModalToNative, deleteJSRequires,
} = require('./codeTransformations');

let mainApp = `
import React from 'react';
import { storage } from '../helpers/storage';
import { bindActionCreators } from 'redux';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import OverMenu from './OverMenu';
import { store, store_actions } from '../reducers';
import * as DateTimePicker from 'react-datetime';
import moment from 'moment';

const ModalWindowDateTimePicker = ({ modalsState, actions, history, className, ...props }) => {
    console.log('ModalWindowDateTimePicker');
    const store_state = store.getState();
    const app_state = store_state.app_settings;

    const locale = app_state.language;
    require('moment/locale/{locale.toLowerCase()}');

    const additional_class = modalsState.date_time_picker_state ? 'modal_window__active' : '';
    /*native const modal_visibility = !!additional_class; native*/

    const screen_name = modalsState.date_time_picker_state ? modalsState.date_time_picker_state.screen_name : '';
    const data_type = modalsState.date_time_picker_state ? modalsState.date_time_picker_state.data_type : '';
    const date_property_name =
        modalsState.date_time_picker_state && modalsState.date_time_picker_state.date_property_name
            ? modalsState.date_time_picker_state.date_property_name
            : '';
    const picker_view_mode =
        modalsState.date_time_picker_state && modalsState.date_time_picker_state.picker_view_mode
            ? modalsState.date_time_picker_state.picker_view_mode
            : 'days';

    let date_format;
    if (picker_view_mode === 'years') {
        date_format = 'YYYY';
    }
    const date_property_value =
        picker_view_mode === 'days'
            ? moment(current_page_state[date_property_name])
    const {
        modal_view_class,
        // screen_name,
        presentation_style = 'pageSheet',
        transparent = false,
        /*native type = 'user_actions',
        animation_type = 'slide', native*/
    } = storage.getData({
        key: 'modal_message',
    })
        ? storage.getData({ key: 'modal_message' })
        : {};

    let additional_view_class = app_state.platform === 'web' ? 'modal_datetime_picker' : 0;
    let dynamic_props = {};
    if (presentation_style !== 'pageSheet' && presentation_style !== 'formSheet') {
        dynamic_props.transparent = transparent;
    } else {
        additional_view_class += ' page_sheet';
    }

    const closeModalWindow = ({ event, on_dismiss }) => {
        if (app_state.platform !== 'web' || (event && event.target === event.currentTarget) || on_dismiss) {
            if (event) {
                event.preventDefault();
            }
            if (modalsState.date_time_picker_state) {
                console.log('ModalWindowSearch modals_state.modal_window_state');
                actions.setAppModalsData({ date_time_picker_state: '' });
            }
        }
    };

    const onChangePicker = (event) => {
        console.log('onChangePicker');

        const value_text =
            picker_view_mode !== 'years' ? new Date(event.format('YYYY-MM-DD')).toLocaleDateString() : event.year();

        let value_date = new Date(event.format('YYYY-MM-DD'));
        const new_date = {};
        new_date[date_property_name] = value_text;
        // actions.setAppModalsData({ date_time_picker_state: date_start_value });
        actions.updateAppModalsState({});
    };
    const picker_props =
        app_state.platform === 'web'
            ? {
                  timeFormat: false,
                  input: false,
                  open: true,
                  dateFormat: date_format,
                  viewMode: picker_view_mode,
                  value: date_property_value,
              }
            : {
                  mode: picker_view_mode,
                  value: date_property_value,
              };
    return (
        <div
            onClick={(event) => closeModalWindow({ event: event })}>
            <div
                /*native visible={modal_visibility} native*/
                /*native onRequestClose={(event) => closeModalWindow({ event: event, on_dismiss: true })} native*/
                /*native onDismiss={(event) => closeModalWindow({ event: event, on_dismiss: true })} native*/
                /*native {...dynamic_props} native*/
            >
                <div className={'modal_window__content datetime_picker_content justify_content_between flex_grow'}>
                    <div className={'d_flex flex_column'}>
                        <div className={'d_flex flex_row justify_content_center'}>
                            <span className={'close_rect'} onClick={(event) => closeModalWindow({ event: event })}>
                                {app_state.platform === 'web' ? '×' : 'Закрыть'}
                            </span>
                            {app_state.platform !== 'web' ? (
                                <span className={'modal_card_label'}>{'Поиск'}</span>
                            ) : (
                                <></>
                            )}
                        </div>
                        <DateTimePicker {...picker_props} onChange={onChangePicker} />
                    </div>
                </div>
                {app_state.platform !== 'web' ? <OverMenu history={history} /> : <></>}
            </div>
        </div>
    );
};

const mapStateToProps = (state) => ({
    modalsState: state.app_modals,
});
const mapDispatchToProps = (dispatch) => ({ actions: bindActionCreators({ ...store_actions }, dispatch) });
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(ModalWindowDateTimePicker));
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
deleteJSRequires(mainApp, ['moment']);
