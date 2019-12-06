// const remove_blank_lines_regexp = /^\s*\n+/mig; //Clean file of blanks lines
const remove_blank_lines_string = `(^\\s*\\n){2,}`;
const remove_blank_lines_regexp = /(^\s*\n){2,}/gim; //Clean file of blanks lines
const take_import_line_regexp =  /^\s*(import\s*(\w*\W*[^;]*)\s*(from\s+(.[^;]+));*)/mig; //Get imports lines;
const take_import_without_form_regexp =  /^\s*(import\s*(\w*\W*[^;]*)\s*(from\s+(.[^;]+))*;*)/mig; //Get imports lines;
const variable_expression_regexp = /\$(\D[^;:]+):\s*(([-]*\d*\.*\d*)(.*);)/ig;
const variable_expression_string = '\\$(\\D[^;:]+):\\s*((\\d*\\.*\\d*)(.*);)';

const property_expression_regexp = /\s*(\D[^;:]+):\s*(([-]*\d*\.*\d*)(.*);)/ig;

const property_expression_string = '\\s*(\\D[^;:]+):\\s*((\\d*\\.*\\d*)(.*);)';
const change_dash_to_underscore = /(\w)(-)(\w)/ig;
const remove_excess_css_directives = /!default|!important/ig;
const remove_excess_scss_directives = /[$#{}]|!default|!important/ig;
const remove_excess_colors_directives = /[$]|\s*!default|\s*!important/ig;
const class_name_regexp = /\.(.+)\s+\{/ig;
const class_name_string = '\\.(.+)\\s+\\{';
const style_expression_regexp = /(\D[^;:}]+):\s*((\d*\.*\d*)(.*)(\.;|}|{))/ig;
const style_expression_string = '(\\D[^;:\\.}]+):\\s*((\\d*\\.*\\d*)(.+));';
const function_flow_string = 'const\\s+\\w+:\\s*\\(\\s*\\)\\s*=>\\s*React\\$Node\\s*=\\s*\\(.+\\)\\s*.+{(\\s*)';
const function_flow_regexp = new RegExp(function_flow_string, 'gi');
const default_function_string = '(const\\s+\\w+\\s*=\\s*\\({)(.+)(}\\)\\s*.+{)(\\s*)';
const flow_tag_string = `\\s*\\/\\*+\\s*\\*\\s+@format\\s+\\*\\s+@flow\\s*\\*\\/`;
const flow_tag_regexp = new RegExp(flow_tag_string, 'gi');
const tag_name_string = '((\\w+,*\\s*)*\\s*)\\s+\\{';
// @media (max-width: 991px) {
// .header__header_line {
//         padding-right: 0.5rem;
//         padding-left: 0.5rem;
//         margin-left: 0;
//         margin-right: 0;
//     }
// }
const media_expression_string = `\\@media\\s+\\((max-(\\w+)):\\s+(\\d+)px\\)\\s*{(\\s*(${class_name_string}(\\s*.+\\s*;)+\\s*}\\s*)+\\s*)}`;
const media_platform_string = `\\@platform\\s+\\((\\w+)\\)\\s*{(\\s*(${class_name_string}(\\s*.+\\s*;)+\\s*}\\s*)+\\s*)}`;
const calc_expression_string = `calc\\((.+)\\)`;

module.exports = {
    remove_blank_lines_regexp,
    take_import_line_regexp,
    variable_expression_regexp,
    variable_expression_string,
    change_dash_to_underscore,
    remove_excess_scss_directives,
    class_name_regexp,
    class_name_string,
    style_expression_regexp,
    style_expression_string,
    property_expression_regexp,
    property_expression_string,
    remove_excess_css_directives,
    media_expression_string,
    function_flow_string,
    flow_tag_string,
    flow_tag_regexp,
    calc_expression_string,
    media_platform_string,
    tag_name_string,
    remove_excess_colors_directives,
    default_function_string,
    take_import_without_form_regexp,
};
