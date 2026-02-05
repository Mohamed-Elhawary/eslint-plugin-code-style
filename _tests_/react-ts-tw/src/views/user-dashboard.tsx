/*
 *Test Rules:
 *- code-style/react-code-order (correct ordering of code blocks)
 *- code-style/component-props-inline-type
 *- code-style/hook-callback-format
 *- code-style/hook-deps-per-line
 *- code-style/type-annotation-spacing (colon spacing in type annotations)
 *- code-style/variable-naming-convention (camelCase for variables)
 *- code-style/assignment-value-same-line (value on same line as assignment)
 *- code-style/block-statement-newlines (empty lines after block statements)
 *- code-style/if-statement-format (if/else formatting)
 *- code-style/arrow-function-simplify (simplify arrow functions when possible)
 *
 *React Code Order (15 categories):
 *1. Props destructure (parameter level: `({ prop1, prop2 }): Type`)
 *2. Props destructure in body (`const { x } = propValue` where propValue is a prop)
 *3. useRef declarations
 *4. useState declarations
 *5. useReducer declarations
 *6. useSelector / useDispatch (Redux)
 *7. Router hooks (useNavigate, useLocation, useParams, useSearchParams)
 *8. Context hooks (useContext, useToast, etc.)
 *9. Custom hooks (use* pattern)
 *10. Derived state / variables (computed values like `const isSearching = x.length > 0`)
 *11. useMemo declarations
 *12. useCallback declarations
 *13. Handler functions
 *14. useEffect / useLayoutEffect
 *15. Return statement (JSX)
 */

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { InputTypeEnum } from "@/enums";
import { strings } from "@/strings";

export const UserDashboardView = ({
    initialCount = 0,
    title,
}: {
    initialCount?: number,
    title: string,
}) => {
    // 1. useRef declarations
    const inputRef = useRef<HTMLInputElement>(null);

    const timerRef = useRef<number | null>(null);

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
            const items = [strings.items.apple, strings.items.banana, strings.items.cherry];

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
                    className="rounded border p-2"
                    placeholder={strings.form.placeholderSearch}
                    ref={inputRef}
                    type={InputTypeEnum.TEXT}
                    onChange={({ target }) => setSearchTerm(target.value)}
                />
            </div>
            <div className="mb-4">
                <span className="mr-4">
                    {`${strings.labels.count}${countStats.display}`}
                </span>
                <button
                    type={InputTypeEnum.BUTTON}
                    className="
                        mr-2
                        rounded
                        bg-blue-500
                        px-4
                        py-2
                        text-white
                    "
                    onClick={decrementHandler}
                >
                    -
                </button>
                <button
                    type={InputTypeEnum.BUTTON}
                    className="
                        rounded
                        bg-blue-500
                        px-4
                        py-2
                        text-white
                    "
                    onClick={incrementHandler}
                >
                    +
                </button>
            </div>
            {isSearching && (
                <ul className="mb-4">
                    {filteredItems.map((item) => <li key={item}>{item}</li>)}
                </ul>
            )}
            <div className="flex gap-2">
                <button
                    disabled={isLoading}
                    type={InputTypeEnum.BUTTON}
                    className="
                        rounded
                        bg-green-500
                        px-4
                        py-2
                        text-white
                    "
                    onClick={submitHandler}
                >
                    {isLoading ? strings.common.loading : strings.actions.submit}
                </button>
                <button
                    type={InputTypeEnum.BUTTON}
                    className="
                        rounded
                        bg-gray-500
                        px-4
                        py-2
                        text-white
                    "
                    onClick={resetHandler}
                >
                    {strings.actions.reset}
                </button>
            </div>
        </div>
    );
};
