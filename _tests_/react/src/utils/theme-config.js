/*
 *Test Rules:
 *- object-property-per-line (multi-line template literal should NOT be collapsed)
 *This file tests that objects with multi-line template literals
 *are allowed to remain multi-line, even if they have fewer than 2 properties.
 */
// Test: object with multi-line template literal value should NOT trigger collapse

import { variantData } from "@/data";

export const muiTheme = {
    components: {
        MuiCssBaseline: {
            styleOverrides: `
                @font-face {
                    font-display: swap;
                    font-family: 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell';
                    font-style: normal;
                    font-weight: 400;
                }
            `,
        },
    },
};

// Test: object with single-line template literal CAN be collapsed (valid single line)
export const simpleConfig = { name: `app-${Date.now()}` };

// Test: nested object with multi-line template should stay multi-line
export const cssConfig = {
    globalStyles: {
        body: `
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        `,
    },
};

// Test: mixed - one property with multi-line template, should stay multi-line
export const htmlTemplate = {
    template: `
        <html>
            <head>
                <title>Test</title>
            </head>
            <body>
                <div id="root"></div>
            </body>
        </html>
    `,
};

// Test: helper function for spread test
export const getLinkColorSxHandler = (color, { palette }) => ({
    color: palette[color],
    textDecoration: "none",
});

// Test: spread element with multi-line function call should NOT be collapsed
export const getLinkStylesHandler = (theme) => ({
    ...getLinkColorSxHandler(
        variantData.primary,
        theme,
    ),
});

// Test: spread with single-line call CAN be collapsed
export const inlineSpread = {
    ...getLinkColorSxHandler(
        variantData.primary,
        {},
    ),
};

// Test: arrow function returning object with spread (like MUI sx prop pattern)
export const getSxPropExampleHandler = (theme) => ({
    ...getLinkColorSxHandler(
        "whiteGrey",
        theme,
    ),
});
