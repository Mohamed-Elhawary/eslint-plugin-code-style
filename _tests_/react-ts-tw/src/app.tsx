/*
Test Rules:
- @typescript-eslint/consistent-type-imports
- tailwindcss/classnames-order
- code-style/import-format
- code-style/jsx-ternary-format
*/
// Test: type imports separated from value imports

import { Button, Card } from "@/components";
import { useCounter, useToggle } from "@/hooks";
import type { User } from "@/types";
import { formatCurrencyHandler, formatDateHandler } from "@/utils";

// Test: TypeScript component with explicit types
export const App = () => {
    const {
        count,
        decrement,
        increment,
    } = useCounter(0);

    const {
        toggle,
        value: isModalOpen,
    } = useToggle(false);

    // Test: TypeScript variable with type annotation
    const user: User = {
        age: 25,
        email: "john@example.com",
        id: "1",
        isActive: true,
        name: "John Doe",
    };

    const currentDate = new Date();

    // Test: Tailwind classes in main container
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-8">
            <Card
                className="w-full max-w-md"
                description={`Welcome, ${user.name}`}
                title="Counter App"
            >
                <div className="mb-4 text-center">
                    <p className="text-2xl font-bold text-gray-800">{count}</p>
                    <p className="text-sm text-gray-500">
                        {formatDateHandler(currentDate)}
                    </p>
                    <p className="text-sm text-gray-500">
                        {formatCurrencyHandler(count * 10)}
                    </p>
                </div>
                <div className="flex gap-4">
                    <Button
                        label="Decrement"
                        variant="danger"
                        onClick={decrement}
                    />
                    <Button
                        label="Increment"
                        variant="primary"
                        onClick={increment}
                    />
                </div>
            </Card>
            <Button
                className="mt-4"
                label={isModalOpen ? "Close Modal" : "Open Modal"}
                variant="secondary"
                onClick={toggle}
            />
            {isModalOpen && (
                <div className="mt-4 rounded-lg bg-white p-4 shadow-lg">
                    <p>Modal Content</p>
                </div>
            )}
        </div>
    );
};
