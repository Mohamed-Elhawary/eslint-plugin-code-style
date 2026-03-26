// Test: index-export-style (shorthand exports in index files)

export { formatCurrency, formatDate, formatNumber } from "./formatters";
export {
    cssConfig,
    getLinkColorSxHandler,
    getLinkStylesHandler,
    getSxPropExampleHandler,
    htmlTemplate,
    inlineSpread,
    muiTheme,
    simpleConfig,
} from "./theme-config";
export { isEmail, isEmpty, isNumber } from "./validators";
