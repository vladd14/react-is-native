const { transformVariables, transformStyles, transformMediaMax, transformColors } = require('./styles');
const {initImports, cutImport, findModule} = require('./imports');

const {
    exportConnectionTransform, importNotRequired, historyToNavigationTransform, removeFormTags, addFlowTags,
    platformTransforms, changePlatform, createAppJs, removeFunctionCall, changeTagName, addScreenDimensionListener,
    replaceStyleAfterFlowFunction
} = require('./codeTransformations');

let mainApp = `

$black:   #000    !default;
$blue:    #007bff !default;
$indigo:  #6610f2 !default;
$purple:  #6f42c1 !default;
$pink:    #e83e8c !default;
$red:     #dc3545 !default;
$orange:  #fd7e14 !default;
$yellow:  #ffc107 !default;
$green:   #28a745 !default;
$teal:    #20c997 !default;
$cyan:    #17a2b8 !default;

$gray-100: #f8f9fa !default;
$gray-200: #e9ecef !default;
$gray-300: #dee2e6 !default;
$gray-400: #ced4da !default;
$gray-500: #adb5bd !default;
$gray-600: #6c757d !default;
$gray-700: #495057 !default;
$gray-800: #343a40 !default;
$gray-900: #212529 !default;

$danger:        $red !default;
$warning:       $yellow !default;
$warning_new:   darken($warning, 4%);

$brand-color: darken(rgba(255, 50, 78, 0.7), 33%);

$offside_back_color: darken(rgb(100, 50, 30), 7%);

/* Стандартный цвет отображения шрифта */
$default-text-color: lighten(black, 30%);

$default-link-color: #337ab7;
$default-link-color-hover: #23527c;

/* Стандартный цвет border */
//$default-border-color:#ddd;
$default-border-color: rgba(0, 0, 0, 0.16);

$brand-primary:         darken(#428bca, 6.5%);
$brand-success:         #5cb85c;
$brand-info:            #5bc0de;
$brand-warning:         #f0ad4e;
$brand-danger:          #d9534f;

$state-default:                 #ccc;
$state-primary:                 $brand-primary;
$state-not-primary:             lighten($default-text-color, 35%);
$state-success:                 $brand-success;
$state-info:                    $brand-info;
$state-warning:                 $brand-warning;
$state-attention:               rgba(255, 190, 0, 1);
$state-danger:                  $brand-danger;
$state-error:                   $state-danger;

$state-muted: darken($state-not-primary,10%);

//from bootstarp
$gray-700: #495057 !default;
$text-sub-info:                 $gray-700;

$main_bg_color_gray: #f1f1f1;

//Pantone color of 2017 year
$greenery_color_rgb: rgb(136,176,75);
$greenery_color: #88B04B;

//Pantone color of 2012 year
$tangerine_tango_rgb: rgb(226,73,47);
$tangerine_tango: $tangerine_tango_rgb;

//@main_border_color: #d7df23;
$border_color_mid_yellow: #d7df23;

$default_border_color_bst: rgba(0, 0, 0, 0.125);

//Color footer
$container-cart-bg: rgba(237,237,242, 1);

//bso types

$color_casco: #3A56A2;
$color_osago: #BA637B;
$color_dcard: #8B8B8B;
$color_ns: #9532A2;
$color_real_estate: #E5C200;
$color_property: #C48944;
$color_green_card: #77B74F;
$color_vzr: #67A1FF;
$color_dms: #26846F;

$green:         #28a745;
$success:       $green !default;
$color_receipt: $success;

  //////////////////////////////////////////
 // Цветовая индикация для состояний БСО //
//////////////////////////////////////////

$bso-clean: rgba(255, 255, 255, 1);
$bso-issued: rgba(220, 255, 200, 1);
$bso-returned: rgba(233, 255, 233, 1);
$bso-transferred: rgba(235, 235, 235, 1);
$bso-broken: rgba(255, 235, 235, 1);
$bso-lost: rgba(255, 220, 180, 1);
$bso-returned-from-ins: rgba(255, 180, 180, 1);
$bso-transferred-clean: rgba(190, 190, 190, 1);
$bso-preparing-for-transfer: rgba(180, 255, 255, 1);

`;


// transformVariables(variables);
// transformStyles(str);
// transformMediaMax(str, 'media');
// addScreenDimensionListener(mainApp);
// replaceStyleAfterFlowFunction(str);

// let str_3 = 'borderColor 1000 ease-in, backgroundColor 1000 ease-in';

// removeFormTags(mainApp, ['form']);
transformColors(mainApp);

