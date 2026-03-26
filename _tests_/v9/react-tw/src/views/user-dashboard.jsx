/*
 *Test Rules:
 *- code-style/react-code-order (correct ordering of code blocks)
 *- code-style/hook-callback-format
 *- code-style/hook-deps-per-line
 *- code-style/classname-multiline (Tailwind multiline classes)
 *- tailwindcss/classnames-order
 */

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { buttonTypeData, inputTypeData } from "@/data";
import { appStrings } from "@/strings";

export const UserDashboardView = ({
    initialCount = 0,
    title,
}) => {
    // 1. useRef declarations
    const inputRef = useRef(null);

    const timerRef = useRef(null);

    // 2. useState declarations
    const [count, setCount] = useState(initialCount);

    const [isLoading, setIsLoading] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");

    // 3. Derived state / variables (computed from hooks above)
    const isSearching = searchTerm.length > 0;

    const displayCount = count > 100 ? "100+" : count.toString();

    // 4. useMemo declarations
    const filteredItems = useMemo(
        () => {
            const items = [appStrings.apple, appStrings.banana, appStrings.cherry];

            return items.filter((item) => item.toLowerCase().includes(searchTerm.toLowerCase()));
        },
        [searchTerm],
    );

    const countStats = useMemo(
        () => ({
            display: displayCount,
            isHigh: count > 50,
            raw: count,
        }),
        [count, displayCount],
    );

    // 5. useCallback declarations
    const incrementHandler = useCallback(
        () => setCount((prev) => prev + 1),
        [],
    );

    const decrementHandler = useCallback(
        () => setCount((prev) => prev - 1),
        [],
    );

    // 6. Handler functions
    const submitHandler = () => {
        setIsLoading(true);

        timerRef.current = window.setTimeout(
            () => setIsLoading(false),
            1000,
        );
    };

    const resetHandler = () => {
        setCount(initialCount);

        setSearchTerm("");

        if (inputRef.current) inputRef.current.value = "";
    };

    // 7. useEffect / useLayoutEffect
    useEffect(
        () => inputRef.current?.focus(),
        [],
    );

    useEffect(
        () => () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        },
        [],
    );

    // 8. Return statement (JSX)
    return (
        <div className="p-6">
            <h1 className="mb-4 text-2xl font-bold">{title}</h1>
            <div className="mb-4">
                <input
                    placeholder={appStrings.search}
                    ref={inputRef}
                    type={inputTypeData.text}
                    className="
                        rounded
                        border
                        border-gray-300
                        p-2
                    "
                    onChange={({ target }) => setSearchTerm(target.value)}
                />
            </div>
            <div
                className="
                    mb-4
                    flex
                    items-center
                    gap-4
                "
            >
                <span className="text-lg">
                    {`${appStrings.countPrefix}${countStats.display}`}
                </span>
                <button
                    type={buttonTypeData.button}
                    className="
                        rounded
                        bg-blue-500
                        px-4
                        py-2
                        text-white
                        hover:bg-blue-600
                    "
                    onClick={decrementHandler}
                >
                    -
                </button>
                <button
                    type={buttonTypeData.button}
                    className="
                        rounded
                        bg-blue-500
                        px-4
                        py-2
                        text-white
                        hover:bg-blue-600
                    "
                    onClick={incrementHandler}
                >
                    +
                </button>
            </div>
            {isSearching && (
                <ul className="mb-4 list-disc pl-6">
                    {filteredItems.map((item) => <li key={item}>{item}</li>)}
                </ul>
            )}
            <div className="flex gap-2">
                <button
                    disabled={isLoading}
                    type={buttonTypeData.button}
                    className="
                        rounded
                        bg-green-500
                        px-4
                        py-2
                        text-white
                        hover:bg-green-600
                    "
                    onClick={submitHandler}
                >
                    {isLoading ? appStrings.loading : appStrings.submit}
                </button>
                <button
                    type={buttonTypeData.button}
                    className="
                        rounded
                        bg-gray-500
                        px-4
                        py-2
                        text-white
                        hover:bg-gray-600
                    "
                    onClick={resetHandler}
                >
                    {appStrings.reset}
                </button>
            </div>
        </div>
    );
};
