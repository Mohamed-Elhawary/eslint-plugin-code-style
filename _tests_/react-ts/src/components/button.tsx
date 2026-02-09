/*
 *Test Rules:
 *- code-style/classname-multiline (multiline classes: "..." in JSX, `...` in variables/objects)
 *- code-style/component-props-destructure (props must be destructured)
 *- code-style/component-props-inline-type (inline type annotation)
 *- code-style/jsx-prop-naming-convention (camelCase for event handlers, data-* lowercase)
 *- code-style/jsx-closing-bracket-spacing (no space before closing bracket)
 *- code-style/jsx-simple-element-one-line (simple elements on single line)
 *- code-style/jsx-string-value-trim (no leading/trailing whitespace in string values)
 *- code-style/no-empty-lines-in-jsx (no empty lines between JSX attributes)
 */

import { ButtonVariantEnum, InputTypeEnum } from "@/enums";
import { appStrings } from "@/strings";
import type { ButtonVariantType } from "@/types";

export const Button = ({
    className = "",
    label,
    onClick,
    variant = ButtonVariantEnum.PRIMARY,
}: {
    className?: string,
    label: string,
    onClick: () => void,
    variant?: ButtonVariantType,
}) => {
    const variantClasses = {
        danger: "btn-danger",
        primary: "btn-primary",
        secondary: "btn-secondary",
    };

    const _appName = appStrings.common.loading;

    const buttonClasses = [variantClasses[variant], className].filter(Boolean).join(" ");

    return (
        <button
            className={buttonClasses}
            type={InputTypeEnum.BUTTON}
            onClick={onClick}
        >
            {label}
        </button>
    );
};
