/*
 *Test Rules:
 *- function-arguments-format
 *- function-params-per-line
 *- function-call-spacing
 *- nested-call-closing-brackets
 *- curried-arrow-same-line
 *- opening-brackets-same-line
 *- block-statement-newlines
 *- tailwindcss/classnames-order
 */
// Test: function-params-per-line (each param on own line)

import { buttonTypeData } from "@/data";
import { appStrings } from "@/strings";

export const Modal = ({
    children,
    isOpen,
    onClose,
    title,
}) => {
    // Test: function-arguments-format (2+ args on separate lines)
    const closeOnKeyDownHandler = (event) => {
        const { key } = event;

        // Test: if-statement-format
        if (key === appStrings.escape) onClose();
    };

    // Test: block-statement-newlines
    const backdropClickHandler = (event) => {
        const {
            currentTarget,
            target,
        } = event;

        if (target === currentTarget) onClose();
    };

    if (!isOpen) return null;

    // Test: jsx-parentheses-position, tailwindcss/classnames-order
    return (
        <div
            role="dialog"
            className="
                fixed
                inset-0
                flex
                items-center
                justify-center
                bg-black/50
            "
            onClick={backdropClickHandler}
            onKeyDown={closeOnKeyDownHandler}
        >
            <div
                className="
                    w-full
                    max-w-md
                    rounded-lg
                    bg-white
                    p-6
                    shadow-xl
                "
            >
                <div
                    className="
                        mb-4
                        flex
                        items-center
                        justify-between
                    "
                >
                    <h2 className="text-xl font-bold">{title}</h2>
                    <button
                        className="text-gray-500 hover:text-gray-700"
                        type={buttonTypeData.button}
                        onClick={onClose}
                    >
                        X
                    </button>
                </div>
                <div className="text-gray-600">{children}</div>
            </div>
        </div>
    );
};
