/*
 *Test Rules:
 *- @typescript-eslint/consistent-type-imports
 *- tailwindcss/classnames-order
 *- code-style/import-format
 *- code-style/jsx-ternary-format
 */
// Test: type imports separated from value imports

import { Button, Card } from "@/components";
import { ButtonVariantEnum } from "@/enums";
import { useCounter, useToggle } from "@/hooks";
import { strings } from "@/strings";
import type { User } from "@/types";
import { formatCurrencyHandler, formatDateHandler } from "@/utils";

// Test: TypeScript component with explicit types
export const App = () => {
    const {
        count,
        onDecrement,
        onIncrement,
    } = useCounter(0);

    const {
        hasValue: isModalOpen,
        onToggle,
    } = useToggle(false);

    // Test: TypeScript variable with type annotation
    const user: User = {
        age: 25,
        email: strings.form.placeholderEmail,
        id: "1",
        isActive: true,
        name: strings.user.defaultName,
    };

    const currentDate = new Date();

    // Test: Tailwind classes in main container
    return (
        <div
            className="
                flex
                min-h-screen
                flex-col
                items-center
                justify-center
                bg-gray-100
                p-8
            "
        >
            <Card
                className="w-full max-w-md"
                description={`${strings.labels.welcome}${user.name}`}
                title={strings.labels.counterApp}
            >
                <div className="mb-4 text-center">
                    <p className="text-2xl font-bold text-gray-800">{count}</p>
                    <p className="text-sm text-gray-500">{formatDateHandler(currentDate)}</p>
                    <p className="text-sm text-gray-500">
                        {formatCurrencyHandler(count * 10)}
                    </p>
                </div>
                <div className="flex gap-4">
                    <Button
                        label={strings.actions.decrement}
                        variant={ButtonVariantEnum.DANGER}
                        onClick={onDecrement}
                    />
                    <Button
                        label={strings.actions.increment}
                        variant={ButtonVariantEnum.PRIMARY}
                        onClick={onIncrement}
                    />
                </div>
            </Card>
            <Button
                className="mt-4"
                label={isModalOpen ? strings.actions.close : strings.actions.open}
                variant={ButtonVariantEnum.SECONDARY}
                onClick={onToggle}
            />
            {isModalOpen && (
                <div
                    className="
                        mt-4
                        rounded-lg
                        bg-white
                        p-4
                        shadow-lg
                    "
                >
                    <p>{strings.labels.modalContent}</p>
                </div>
            )}
        </div>
    );
};
