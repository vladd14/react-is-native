const { transformVariables, transformStyles, transformMediaMax } = require('./styles');
const {initImports, cutImport, findModule} = require('./imports');

const {
    exportConnectionTransform, importNotRequired, historyToNavigationTransform, removeFormTags, addFlowTags,
    platformTransforms, changePlatform, createAppJs, removeFunctionCall, changeTagName, addScreenDimensionListener,
    replaceStyleAfterFlowFunction
} = require('./codeTransformations');

let mainApp = `
import React, { useState, useEffect } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { sendRequest } from '../helpers/network';
import PageHeader from '../components/PageHeader';
import SimpleButton from '../elements/SimpleButton';
import SectionDelimiterWithLabel from '../components/SectionDelimiterWithLabel';
import ActionLink from '../components/ActionLink';
import * as userActions from '../reducers/user';
import * as loginActions from '../reducers/login';
import * as appActions from '../reducers/app';
import { getUserProfile } from '../helpers/authorization';
import { translator } from '../helpers/translate';
import { urls, requests } from '../urls';
import { space_symbol } from '../helpers/constants';
import { PageContainer, PageGlobalContainer } from '../containers/PageContainers';

const Login = ({ appState, userState, loginState, actions, history, ...props }) => {
    const [additional_class, setAdditionalClass] = useState({
        control_1: '',
        control_2: '',
    });
    const parseErrors = (errors) => {
        for (let key in errors) {
            let error_message = '';
            if (errors.hasOwnProperty(key) && Array.isArray(errors[key])) {
                errors[key].forEach((element, index) => {
                    if (index) {
                        error_message += '\\n';
                    }
                    error_message += element;
                });
            }
            if (error_message.length) {
                actions.setLoginState({
                    name: key || '',
                    state_error: true,
                    additional_text: error_message,
                });
            }
        }
    };
    const requestCallBack = (receivedData) => {
        if (receivedData && receivedData.data) {
            if (receivedData.data.hasOwnProperty('errors')) {
                return parseErrors(receivedData.data.errors);
            }

            const { user_auth_id, token } = receivedData.data;

            if (user_auth_id) {
                actions.setUserAuthId(user_auth_id);
            }
            if (token) {
                actions.setAuthToken(token);
                getUserProfile(appState, actions).then(() => {
                    actions.clearLoginValues();
                    history.push(urls.main.path);
                });
            }
        }
    };
    const handleSubmit = (event) => {
        event.preventDefault();
        console.log('submit form');
        const { url, method } = requests.login;
        const sendData = {
            email: loginState.email.value,
            password: loginState.password.value,
        };
        sendRequest(url, sendData, requestCallBack, method, appState, actions);
    };
    const handleEnterPress = (event) => {
        if (event && event.hasOwnProperty('key') && event.key === 'Enter') {
            handleSubmit(event);
        }
    };
    const handleEmail = (event) => {
        if (event && event.target && event.target.hasOwnProperty('value')) {
            actions.setLoginValue({
                name: 'email',
                value: event.target.value,
            });
        }
    };
    const handlePassword = (event) => {
        if (event && event.target && event.target.hasOwnProperty('value')) {
            actions.setLoginValue({
                name: 'password',
                value: event.target.value,
            });
        }
    };
    const handleClick = (event) => {
        handleSubmit(event);
    };
    const handleFocus_1 = (event) => {
        // setAdditionalClass('input_focused');

        setAdditionalClass({ ...additional_class, ...{ control_1: 'selected' } });
    };
    const handleBlur_1 = (event) => {
        // setAdditionalClass('');
        setAdditionalClass({ ...additional_class, ...{ control_1: '' } });
    };
    const handleFocus_2 = (event) => {
        // setAdditionalClass('input_focused');
        setAdditionalClass({ ...additional_class, ...{ control_2: 'selected' } });
    };
    const handleBlur_2 = (event) => {
        // setAdditionalClass('');
        setAdditionalClass({ ...additional_class, ...{ control_2: '' } });
    };
    return (
        <>
            <PageGlobalContainer className={'container container_background_grey'}>
            <PageHeader avatar_url={'/agent-avatar-change'} human_page_name={'Вход'} {...props} />
                <PageContainer className={'container container_background_grey'}>
                <div className={'container__limited'}>
                    <form>
                        <div className={'d-flex justify-content-center align-items-center'}>
                            <div className={'card client-search-form fixed-width'}>
                                <div className={'card-body justify-content-between'}>
                                    <SectionDelimiterWithLabel>
                                        {translator('Введите e-mail и пароль', appState.language)}
                                    </SectionDelimiterWithLabel>
                                    <div>
                                        {/*<SimpleCustomField*/}
                                        {/*    placeholder={'e-mail'}*/}
                                        {/*    type={appState.platform !== 'web' ? 'email-address' : 'email'}*/}
                                        {/*    {...loginState.email}*/}
                                        {/*    onChange={(event) => handleEmail(event)}*/}
                                        {/*    onKeyDown={(event) => handleEnterPress(event)}*/}
                                        {/*/>*/}
                                        {/*<SimpleCustomField*/}
                                        {/*    type={'password'}*/}
                                        {/*    placeholder={translator('Пароль', appState.language)}*/}
                                        {/*    {...loginState.password}*/}
                                        {/*    onChange={(event) => handlePassword(event)}*/}
                                        {/*    onKeyDown={(event) => handleEnterPress(event)}*/}
                                        {/*/>*/}
                                        <div className={'form_group form_group_styled'}>
                                            <label
                                                htmlFor={'email_id'}
                                                className={[
                                                    'form_group__label',
                                                    'input_styled_label',
                                                    \`label_{additional_class.control_1}\`,
                                                ].join(space_symbol)}>
                                                {'e-mail'}
                                            </label>
                                            <div
                                                className={[
                                                    'form_group__control_container',
                                                    \`input_{additional_class.control_1}\`,
                                                ].join(space_symbol)}>
                                                <div
                                                    className={[
                                                        \`form_group__control input_{additional_class.control_1}\`,
                                                    ].join(space_symbol)}>
                                                    <input
                                                        id={'email_id'}
                                                        className={'form_group__input'}
                                                        type={appState.platform !== 'web' ? 'email-address' : 'email'}
                                                        value={loginState.email.value}
                                                        // placeholder={'e-mail'}
                                                        required={'required'}
                                                        onKeyDown={(event) => handleEnterPress(event)}
                                                        onChange={(event) => handleEmail(event)}
                                                        onFocus={(event) => handleFocus_1(event)}
                                                        onBlur={(event) => handleBlur_1(event)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <span className={'grp-addon'}>{loginState.email.additional_text}</span>
                                        <div className={'form_group form_group_styled'}>
                                            <label
                                                htmlFor={'password_id'}
                                                className={[
                                                    'form_group__label',
                                                    'input_styled_label',
                                                    \`label_{additional_class.control_2}\`,
                                                ].join(space_symbol)}>
                                                {translator('Пароль', appState.language)}
                                            </label>
                                            <div
                                                className={[
                                                    'form_group__control_container',
                                                    \`input_{additional_class.control_2}\`,
                                                ].join(space_symbol)}>
                                                <div
                                                    className={[
                                                        \`form_group__control input_{additional_class.control_2}\`,
                                                    ].join(space_symbol)}>
                                                    <input
                                                        id={'password_id'}
                                                        className={'form_group__input'}
                                                        type={'password'}
                                                        value={loginState.password.value}
                                                        // placeholder={'password'}
                                                        required={'required'}
                                                        onKeyDown={(event) => handleEnterPress(event)}
                                                        onChange={(event) => handlePassword(event)}
                                                        onFocus={(event) => handleFocus_2(event)}
                                                        onBlur={(event) => handleBlur_2(event)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <span className={'grp-addon'}>{loginState.email.additional_text}</span>
                                        <ActionLink to={urls.main.path}>
                                            {translator('Зарегистрироваться', appState.language)}
                                        </ActionLink>
                                    </div>
                                    <div className={'text-centered extern-offset bottom st-x2'}>
                                        <SimpleButton
                                            onClick={(event) => handleClick(event)}
                                            title={translator('Войти  ', appState.language)}
                                            additional_class={'small size-changing blue'}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
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
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Login));


`;

let variables = `
//screens variables
$screen-xsm-min:            0;
$screen-xs-min:             520px;
$screen-sm-min:             768px;
$screen-md-min:             992px;
$screen-lg-min:             1200px;
$screen-lh-min:             1560px;
$screen-hd-min:             1920px;
$screen-xsm-max:            ($screen-xs-min - 1);
$screen-xs-max:             ($screen-sm-min - 1);
$screen-sm-max:             ($screen-md-min - 1);
$screen-md-max:             ($screen-lg-min - 1);
$screen-lg-max:             ($screen-lh-min - 1);
$screen-lh-max:             ($screen-hd-min - 1);

//default offset variables
$small_single_offset: 0.06rem;
$small_ultra_offset: 0.06rem;
$small_extra_offset: 0.125rem;
$small_offset: 0.25rem;
$standard_offset: 0.5rem;

//changing name type
$offset_small_single: $small_single_offset;
$offset_small_ultra: $small_ultra_offset;
$offset_small_extra: $small_extra_offset;
$offset_small: $small_offset;

$border-width:                      1px !default;
$border-radius:                     0.25rem !default;
$card-border-width:                 $border-width !default;
$card-border-radius:                $border-radius !default;
$card-border-color:                 rgba(0,0,0, 0.125) !default;
$card-inner-border-radius:          calc(#{$card-border-radius} - #{$card-border-width}) !default;

$bootstrap_horizontal_offset_st: 1.25rem;
$bootstrap_vertical_offset_st: 0.75rem;

$bootstrap_horizontal_offset_fields: $bootstrap_vertical_offset_st;
$bootstrap_vertical_offset_fields: $bootstrap_vertical_offset_st / 2;

// form bootstrap _variables
$border-radius: 0.25rem;
$bootstrap_border_radius: $border-radius;
$default_border_radius: $bootstrap_border_radius;

//the coefficient for get avatar size smaller with mobile view
$person_photo_smaller_k: 0.8;
$place_holder_height: 5rem;

$photo_width: 4.4rem;

$panel_min_width: 190px;
$panel_border_radius: $border-radius;

$round_button_container_height: 5.4rem;
$round_button_container_height_xs_scalar: 0.84;
$round_button_container_height_xs: $round_button_container_height * $round_button_container_height_xs_scalar;

$person_content_top_offset: 1.7rem;
$person_default_font_size: 1.05rem;
$person_default_font_weight: 500;
$person_extra_info_font_size: 0.75rem;

//Buttons menu
$default_menu_width: 0.875rem;
$logo_width: $photo_width * $person_photo_smaller_k;
$page_title_font_size: 1.2rem;
`;

let str = `
/**
 * @format
 * @flow
 */
import React from 'react';
import { Div, TextTag } from '../platformTransforms';

const SectionDelimiterWithLabel: () => React$Node = ({ ...props }) => {
    const style = 'section-delimiter-with-label subsection';
    return (
        <Div tagType={'div'} className={style}>
            <TextTag tagType={'span'}></TextTag>
            <TextTag tagType={'label'}>{props.children}</TextTag>
            <TextTag tagType={'span'}></TextTag>
        </Div>
    );
};
export default SectionDelimiterWithLabel;

`;

// transformVariables(variables);
// transformStyles(str);
// transformMediaMax(str, 'media');
// addScreenDimensionListener(mainApp);
// replaceStyleAfterFlowFunction(str);

let str_3 = 'borderColor 1000 ease-in, backgroundColor 1000 ease-in';

removeFormTags(mainApp, ['form']);

