const { transformVariables, transformStyles, transformMediaMax, transformColors, transformCustomFontIcons,
    getSvgPathsFromRequires } = require('./styles');
const {initImports, cutImport, findModule, deleteModuleImport} = require('./imports');

const {
    exportConnectionTransform, importNotRequired, historyToNavigationTransform, removeFormTags, addFlowTags,
    platformTransforms, changePlatform, createAppJs, removeFunctionCall, changeTagName, addScreenDimensionListener,
    replaceStyleAfterFlowFunction, addNavigationRoutePropIntoFlowFunction, removeTagsWithBody, replaceHtmlForWithFocus
} = require('./codeTransformations');

let mainApp = `

@use "variables" as *;
@use "colors" as *;
.horizontal_container {
  position: relative;
  display: flex;
  flex-flow: row nowrap;
  left: 0;
  transform: translateX(0)  translateY(0);
  transition: transform 0.5s ease-in;
}
.container {
  display: flex;
  flex-flow: column nowrap;
  flex-grow: 1;
  padding-right: 0;
  padding-left: 0;
  width: 100%;

  &__unlimited {
    width: 100%;

    padding-right: $standard_offset;
    padding-left: $standard_offset;

    @media (max-width: $screen-sm-max) {
      width: 100%;
      padding-right: $small_offset;
      padding-left: $small_offset;
    }
  }

  &__limited {
    display: flex;
    flex-flow: column nowrap;
    width: 86%;
    margin-left: auto;
    margin-right: auto;
    padding-top: $standard_offset * 1.8;
    padding-bottom: $standard_offset  * 1.8;
    overflow-y: auto;
    @media (max-width: $screen-sm-max) {
      width: 100%;
      padding-right: $standard_offset;
      padding-left: $standard_offset;
    }

    @media (max-width: $screen-xs-max) {
      padding-top: $standard_offset;
      padding-bottom: $standard_offset;
      padding-right: $small_offset;
      padding-left: $small_offset;
    }
  }

  &_background_grey {
    background-color: $offside_back_color;
  }

  &__view {
    display: flex;
    flex-flow: column nowrap;
    width: 100%;
    flex-grow: 0;
    flex-shrink: 0;
  }
}

.menu_after_header {
  display: flex;
  flex-flow: row nowrap;
  overflow-x: scroll;
}

.view_position {
  @for $i from 1 through 10 {
    &_#{$i} {
      transform: translateX(-100% * ($i - 1));
    }
  }
}

`;

// transformVariables(variables);
// transformStyles(str);
// transformMediaMax(str, 'media');
// addScreenDimensionListener(mainApp);
// replaceStyleAfterFlowFunction(str);

// let str_3 = 'borderColor 1000 ease-in, backgroundColor 1000 ease-in';

// removeFormTags(mainApp, ['form']);
transformStyles(mainApp);

