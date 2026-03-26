/*
 *Test Rules:
 *- hook-callback-format
 *- hook-deps-per-line
 *- single-argument-on-one-line
 *- simple-call-single-line
 */

import { useCallback, useState } from "react";

// Test: function-naming-convention
export const useToggle = (initialValue = false) => {
    const [value, setValue] = useState(initialValue);

    // Test: hook-callback-format (callback on new line)
    const toggleHandler = useCallback(
        () => setValue((prev) => !prev),
        [],
    );

    const setTrueHandler = useCallback(
        () => setValue(true),
        [],
    );

    const setFalseHandler = useCallback(
        () => setValue(false),
        [],
    );

    return {
        setFalse: setFalseHandler,
        setTrue: setTrueHandler,
        toggle: toggleHandler,
        value,
    };
};
