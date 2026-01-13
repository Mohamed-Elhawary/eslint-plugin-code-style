/*
Test Rules:
- hook-callback-format
- hook-deps-per-line
- function-naming-convention (camelCase for hooks)
- arrow-function-simplify
*/

import { useCallback, useState } from "react";

// Test: function-naming-convention (camelCase for hooks)
const useCounter = (initialValue = 0) => {
    const [count, setCount] = useState(initialValue);

    // Test: hook-callback-format (callback on new line)
    const increment = useCallback(
        () => setCount((prev) => prev + 1),
        [setCount],
    );

    const decrement = useCallback(
        () => setCount((prev) => prev - 1),
        [setCount],
    );

    // Test: hook-deps-per-line (deps on same line when 2 or fewer)
    const reset = useCallback(
        () => setCount(initialValue),
        [initialValue, setCount],
    );

    // Test: arrow-function-simplify (implicit return for simple expressions)
    const getCountHandler = () => count;

    return {
        count,
        decrement,
        getCount: getCountHandler,
        increment,
        reset,
    };
};

export { useCounter };
