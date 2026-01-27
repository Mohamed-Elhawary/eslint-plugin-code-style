/*
Test Rules:
- function-arguments-format
- function-params-per-line
- function-call-spacing
- nested-call-closing-brackets
- curried-arrow-same-line
- opening-brackets-same-line
- block-statement-newlines
*/
// Test: function-params-per-line (each param on own line)

const Modal = ({
    children,
    isOpen,
    onClose,
    title,
}) => {
    // Test: function-arguments-format (2+ args on separate lines)
    const handleKeyDownHandler = (event) => {
        const { key } = event;

        // Test: if-statement-format
        if (key === "Escape") onClose();
    };

    // Test: block-statement-newlines
    const handleBackdropClickHandler = (event) => {
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
            onClick={handleBackdropClickHandler}
            onKeyDown={handleKeyDownHandler}
        >
            <div className="modal-content">
                <div className="modal-header">
                    <h2>{title}</h2>
                    <button
                        type="button"
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

export { Modal };
