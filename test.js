const { transformVariables, transformStyles, transformMediaMax } = require('./styles');
const {initImports, cutImport, findModule} = require('./imports');

const {
    exportConnectionTransform, importNotRequired, historyToNavigationTransform, removeFormTags, addFlowTags,
    platformTransforms, changePlatform, createAppJs, removeFunctionCall, changeTagName, addScreenDimensionListener,
    replaceStyleAfterFlowFunction
} = require('./codeTransformations');

let mainApp = `
/**
 * @format
 * @flow
 */
import React from 'react';
import { withNavigation } from 'react-navigation';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import PageHeader from '../components/PageHeader';
import { PageContainer } from '../containers/PageContainers';
import * as userActions from '../reducers/user';
import * as loginActions from '../reducers/login';
import * as appActions from '../reducers/app';
import { getUserProfile } from '../helpers/authorization';
import SimpleButton from '../elements/SimpleButton';
import { urls } from '../urls';
import { redirect_if_not_logged } from '../settings';
import { Div, Redirect, Link, TextTag } from '../platformTransforms';
import { Screen } from '../platformTransforms';
// import useScreenDimensions from '../platformTransforms/Screen';

const Main: () => React$Node = ({ appState, userState, loginState, actions, navigation, ...props }) => {
    const login_state = !userState.is_authenticated ? 'You are NOT authorized' : 'You are authorized';
    let body = userState.is_authenticated ? (
        <>
            <Div tagType={'div'} className={'container container_background_grey'}>
                <Div tagType={'div'} className={'container__limited'}>
                    <SimpleButton onPress={(event) => getUserProfile(event)} title={'getUserProfile'} />
                    <TextTag tagType={'h1'}>{'Mobile'}</TextTag>
                </Div>
            </Div>
        </>
    ) : (
        <>
            {appState.platform === 'web' ? (
                <Div tagType={'div'} className={'container container_background_grey'}>
                    <Div tagType={'div'} className={'container__limited'}>
                        <TextTag tagType={'h1'}>{login_state}</TextTag>
                        <Link to={urls.login.path}>
                            {'Goto Login'}
                        </Link>
                    </Div>
                </Div>
            ) : (
                <Div tagType={'div'} className={'container container_background_grey'}>
                    <Div tagType={'div'} className={'container__limited'}>
                        <TextTag tagType={'h1'}>{'Mobile 2'}</TextTag>
                        <TextTag tagType={'h1'}>{appState.screen_data.width}</TextTag>
                    </Div>
                </Div>
            )}
        </>
    );
    if (appState.platform !== 'web' && userState.checkin && !userState.is_authenticated && redirect_if_not_logged) {
        body = (
            <>
                <Redirect to={urls.login.path} />
            </>
        );
    }
    return (
        <>
            <PageHeader avatar_url={'/agent-avatar-change'} {...props} />
            {body}
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
export default withNavigation(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    )(Main),
);

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

str_3.replace(/\s*(.[^,]+)(,|$)/gi, (match, p1,p2,p3)=> {
    console.log(match);
    console.log('p1=', p1);
});

