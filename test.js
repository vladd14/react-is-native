const { transformVariables, transformStyles, transformMediaMax, transformColors, transformCustomFontIcons } = require('./styles');
const {initImports, cutImport, findModule, deleteModuleImport} = require('./imports');

const {
    exportConnectionTransform, importNotRequired, historyToNavigationTransform, removeFormTags, addFlowTags,
    platformTransforms, changePlatform, createAppJs, removeFunctionCall, changeTagName, addScreenDimensionListener,
    replaceStyleAfterFlowFunction, addNavigationRoutePropIntoFlowFunction, removeTagsWithBody, replaceHtmlForWithFocus
} = require('./codeTransformations');

let mainApp = `

// insarm icons codes

.insarm_icon_error:before { content: '\e800'; }
.insarm_icon_money:before { content: '\e803'; }
.insarm_icon_reback:before { content: '\e805'; }
.insarm_icon_und:before { content: '\e806'; }
.insarm_icon_project:before { content: '\e807'; }
.insarm_icon_reback_on_delivery:before { content: '\e808'; }
.insarm_icon_reback_on_delivery_success:before { content: '\e809'; }
.reback_reject_on_delivery:before { content: '\e80a'; }
.insarm_icon_logo_2:before { content: '\e80b'; }
.insarm_icon_callcenter:before { content: '\e80c'; }
.insarm_icon_copy:before { content: '\e80d'; }
.insarm_icon_reback_on_delivery_right:before { content: '\e80e'; }
.insarm_icon_calc:before { content: '\e80f'; }
.insarm_icon_not_relevant:before { content: '\e810'; }
.insarm_icon_insarm_clock:before { content: '\e811'; }
.insarm_icon_add_percent:before { content: '\e812'; }
.insarm_icon_edit:before { content: '\e813'; }
.insarm_icon_menu_dotted_vertical:before { content: '\e814'; }
.insarm_icon_ol_list_reset:before { content: '\e815'; }
.insarm_icon_add_item:before { content: '\e816'; }
.insarm_icon_insarm_add_money:before { content: '\e817'; }
.insarm_icon_insarm_push_text:before { content: '\e818'; }
.insarm_icon_panels_arrangement:before { content: '\e819'; }
.insarm_icon_call_round:before { content: '\e81a'; }
.insarm_icon_call_outcome_round:before { content: '\e81b'; }
.insarm_icon_call_outcome_success_round:before { content: '\e81c'; }
.insarm_icon_call_outcome_failed_round:before { content: '\e81d'; }
.insarm_icon_call_income_success_round:before { content: '\e81e'; }
.insarm_icon_call_income_failed_round:before { content: '\e81f'; }
.insarm_icon_call:before { content: '\e820'; }
.insarm_icon_call_outcome:before { content: '\e821'; }
.insarm_icon_call_outcome_success:before { content: '\e822'; }
.insarm_icon_call_outcome_failed:before { content: '\e823'; }
.insarm_icon_call_income_success:before { content: '\e824'; }
.insarm_icon_call_income_failed:before { content: '\e825'; }
.insarm_icon_calendar:before { content: '\e826'; }
.insarm_icon_gear:before { content: '\e827'; }
.insarm_icon_gear_outline:before { content: '\e828'; }
.insarm_icon_clock_simple:before { content: '\e829'; }
.insarm_icon_drivers_license:before { content: '\e82a'; }
.insarm_icon_drivers_licenses_3:before { content: '\e82b'; }
.insarm_icon_whatsapp_filled:before { content: '\e82c'; }
.insarm_icon_whatsapp_outlined:before { content: '\e82d'; }
.insarm_icon_recycle_bin:before { content: '\e82e'; }
.insarm_icon_drivers_licenses_2:before { content: '\e82f'; }

`;

// transformVariables(variables);
// transformStyles(str);
// transformMediaMax(str, 'media');
// addScreenDimensionListener(mainApp);
// replaceStyleAfterFlowFunction(str);

// let str_3 = 'borderColor 1000 ease-in, backgroundColor 1000 ease-in';

// removeFormTags(mainApp, ['form']);
transformCustomFontIcons(mainApp, 'insarm_icon');

