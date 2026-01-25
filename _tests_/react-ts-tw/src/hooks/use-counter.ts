/*
Test Rules:
- code-style/hook-callback-format
- code-style/hook-deps-per-line
- code-style/opening-brackets-same-line (preserves TypeScript generics like useState<number>)
- code-style/component-props-inline-type (return type must be interface reference)
- TypeScript types in hooks
*/
// Test: TypeScript hook with interface return type and generics preserved

import { useCallback, useState } from "react";

import type { UseCounterReturnInterface } from "@/interfaces";

export const useCounter = (initialValue: number = 0): UseCounterReturnInterface => {
    const [count, setCount] = useState<number>(initialValue);

    const incrementHandler = useCallback(
        () => {
            setCount((prev) => prev + 1);
        },
        [],
    );

    const decrementHandler = useCallback(
        () => {
            setCount((prev) => prev - 1);
        },
        [],
    );

    const resetHandler = useCallback(
        () => {
            setCount(initialValue);
        },
        [initialValue],
    );

    return {
        count,
        decrement: decrementHandler,
        increment: incrementHandler,
        reset: resetHandler,
    };
};
