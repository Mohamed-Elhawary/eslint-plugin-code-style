/*
Test Rules:
- module-index-exports
- import-format (multiline when >= 4 specifiers)
- export-format
- opening-brackets-same-line
- object-property-per-line
- no-empty-lines-in-function-params
- absolute-imports-only
*/
/* Test: import-format (single line when 3 or fewer specifiers)
   Test: absolute-imports-only (use @/ prefix) */

import { Button, Card, Modal } from "@/components";
import { useCounter, useToggle } from "@/hooks";
import { formatCurrency, formatDate, formatNumber } from "@/utils";

// Test: object-property-per-line
const appConfig = {
    name: "Test App",
    version: "1.0.0",
};

// Test: function-params-per-line, no-empty-lines-in-function-params
const App = () => {
    const {
        count,
        increment,
    } = useCounter(0);

    const {
        toggle,
        value: isModalOpen,
    } = useToggle(false);
    
    // Test: object-property-per-line (>= 2 properties)
    
    const stats = {
        count: formatNumber(count),
        date: formatDate(Date.now()),
        total: formatCurrency(count * 10),
    };

    // Test: opening-brackets-same-line
    const handleClickHandler = () => {
        increment();

        toggle();
    };

    // Test: jsx-parentheses-position
    return (
        <div className="app">
            <h1>{appConfig.name}</h1>
            <Card
                description={stats.date}
                isLoading={false}
                title="Counter"
            >
                <p>
                    {"Count: "}
                    {stats.count}
                </p>
                <p>
                    {"Total: "}
                    {stats.total}
                </p>
                <Button
                    label="Increment"
                    variant="primary"
                    onClick={handleClickHandler}
                />
            </Card>
            <Modal
                isOpen={isModalOpen}
                title="Details"
                onClose={toggle}
            >
                <p>Modal content goes here</p>
            </Modal>
        </div>
    );
};

// Test: export-format
export { App };
