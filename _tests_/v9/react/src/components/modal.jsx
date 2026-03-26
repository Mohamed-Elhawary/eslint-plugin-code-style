/*
 *Test Rules:
 *- function-arguments-format
 *- function-params-per-line
 *- function-call-spacing
 *- nested-call-closing-brackets
 *- curried-arrow-same-line
 *- opening-brackets-same-line
 *- block-statement-newlines
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

    // Test: jsx-parentheses-position
    return (
        <div
            className="modal-backdrop"
            role="dialog"
            onClick={backdropClickHandler}
            onKeyDown={closeOnKeyDownHandler}
        >
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button
                        type={buttonTypeData.button}
                        onClick={onClose}
                    >
                        X
                    </button>
                </div>
                <div className="modal-body">{children}</div>
            </div>
        </div>
    );
};
