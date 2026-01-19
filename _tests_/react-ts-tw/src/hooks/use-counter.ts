/*
Test Rules:
- code-style/hook-callback-format
- code-style/hook-deps-per-line
- TypeScript types in hooks
*/
// Test: TypeScript hook with return type interface

import { useCallback, useState } from "react";

interface UseCounterReturn {
    count: number;
    decrement: () => void;
    increment: () => void;
    reset: () => void;
}

export const useCounter = (initialValue: number = 0): UseCounterReturn => {
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
