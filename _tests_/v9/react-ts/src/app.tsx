/*
 *Test Rules:
 *- @typescript-eslint/consistent-type-imports
 *- code-style/import-format
 *- code-style/jsx-ternary-format
 */
// Test: type imports separated from value imports

import { Button, Card } from "@/components";
import { ButtonVariantEnum } from "@/enums";
import { useCounter, useToggle } from "@/hooks";
import { appStrings } from "@/strings";
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
        email: appStrings.form.placeholderEmail,
        id: "1",
        isActive: true,
        name: appStrings.user.defaultName,
    };

    const currentDate = new Date();

    return (
        <div className="app-container">
            <Card
                description={`${appStrings.labels.welcome}${user.name}`}
                title={appStrings.labels.counterApp}
            >
                <div className="counter-display">
                    <p className="counter-value">{count}</p>
                    <p className="counter-date">{formatDateHandler(currentDate)}</p>
                    <p className="counter-currency">
                        {formatCurrencyHandler(count * 10)}
                    </p>
                </div>
                <div className="counter-actions">
                    <Button
                        label={appStrings.actions.decrement}
                        variant={ButtonVariantEnum.DANGER}
                        onClick={onDecrement}
                    />
                    <Button
                        label={appStrings.actions.increment}
                        variant={ButtonVariantEnum.PRIMARY}
                        onClick={onIncrement}
                    />
                </div>
            </Card>
            <Button
                className="modal-toggle"
                label={isModalOpen ? appStrings.actions.close : appStrings.actions.open}
                variant={ButtonVariantEnum.SECONDARY}
                onClick={onToggle}
            />
            {isModalOpen && (
                <div className="modal-content">
                    <p>{appStrings.labels.modalContent}</p>
                </div>
            )}
        </div>
    );
};
