# React Rules

### `react-code-order`

**What it does:** Enforces a consistent ordering of code blocks within React components and custom hooks. The order follows a logical dependency chain where declarations appear before their usage.

**Order (top to bottom):**
1. Props/params destructure (in function signature: `({ prop1, prop2 })`)
2. Props/params destructure in body (`const { x } = propValue` where propValue is a prop)
3. `useRef` declarations
4. `useState` declarations
5. `useReducer` declarations
6. `useSelector` / `useDispatch` (Redux hooks)
7. Router hooks (`useNavigate`, `useLocation`, `useParams`, `useSearchParams`)
8. Context hooks (`useContext`, `useToast`, etc.)
9. Custom hooks (`use*` pattern)
10. Derived state / variables (computed from hooks above, e.g., `const isSearching = term.length > 0`)
11. `useMemo` declarations
12. `useCallback` declarations
13. Handler functions (`const handleX = () => {}`)
14. `useEffect` / `useLayoutEffect`
15. Return statement

**Why use it:** A consistent code structure makes components and hooks predictable and easier to navigate. Placing hooks before derived values ensures dependencies are defined before use. Effects come last because they typically depend on everything else.

```typescript
// Good — Component follows the correct order
const UserDashboard = ({ title }) => {
    // 1. useRef
    const inputRef = useRef(null);

    // 2. useState
    const [count, setCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // 3. Redux hooks
    const dispatch = useDispatch();
    const user = useSelector((state) => state.user);

    // 4. Router hooks
    const navigate = useNavigate();
    const { id } = useParams();

    // 5. Custom hooks
    const { data, loading } = useFetchData(id);

    // 6. Derived state
    const isReady = !loading && data !== null;
    const displayName = user?.name ?? "Guest";

    // 7. useMemo
    const filteredItems = useMemo(
        () => data?.filter((item) => item.active),
        [data],
    );

    // 8. useCallback
    const handleSubmit = useCallback(
        () => {
            dispatch(submitAction());
        },
        [dispatch],
    );

    // 9. Handler functions
    const resetHandler = () => {
        setCount(0);
        setIsLoading(false);
    };

    // 10. useEffect
    useEffect(
        () => {
            inputRef.current?.focus();
        },
        [],
    );

    // 11. Return
    return (
        <div>
            <h1>{title}</h1>
            <span>{displayName}</span>
        </div>
    );
};

// Good — Custom hook follows the correct order
const useCreateAccount = () => {
    // 1. useState
    const [loading, setLoading] = useState(false);
    const [created, setCreated] = useState(false);

    // 2. Redux hooks
    const dispatch = useDispatch();

    // 3. Context hooks
    const { toast } = useToast();

    // 4. Handler functions
    const createAccountHandler = async (data: AccountData) => {
        setLoading(true);
        try {
            await api.createAccount(data);
            setCreated(true);
        } catch (error) {
            toast({ description: "Failed to create account" });
        } finally {
            setLoading(false);
        }
    };

    // 5. useEffect
    useEffect(
        () => {
            if (created) {
                setTimeout(() => setCreated(false), 50);
            }
        },
        [created],
    );

    // 6. Return
    return { createAccountHandler, created, loading };
};

// Bad — useEffect before useState
const BadComponent = ({ title }) => {
    useEffect(() => {
        console.log("mounted");
    }, []);

    const [count, setCount] = useState(0);

    return <div>{title}</div>;
};

// Bad — context hook before useState in custom hook
const useBadHook = () => {
    const { toast } = useToast();          // Should come after useState
    const [loading, setLoading] = useState(false);
    return { loading };
};

// Bad — handler before hooks
const AnotherBadComponent = ({ title }) => {
    const handleClick = () => {
        console.log("clicked");
    };

    const dispatch = useDispatch();
    const [count, setCount] = useState(0);

    return <div onClick={handleClick}>{title}</div>;
};

// Bad — derived state after handler
const YetAnotherBad = ({ title }) => {
    const [items, setItems] = useState([]);

    const handleAdd = () => {
        setItems([...items, "new"]);
    };

    const itemCount = items.length; // Should come before handleAdd

    return <div>{itemCount}</div>;
};
```

<br />

---

[<- Back to Rules Index](./README.md) | [<- Back to Main README](../../README.md)
