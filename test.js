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
@charset "UTF-8";
/* Стандартный цвет отображения шрифта */
/* Стандартный цвет border */
.separator_with_label {
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  margin-bottom: 0.75rem;
  width: 100%;
}
.separator_with_label__decoration_line {
  flex-grow: 1;
  height: 1px;
  background-color: rgba(0, 0, 0, 0.2);
  overflow: hidden;
}
.separator_with_label__label {
  padding: 0 0.25rem 0 0.25rem;
  font-size: 0.94rem;
  text-transform: uppercase;
  font-weight: 500;
}
@media (max-width: 1559px) {
  .separator_with_label__label {
    font-size: 0.88rem;
  }
}
@media (max-width: 991px) {
  .separator_with_label__label {
    font-size: 0.84rem;
  }
}
@media (max-width: 767px) {
  .separator_with_label__label {
    font-size: 0.74rem;
  }
}

.form_group {
  position: relative;
  display: flex;
  flex-flow: column nowrap;
  margin-bottom: 0.5rem;
}
.form_group_styled {
  display: flex;
  position: relative;
  border-radius: 0.25rem;
}
.form_group_styled__switch {
  display: flex;
  flex-flow: row nowrap;
  flex-grow: 1;
  min-height: 45px;
}
@media (max-width: 767px) {
  .form_group_styled__switch {
    min-height: 36px;
  }
}
.form_group__label {
  white-space: nowrap;
  margin: 0;
}
.form_group__control_container {
  display: flex;
  flex-grow: 1;
  border: 1px solid #a6a6a6;
  border-radius: 0.25rem;
}
.form_group__control {
  display: flex;
  flex-grow: 1;
  position: relative;
  border: 1px solid transparent;
  border-radius: calc(0.25rem - 1px);
  padding: 0.125rem;
}
.form_group__input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 16px;
  line-height: 1.33;
  background-color: transparent;
  padding: 0 8px;
  margin-top: 8px;
  margin-bottom: 8px;
  z-index: 2;
  color: #4d4d4d;
}
@media (max-width: 767px) {
  .form_group__input {
    margin-top: 6.4px;
    margin-bottom: 6.4px;
    padding: 0 6.4px;
  }
}
@media ios {
  .form_group__input {
    line-height: 1.2;
  }
}
.form_group__check {
  position: absolute;
  left: -999999rem;
}
.form_group__check_appearance {
  display: flex;
}
.form_group__check_switch_container {
  width: 42px;
  height: 28px;
  display: flex;
  flex-flow: row nowrap;
  background-color: #e0e0e0;
  border: 2px solid #e0e0e0;
  border-radius: 42px;
  align-items: center;
  transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out;
}
.form_group__check_switch_element {
  position: relative;
  display: flex;
  flex-shrink: 0;
  background-color: #fcfcfc;
  width: 24px;
  height: 24px;
  border-radius: 28px;
  box-shadow: 0 1px 3px 1px rgba(0, 0, 0, 0.1);
  left: 0;
  transition: left 0.2s ease-in-out;
}
.form_group__additional_text {
  display: none;
}

.form_group_switch {
  display: flex;
  flex-flow: row nowrap;
  align-self: flex-start;
  min-height: 45px;
}
@media (max-width: 767px) {
  .form_group_switch {
    min-height: 36px;
  }
}

.form_group_switch_control {
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  padding-left: 0.5rem;
  padding-right: 0.3rem;
}
@media (max-width: 519px) {
  .form_group_switch_control {
    padding-right: 0.3rem;
    padding-left: 0.3rem;
  }
}

.check_switch_container_selected {
  background-color: #4080B8;
  border-color: #4080B8;
}

.check_readonly_selected {
  border-color: gray;
  background-color: gray;
}

.check_switch_selected {
  left: calc(100% - 24px);
}

.input_styled_label {
  position: absolute;
  top: 0;
  bottom: 0;
  transform: translateX(0.7rem) translateY(0);
  margin-left: 0;
  margin-right: 0;
  margin-top: auto;
  margin-bottom: auto;
  font-size: 16px;
  height: 16px;
  line-height: 1;
  padding-left: 2px;
  padding-right: 2px;
  background-color: white;
  transition: transform 0.15s ease-in;
  color: #8c8c8c;
}
@media (max-width: 767px) {
  .input_styled_label {
    font-size: 12.8px;
    transform: translateX(0.6rem) translateY(15px);
  }
}
@media android {
  .input_styled_label {
    transform: translateX(0.6rem) translateY(18px);
  }
}

.input_selected {
  border-color: #4080B8;
}
.input_state_error {
  border-color: #d9534f;
}
.input_disabled {
  border-color: #a6a6a6;
  color: #a6a6a6 !important;
}

.label_selected {
  transform: translateX(0.5rem) translateY(-5.5652173913px);
  font-size: 12.8px;
  background-color: white;
  color: #4080B8;
  z-index: 1;
  margin-top: 0;
}
@media (max-width: 767px) {
  .label_selected {
    transform: translateX(0.25rem) translateY(-6px);
  }
}
@media android {
  .label_selected {
    transform: translateX(0.5rem) translateY(-5px);
  }
}

.field_readonly {
  border-color: gray;
  color: #666666;
}

.additional_text_state_error {
  display: flex;
  color: #d9534f;
}

.input_icon {
  position: absolute;
  right: 1rem;
  top: 0.6rem;
  color: #737373;
  cursor: pointer;
}
@media (max-width: 767px) {
  .input_icon {
    font-size: 0.75em;
    top: 0.7rem;
    right: 0.6rem;
  }
}

.alert {
  display: none;
  flex-flow: row nowrap;
  background-color: #3c3c3c;
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  justify-content: center;
  align-content: center;
}
.alert__alert_message {
  color: rgba(255, 200, 0, 0.96);
  margin-right: 0.25rem;
}

.alert_light {
  border-top: 4px solid #4080B8;
  border-bottom: 4px solid #4080B8;
  background-color: transparent;
  color: #4080B8;
}
.alert_light__alert_message {
  color: #4080B8;
}

.alert_on {
  display: flex;
}

.login_form {
  align-self: center;
  width: 30rem;
}
@media (max-width: 519px) {
  .login_form {
    width: 100%;
  }
}

.block_type {
  position: absolute;
  right: 0.5rem;
  top: 0.25rem;
  font-size: 0.9rem;
  color: #8c8c8c;
  font-weight: 400;
}

.block_menu {
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  position: absolute;
  right: 0.5rem;
  top: 0.375rem;
  font-size: 1rem;
  color: #8c8c8c;
  font-weight: 400;
  text-align: center;
  width: 1.6rem;
  height: 1.6rem;
}
.block_menu__round_button {
  right: 0;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 100rem;
}

.modal_window__container {
  position: absolute;
  display: none;
  flex-flow: row;
  justify-content: center;
  align-items: center;
}
.modal_window__active {
  display: flex;
  z-index: 999;
  width: 100%;
  height: 100%;
}
.modal_window__view {
  position: relative;
  display: flex;
  flex-flow: column nowrap;
  min-width: 16rem;
  height: auto;
  min-height: 21.28rem;
  border-radius: 8px;
  border: 1px solid #adb5bd;
  margin-top: auto;
  margin-right: auto;
  margin-left: auto;
  margin-bottom: auto;
  overflow: hidden;
  background-color: white;
  box-shadow: 0 7px 24px rgba(0, 0, 0, 0.48);
}
@media (max-width: 519px) {
  .modal_window__view {
    margin-top: 0;
    width: auto;
    min-width: 100%;
    max-width: 100%;
    min-height: 100%;
    margin-bottom: -0.5rem;
  }
}
.modal_window__max_view {
  height: 640px;
}
@media (max-width: 1559px) {
  .modal_window__max_view {
    height: 520px;
  }
}
@media (max-width: 767px) {
  .modal_window__max_view {
    height: 80%;
  }
}
.modal_window__content {
  z-index: 1;
  position: relative;
  display: flex;
  flex-flow: column nowrap;
  padding: 1.65rem 0.61rem 0.25rem 0.61rem;
  background-color: white;
}
@media (max-width: 519px) {
  .modal_window__content {
    padding-top: 0;
    padding-bottom: 0.5rem;
    width: 100%;
  }
}

.modal_window_transparent {
  box-shadow: none;
  border: none;
  background-color: rgba(0, 0, 0, 0.5);
}
@media (max-width: 519px) {
  .modal_window_transparent {
    width: 100%;
    min-width: 100%;
    max-width: 100%;
    min-height: 10%;
    max-height: 200%;
    padding-bottom: 0;
    margin-bottom: 0;
  }
}

.modal_window_notify {
  width: 16rem;
}

.modal_window_search {
  width: 32rem;
  min-height: 27.2rem;
  height: 27.2rem;
  max-height: 80%;
}

.datetime_picker_content {
  padding-top: 1rem;
  padding-bottom: 1rem;
}
@media ios {
  .datetime_picker_content {
    height: 100%;
    padding: 1rem 0.5rem 1.4rem 0.5rem;
  }
}

.modal_datetime_picker {
  width: auto;
  min-height: 0;
}

.search_content {
  padding: 1.85rem 1.22rem 1.4rem 1.22rem;
  height: 100%;
  position: relative;
}
@media ios {
  .search_content {
    padding: 1rem 0.5rem 1.4rem 0.5rem;
  }
}

.modal_scroll_content {
  padding: 1.85rem 0 1.4rem 0;
  position: relative;
}
@media ios {
  .modal_scroll_content {
    padding: 0 1rem 0 1.4rem 0;
  }
}

.modal_scrollable_content {
  display: flex;
  flex-flow: column nowrap;
  flex-grow: 1;
  width: 100%;
}
@media (max-width: 519px) {
  .modal_scrollable_content {
    padding-right: 0.5rem;
    padding-left: 0.5rem;
  }
}
.modal_scrollable_content_overflowed {
  position: relative;
  top: -5%;
  height: 110%;
}

.search_results {
  flex-grow: 1;
  justify-content: flex-start;
  max-height: 85%;
  padding-left: 0.1rem;
  padding-right: 0.1rem;
}
@media ios {
  .search_results {
    max-height: 90%;
  }
}

.over_menu {
  z-index: 1000;
  overflow: hidden;
  min-height: 16rem;
}
@media (max-width: 519px) {
  .over_menu {
    min-width: 50%;
    max-width: 90%;
    min-height: 40%;
    max-height: 70%;
    margin-bottom: auto;
  }
}
.over_menu_header {
  display: flex;
  flex-flow: column nowrap;
  min-height: 60px;
  text-align: center;
}
.over_menu_content {
  padding-bottom: 2rem;
}
@media (max-width: 519px) {
  .over_menu_content {
    padding-bottom: 1.5rem;
  }
}

.modal_state_success {
  border-color: #28a745;
}
.modal_state_error {
  border-color: #d9534f;
}
.modal_state_primary {
  border-color: #4080B8;
}
.modal_state_over_menu {
  border-color: transparent;
}

.page_sheet {
  border: none;
  background-color: transparent;
}
@media ios {
  .page_sheet {
    box-shadow: 0 0 0 rgba(0, 0, 0, 0);
  }
}

.close_rect_container {
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  margin-left: 0.25rem;
  margin-right: 0.25rem;
}

.close_rect {
  position: absolute;
  top: 0.125rem;
  right: 0.5rem;
}
@media ios {
  .close_rect {
    position: absolute;
    color: #4080B8;
    font-size: 1rem;
    top: 0;
    right: auto;
    left: 0;
  }
}

.column_menu__item {
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
  align-items: center;
  padding-left: 0.125rem;
  border-bottom: thin solid rgba(0, 0, 0, 0.2);
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
}
@media (max-width: 519px) {
  .column_menu__item {
    font-size: 0.9rem;
  }
}

.item_1 {
  border-top: thin solid rgba(0, 0, 0, 0.2);
}

.modal_card_label {
  color: #4d4d4d;
  font-size: 1.1rem;
  font-weight: 500;
  padding-bottom: 1.5rem;
}
@media ios {
  .modal_card_label {
    position: relative;
    top: -1px;
  }
}

.modal_window_menu {
  width: 28.8rem;
  border: none;
  max-height: 80%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.22);
}

.column_osago_calc {
  min-height: 100%;
  background-color: white;
}

.decoration_arrow__rhombic {
  cursor: pointer;
  position: absolute;
  right: 0.7rem;
  top: -1.9rem;
  display: flex;
  flex-flow: row nowrap;
  justify-content: center;
  align-items: center;
  background-color: white;
  margin: auto;
  transform: rotate(0deg) scaleX(0) scaleY(0);
  transition: transform 0.3s ease-in;
  width: 2.8rem;
  height: 2.8rem;
  border-radius: 0.84rem;
  border: 0.25rem solid #BA637B;
}
@media (max-width: 767px) {
  .decoration_arrow__rhombic {
    width: 2.52rem;
    height: 2.52rem;
    border-radius: 0.756rem;
    border: 0.225rem solid #BA637B;
  }
}
.decoration_arrow__back_arrow {
  right: auto;
  left: 0.7rem;
  top: -0.98rem;
  width: 1.96rem;
  height: 1.96rem;
  border-radius: 0.588rem;
  border: 0.175rem solid #BA637B;
}
@media (max-width: 767px) {
  .decoration_arrow__back_arrow {
    width: 1.764rem;
    height: 1.764rem;
    border-radius: 0.504rem;
    border: 0.1575rem solid #BA637B;
  }
}
.decoration_arrow__body {
  cursor: pointer;
  display: flex;
  flex-flow: column nowrap;
  transform: rotate(-45deg);
  color: #4080B8;
  font-weight: 500;
  font-size: 1.2rem;
}
@media (max-width: 767px) {
  .decoration_arrow__body {
    font-size: 1.08rem;
  }
}
.decoration_arrow__active_indicator {
  transform: rotate(45deg) scaleX(1) scaleY(1);
  transition: transform 0.3s ease-in;
}

.back_arrow_active {
  transform: rotate(45deg) translateX(-0.25rem) translateY(-100) scaleX(1.1) scaleY(1.1);
  transition: transform 0.1s ease-out;
}

.badge {
  background-color: #a6a6a6;
  border-radius: 100rem;
  padding: 0.1875rem 0.375rem 0.15rem 0.375rem;
}
.badge_warning {
  background-color: #f2b500;
  color: white;
}

.loader_mobile {
  display: none;
  flex-flow: column nowrap;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.88);
}
.loader_mobile__container {
  display: flex;
  flex-flow: column nowrap;
}

.loader_on {
  display: flex;
}

.item_perms {
  position: absolute;
  bottom: 0;
  right: 0.25rem;
  color: #8c8c8c;
  font-size: 0.6rem;
  font-weight: 500;
  text-transform: uppercase;
}
@media (max-width: 519px) {
  .item_perms {
    font-size: 0.5rem;
  }
}

.input__files {
  position: absolute;
  left: -999999rem;
}

/*# sourceMappingURL=components.css.map */
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

transformMediaMax(mainApp, true);

