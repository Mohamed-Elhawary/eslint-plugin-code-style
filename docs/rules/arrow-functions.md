# Arrow Function Rules

### `arrow-function-block-body`

**What it does:** Ensures arrow functions with multiline expressions use block body with explicit return, wrapped in parentheses when needed.

**Why use it:** Multiline expressions without block body can be confusing. Clear boundaries with `{` and `}` make the function body obvious.

```javascript
// Good — block body for complex logic
const handleSubmit = () => {
    validateForm();
    submitData();
    return result;
};

// Good — multiline JSX wrapped properly
const Button = () => (
    <button className="primary">
        Click me
    </button>
);

// Bad — comma operator is confusing
const handleSubmit = () => (validateForm(), submitData(), result);

// Bad — multiline without clear boundaries
const Button = () => <button className="primary">
    Click me
</button>;
```

---

### `arrow-function-simple-jsx`

**What it does:** Collapses arrow functions that return a single simple JSX element onto one line by removing unnecessary parentheses and line breaks.

**Why use it:** Simple component wrappers don't need multi-line formatting. Single-line is more scannable and reduces vertical space.

```javascript
// Good — simple JSX on one line
export const Layout = ({ children }) => <Container>{children}</Container>;
export const Icon = () => <SVGIcon />;
const Wrapper = (props) => <div {...props} />;

// Bad — unnecessary multi-line for simple JSX
export const Layout = ({ children }) => (
    <Container>{children}</Container>
);

// Bad — extra parentheses not needed
const Icon = () => (
    <SVGIcon />
);
```

---

### `arrow-function-simplify`

**What it does:** Converts arrow functions with a single return statement to use implicit return, removing the block body and `return` keyword.

**Why use it:** Implicit returns are more concise and idiomatic JavaScript. They reduce noise and make the code easier to read.

```javascript
// Good — implicit return
const double = (x) => x * 2;
const getName = (user) => user.name;
const items = data.map((item) => item.value);
const isValid = (x) => x > 0 && x < 100;

// Bad — unnecessary block body and return
const double = (x) => { return x * 2; };
const getName = (user) => { return user.name; };
const items = data.map((item) => { return item.value; });
const isValid = (x) => { return x > 0 && x < 100; };
```

---

### `curried-arrow-same-line`

**What it does:** Ensures that when an arrow function returns another function, the returned function starts on the same line as `=>`.

**Why use it:** Curried functions are easier to read when the chain is visible. Breaking after `=>` obscures the function structure.

```javascript
// Good — curried function visible on same line
const createAction = (type) => (payload) => ({ type, payload });

const withLogger = (fn) => (...args) => {
    console.log("Called with:", args);
    return fn(...args);
};

const mapDispatch = () => async (dispatch) => {
    await dispatch(fetchData());
};

// Bad — chain broken across lines
const createAction = (type) =>
    (payload) => ({ type, payload });

const mapDispatch = () =>
    async (dispatch) => {
        await dispatch(fetchData());
    };
```

<br />

---

[<- Back to Rules Index](./README.md) | [<- Back to Main README](../../README.md)
