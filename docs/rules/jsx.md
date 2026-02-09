# JSX Rules

### `classname-dynamic-at-end`

**What it does:** Enforces that dynamic expressions in className template literals are placed at the end, after all static class names. Also applies to variables with names containing "class" or "Class".

**Why use it:** When using Tailwind CSS with `tailwindcss/classnames-order`, static classes are automatically sorted. However, dynamic expressions like `${className}` or `${styles.button}` can break the visual order if placed in the middle. This rule ensures dynamic parts come last for consistent, readable class strings.

```javascript
// ✅ Good — dynamic expressions at the end (JSX)
<div className={`flex items-center gap-4 ${className}`} />

// ✅ Good — dynamic expressions at the end (variable)
const buttonClasses = `flex items-center ${className} ${styles.button}`;

// ❌ Bad — dynamic expression at the beginning
<div className={`${className} flex items-center gap-4`} />

// ❌ Bad — dynamic expression in the middle (variable)
const buttonClasses = `flex ${className} items-center gap-4`;
```

---

### `classname-multiline`

**What it does:** Enforces that long className strings are broken into multiple lines, with each class on its own line. Triggers when either the class count exceeds `maxClassCount` (default: 3) or the string length exceeds `maxLength` (default: 80). Also enforces:
- JSX `className` with no dynamic expressions uses `"..."` string literal format
- JSX `className` with dynamic expressions uses `` {`...`} `` template literal format
- Variables/object properties use `` `...` `` template literal for multiline (JS requires it)
- No empty lines between classes or before/after the quotes
- Under-threshold multiline classes are collapsed back to a single line

Applies to JSX `className` attributes, variables with class-related names, and object properties within class-related objects.

**Why use it:** Long single-line class strings are hard to read and review. Breaking them into one class per line makes diffs cleaner and classes easier to scan. Using string literals when no expressions are needed keeps the code simpler.

```javascript
// ✅ Good — JSX with no expressions uses "..." format
<div
    className="
        flex
        items-center
        justify-center
        rounded-lg
        p-4
    "
/>

// ✅ Good — JSX with expressions uses {`...`} format
<div
    className={`
        flex
        items-center
        justify-center
        ${className}
    `}
/>

// ✅ Good — variable multiline uses template literal
const buttonClasses = `
    flex
    items-center
    justify-center
    ${className}
`;

// ✅ Good — object property multiline uses template literal
const variantClasses = {
    danger: `
        flex
        items-center
        justify-center
        bg-red-500
    `,
};

// ✅ Good — short class strings stay on one line
<div className="flex items-center" />

// ❌ Bad — too many classes on one line
<div className="flex items-center justify-center rounded-lg p-4 font-bold" />

// ❌ Bad — using template literal in JSX when no expressions
<div className={`
    flex
    items-center
    justify-center
    rounded-lg
`} />

// ❌ Bad — empty lines between classes
<div className="
    flex

    items-center
    justify-center
" />
```

---

### `classname-no-extra-spaces`

**What it does:** Removes multiple consecutive spaces and leading/trailing spaces inside className values. Applies to:
- JSX `className` attributes (string literals and template literals)
- Variables with names containing "class" (e.g., `buttonClasses`, `variantClasses`)
- Object properties within class-related objects

**Why use it:** Extra spaces between class names are usually unintentional and can cause issues. This rule normalizes spacing and removes unnecessary whitespace.

```javascript
// ✅ Good — single space between classes
<div className="flex items-center gap-4 rounded-lg" />
const buttonClasses = `flex items-center ${className}`;
const variantClasses = { primary: "bg-blue-500 text-white" };

// ❌ Bad — multiple consecutive spaces
<div className="flex  items-center   gap-4" />
const buttonClasses = `flex  items-center`;
const variantClasses = { primary: "bg-blue-500  text-white" };

// ❌ Bad — leading/trailing spaces in template literal
const buttonClasses = ` flex items-center ${className} `;
```

---

### `classname-order`

**What it does:** Enforces Tailwind CSS class ordering in variables, object properties, and return statements. Uses smart detection to identify Tailwind class strings.

**Why use it:** This rule complements the official `tailwindcss/classnames-order` plugin by handling areas it doesn't cover:
- **`tailwindcss/classnames-order`** — Handles JSX `className` attributes directly
- **`classname-order`** — Handles class strings in variables, object properties, and return statements

Both rules should be enabled together for complete Tailwind class ordering coverage.

**Order enforced:** layout (flex, grid) → positioning → sizing (w, h) → spacing (p, m) → typography (text, font) → colors (bg, text) → effects (shadow, opacity) → transitions → states (hover, focus)

```javascript
// ✅ Good — classes in correct order (variable)
const buttonClasses = "flex items-center px-4 py-2 text-white bg-blue-500 hover:bg-blue-600";

// ✅ Good — classes in correct order (object property)
const variants = {
    primary: "flex items-center bg-blue-500 hover:bg-blue-600",
    secondary: "flex items-center bg-gray-500 hover:bg-gray-600",
};

// ✅ Good — classes in correct order (return statement)
const getInputStyles = () => {
    return "border-error text-error placeholder-error/50 focus:border-error";
};

// ❌ Bad — hover state before base color (variable)
const buttonClasses = "flex items-center hover:bg-blue-600 bg-blue-500";

// ❌ Bad — unordered classes (object property)
const variants = {
    primary: "hover:bg-blue-600 bg-blue-500 flex items-center",
};

// ❌ Bad — unordered classes (return statement)
const getInputStyles = () => {
    return "focus:border-error text-error border-error";
};
```

---

### `jsx-children-on-new-line`

**What it does:** When a JSX element has multiple children, ensures each child is on its own line with proper indentation.

**Why use it:** Multiple children on one line are hard to scan. Individual lines make the component structure clear.

```javascript
// ✅ Good — each child on its own line
<Container>
    <Header />
    <Content />
    <Footer />
</Container>

<Form>
    <Input name="email" />
    <Input name="password" />
    <Button type="submit">Login</Button>
</Form>

// ✅ Good — single child can stay inline
<Button><Icon /></Button>

// ❌ Bad — multiple children crammed together
<Container><Header /><Content /><Footer /></Container>

// ❌ Bad — inconsistent formatting
<Form><Input name="email" />
    <Input name="password" />
    <Button>Login</Button></Form>
```

---

### `jsx-closing-bracket-spacing`

**What it does:** Removes any space before `>` or `/>` in JSX tags.

**Why use it:** Standard JSX convention. Spaces before closing brackets look inconsistent and can be confusing.

```javascript
// ✅ Good — no space before closing
<Button />
<Input type="text" />
<div className="container">
<Modal isOpen={true}>

// ❌ Bad — space before />
<Button / >
<Input type="text" / >

// ❌ Bad — space before >
<div className="container" >
<Modal isOpen={true} >
```

---

### `jsx-element-child-new-line`

**What it does:** When a JSX element contains another JSX element as a child, the child must be on its own line.

**Why use it:** Nested elements on the same line hide the component structure. New lines make nesting visible.

```javascript
// ✅ Good — nested element on new line
<Button>
    <Icon name="check" />
</Button>

<Card>
    <CardHeader>
        <Title>Hello</Title>
    </CardHeader>
</Card>

// ✅ Good — text children can stay inline
<Button>Click me</Button>
<Title>{title}</Title>

// ❌ Bad — nested element inline
<Button><Icon name="check" /></Button>

// ❌ Bad — complex nesting all inline
<Card><CardHeader><Title>Hello</Title></CardHeader></Card>
```

---

### `jsx-logical-expression-simplify`

**What it does:** Removes unnecessary parentheses around conditions and JSX elements in logical expressions.

**Why use it:** Extra parentheses add visual noise. Simple conditions and elements don't need wrapping.

```javascript
// ✅ Good — clean logical expressions
{isLoading && <Spinner />}
{error && <ErrorMessage>{error}</ErrorMessage>}
{items.length > 0 && <List items={items} />}
{user.isAdmin && <AdminPanel />}

// ❌ Bad — unnecessary parentheses around condition
{(isLoading) && <Spinner />}
{(error) && <ErrorMessage />}

// ❌ Bad — unnecessary parentheses around JSX
{isLoading && (<Spinner />)}
{error && (<ErrorMessage />)}

// ❌ Bad — both
{(isLoading) && (<Spinner />)}
```

---

### `jsx-parentheses-position`

**What it does:** Ensures the opening parenthesis `(` for multiline JSX is on the same line as `return` or `=>`, not on a new line.

**Why use it:** Parenthesis on new line wastes vertical space and looks disconnected from the statement it belongs to.

```javascript
// ✅ Good — parenthesis on same line as =>
const Card = () => (
    <div className="card">
        <h1>Title</h1>
    </div>
);

// ✅ Good — parenthesis on same line as return
function Card() {
    return (
        <div className="card">
            <h1>Title</h1>
        </div>
    );
}

// ❌ Bad — parenthesis on new line after =>
const Card = () =>
    (
        <div className="card">
            <h1>Title</h1>
        </div>
    );

// ❌ Bad — parenthesis on new line after return
function Card() {
    return
        (
            <div className="card">
                <h1>Title</h1>
            </div>
        );
}
```

---

### `jsx-prop-naming-convention`

**What it does:** Enforces camelCase naming for JSX props, with exceptions for:
- `data-*` attributes (kebab-case allowed)
- `aria-*` attributes (kebab-case allowed)
- Props that reference components (PascalCase allowed)

**Why use it:** Consistent prop naming follows React conventions and makes code predictable.

```javascript
// ✅ Good — camelCase props
<Button onClick={handleClick} isDisabled={false} />
<Input onChange={handleChange} autoFocus />
<Modal onClose={close} isVisible={true} />

// ✅ Good — data-* and aria-* use kebab-case
<Button data-testid="submit-btn" aria-label="Submit" />
<Input data-cy="email-input" aria-describedby="help" />

// ✅ Good — component reference props use PascalCase
<Modal ContentComponent={Panel} />
<Route Component={HomePage} />

// ❌ Bad — snake_case props
<Button on_click={handler} is_disabled={false} />
<Input on_change={handler} auto_focus />

// ❌ Bad — kebab-case for regular props
<Button is-disabled={false} />
```

---

### `jsx-simple-element-one-line`

**What it does:** Collapses simple JSX elements (single text or expression child) onto one line.

**Why use it:** Simple elements don't need multi-line formatting. Single line is more compact and scannable.

```javascript
// ✅ Good — simple elements on one line
<Button>{buttonText}</Button>
<Title>Welcome</Title>
<span>{count}</span>
<Label>{user.name}</Label>

// ✅ Good — complex children stay multiline
<Button>
    <Icon />
    {buttonText}
</Button>

// ❌ Bad — unnecessary multiline for simple content
<Button>
    {buttonText}
</Button>

<Title>
    Welcome
</Title>

<span>
    {count}
</span>
```

---

### `jsx-string-value-trim`

**What it does:** Removes leading and trailing whitespace inside JSX string attribute values.

**Why use it:** Whitespace in class names and other string values is usually unintentional and can cause bugs (e.g., CSS class not matching).

```javascript
// ✅ Good — no extra whitespace
<Button className="primary" />
<Input placeholder="Enter email" />
<a href="/home">Home</a>

// ❌ Bad — leading whitespace
<Button className=" primary" />
<Input placeholder=" Enter email" />

// ❌ Bad — trailing whitespace
<Button className="primary " />
<a href="/home ">Home</a>

// ❌ Bad — both
<Button className=" primary " />
```

---

### `jsx-ternary-format`

**What it does:** Formats ternary expressions in JSX consistently:
- Simple branches stay on one line
- Complex/multiline branches get parentheses with proper indentation

**Why use it:** Consistent ternary formatting makes conditional rendering predictable and readable.

```javascript
// ✅ Good — simple ternary on one line
{isLoading ? <Spinner /> : <Content />}
{error ? <Error /> : <Success />}

// ✅ Good — complex branches get parentheses
{isLoading ? (
    <Spinner size="large" />
) : (
    <Content>
        <Header />
        <Body />
    </Content>
)}

// ✅ Good — one simple, one complex
{isLoading ? <Spinner /> : (
    <Content>
        <Header />
        <Body />
    </Content>
)}

// ❌ Bad — awkward line breaks
{isLoading
    ? <Spinner />
    : <Content />}

// ❌ Bad — missing parentheses for complex branch
{isLoading ? <Spinner /> : <Content>
    <Header />
    <Body />
</Content>}
```

---

### `no-empty-lines-in-jsx`

**What it does:** Removes empty lines inside JSX elements — between children and after opening/before closing tags.

**Why use it:** Empty lines inside JSX create visual gaps that break the component's visual structure.

```javascript
// ✅ Good — no empty lines inside
<div>
    <Header />
    <Content />
    <Footer />
</div>

<Form>
    <Input name="email" />
    <Input name="password" />
    <Button>Submit</Button>
</Form>

// ❌ Bad — empty line after opening tag
<div>

    <Header />
    <Content />
</div>

// ❌ Bad — empty lines between children
<Form>
    <Input name="email" />

    <Input name="password" />

    <Button>Submit</Button>
</Form>

// ❌ Bad — empty line before closing tag
<div>
    <Content />

</div>
```

<br />

---

[← Back to Rules Index](./README.md) | [← Back to Main README](../../README.md)
