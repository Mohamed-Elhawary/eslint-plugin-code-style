# Class Rules

### `class-method-definition-format`

**What it does:** Enforces consistent spacing in class and method definitions:
- Space before opening brace `{` in class declarations
- No space between method name and opening parenthesis `(`
- Space before opening brace `{` in method definitions
- Opening brace must be on same line as class/method signature

**Why use it:** Consistent formatting makes code more readable and prevents common spacing inconsistencies in class definitions.

```javascript
// Good — proper spacing in class and methods
class ApiServiceClass {
    getDataHandler(): string {
        return "data";
    }

    async fetchUserHandler(id: string): Promise<User> {
        return await this.fetch(id);
    }
}

// Bad — missing space before { in class
class ApiServiceClass{
    getDataHandler(): string {
        return "data";
    }
}

// Bad — space between method name and (
class ApiServiceClass {
    getDataHandler (): string {
        return "data";
    }
}

// Bad — missing space before { in method
class ApiServiceClass {
    getDataHandler(): string{
        return "data";
    }
}

// Bad — opening brace on different line
class ApiServiceClass {
    getDataHandler(): string
    {
        return "data";
    }
}
```

---

### `class-naming-convention`

**What it does:** Enforces that class declarations must end with "Class" suffix. This distinguishes class definitions from other PascalCase names like React components or type definitions.

**Why use it:** Clear naming conventions prevent confusion between classes, components, and types. The "Class" suffix immediately identifies the construct.

```javascript
// Good — class ends with "Class"
class ApiServiceClass {
    constructor() {}
    fetch() {}
}

class UserRepositoryClass {
    save(user) {}
}

// Bad — missing "Class" suffix
class ApiService {
    constructor() {}
}

class UserRepository {
    save(user) {}
}
```

<br />

---

[<- Back to Rules Index](./README.md) | [<- Back to Main README](../../README.md)
