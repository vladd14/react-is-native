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
import React, { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { store, store_actions } from '../../reducers';
import * as person_apps from '../../app_structure/person_app';
import { renderItems } from '../../helpers/render_items';
import { asyncRequest } from '../../helpers/network';
import { requests } from '../../urls';
import moment from 'moment';
import * as tools_module from '../../helpers/tools';
import * as helpers_module from '../../helpers/helpers';
import { references } from '../../helpers/storage';
import { platform } from '../../settings';
import { copyObject } from '../../helpers/tools';

const {
    isItemHasObjectShape,
    makeFunctionalNameString,
    getDateMinusDays,
    getDatePlusYears,
    getObjectValueByDotsProperties,
    getDateFormatByLocale,
} = tools_module;
const { cleanErrors, transformDateProperties, getValueFromStorageItem, fixPropertiesNamesInObject } = helpers_module;
const tools = { ...tools_module, ...helpers_module };

const PersonViewEdit = ({ ...rest }) => {
    const {
        screen_name: real_screen_name,
        data_type: real_data_type,
        store_screen_name,
        store_data_type,
        column_number,
        // person_app_name,
        app_name,
        array_name,
        // person_key,
        app_mode,
        app_key,
        container_class: container_class_properties,
        container_class_secondary,
    } = rest;
}
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
// addKeyboardAvoidingViewWrapper(mainApp);

cutImport(mainApp, true);

