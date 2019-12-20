const { transformVariables, transformStyles, transformMediaMax, transformColors, transformCustomFontIcons,
    getSvgPathsFromRequires } = require('./styles');
const {initImports, cutImport, findModule, deleteModuleImport} = require('./imports');

const {
    exportConnectionTransform, importNotRequired, historyToNavigationTransform, removeFormTags, addFlowTags,
    platformTransforms, changePlatform, createAppJs, removeFunctionCall, changeTagName, addScreenDimensionListener,
    replaceStyleAfterFlowFunction, addNavigationRoutePropIntoFlowFunction, removeTagsWithBody, replaceHtmlForWithFocus
} = require('./codeTransformations');

let mainApp = `

export const alfastrah = require('../img/brands/alfastrah.svg');
export const alfastrah_png = require('../img/brands/alfastrah.png');

export const dcard = require('../img/brands/dcard.svg');
export const dcard_png = require('../img/brands/dcard.png');

export const ergo = require('../img/brands/ergo.svg');
export const ergo_png = require('../img/brands/ergo.png');

export const ic_angara = require('../img/brands/ic-angara.svg');
export const ic_angara_png = require('../img/brands/ic-angara.png');

export const ingos = require('../img/brands/ingos.svg');
export const ingos_png = require('../img/brands/ingos.png');

export const makc = require('../img/brands/makc.svg');
export const makc_png = require('../img/brands/makc.png');

export const nasko = require('../img/brands/nasko.svg');
export const nasko_png = require('../img/brands/nasko.png');

export const renins = require('../img/brands/renins.svg');
export const renins_png = require('../img/brands/renins.png');

export const renins_wide = require('../img/brands/renins_wide.svg');
export const renins_wide_png = require('../img/brands/renins_wide.png');

export const reso = require('../img/brands/reso.svg');
export const reso_png = require('../img/brands/reso.png');

export const rgs = require('../img/brands/rgs.svg');
export const rgs_png = require('../img/brands/rgs.png');

export const sngi = require('../img/brands/sngi.svg');
export const sngi_png = require('../img/brands/sngi.png');

export const soglasie = require('../img/brands/soglasie.svg');
export const soglasie_png = require('../img/brands/soglasie.png');

export const tinkoffinsurance = require('../img/brands/tinkoffinsurance.svg');
export const tinkoffinsurance_png = require('../img/brands/tinkoffinsurance.png');

export const ugsk = require('../img/brands/ugsk.svg');
export const ugsk_png = require('../img/brands/ugsk.png');

export const vsk = require('../img/brands/vsk.svg');
export const vsk_png = require('../img/brands/vsk.png');
export const vsk_path = '../img/brands/vsk.svg';

export const zettains = require('../img/brands/zettains.svg');
export const zettains_png = require('../img/brands/zettains.png');

export const клувер = require('../img/brands/клувер.svg');
export const клувер_png = require('../img/brands/клувер.png');


`;

// transformVariables(variables);
// transformStyles(str);
// transformMediaMax(str, 'media');
// addScreenDimensionListener(mainApp);
// replaceStyleAfterFlowFunction(str);

// let str_3 = 'borderColor 1000 ease-in, backgroundColor 1000 ease-in';

// removeFormTags(mainApp, ['form']);
getSvgPathsFromRequires(mainApp);

