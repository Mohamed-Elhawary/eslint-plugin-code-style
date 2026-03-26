/*
 *Test Rules:
 *- code-style/react-code-order (correct ordering of code blocks)
 *- code-style/hook-callback-format
 *- code-style/hook-deps-per-line
 *
 *This component demonstrates the correct order of code blocks:
 *1. Props destructure (implicit via parameter)
 *2. useRef declarations
 *3. useState declarations
 *4. useReducer declarations
 *5. useSelector / useDispatch (Redux)
 *6. Router hooks (useNavigate, useLocation, useParams, useSearchParams)
 *7. Context hooks (useContext, useToast, etc.)
 *8. Custom hooks (use* pattern)
 *9. Derived state / variables
 *10. useMemo declarations
 *11. useCallback declarations
 *12. Handler functions
 *13. useEffect / useLayoutEffect
 *14. Return statement (JSX)
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
        <div className="dashboard">
            <h1>{title}</h1>
            <div>
                <input
                    placeholder={appStrings.search}
                    ref={inputRef}
                    type={inputTypeData.text}
                    onChange={({ target }) => setSearchTerm(target.value)}
                />
            </div>
            <div>
                <span>
                    {`${appStrings.countPrefix}${countStats.display}`}
                </span>
                <button
                    type={buttonTypeData.button}
                    onClick={decrementHandler}
                >
                    -
                </button>
                <button
                    type={buttonTypeData.button}
                    onClick={incrementHandler}
                >
                    +
                </button>
            </div>
            {isSearching && (
                <ul>
                    {filteredItems.map((item) => <li key={item}>{item}</li>)}
                </ul>
            )}
            <div>
                <button
                    disabled={isLoading}
                    type={buttonTypeData.button}
                    onClick={submitHandler}
                >
                    {isLoading ? appStrings.loading : appStrings.submit}
                </button>
                <button
                    type={buttonTypeData.button}
                    onClick={resetHandler}
                >
                    {appStrings.reset}
                </button>
            </div>
        </div>
    );
};
