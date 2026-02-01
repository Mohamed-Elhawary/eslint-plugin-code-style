/*
 *Test Rules:
 *- hook-callback-format
 *- hook-deps-per-line
 *- single-argument-on-one-line
 *- simple-call-single-line
 */

import { useCallback, useState } from "react";

// Test: function-naming-convention
const useToggle = (initialValue = false) => {
    const [value, setValue] = useState(initialValue);

    // Test: hook-callback-format (callback on new line)
    const toggle = useCallback(
        () => setValue((prev) => !prev),
        [],
    );

    const setTrue = useCallback(
        () => setValue(true),
        [],
    );

    const setFalse = useCallback(
        () => setValue(false),
        [],
    );

    return {
        setFalse,
        setTrue,
        toggle,
        value,
    };
};

export { useToggle };
