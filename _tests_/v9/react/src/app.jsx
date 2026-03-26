/*
 *Test Rules:
 *- module-index-exports
 *- import-format (multiline when >= 4 specifiers)
 *- export-format
 *- opening-brackets-same-line
 *- object-property-per-line
 *- no-empty-lines-in-function-params
 *- absolute-imports-only
 */
/*
 * Test: import-format (single line when 3 or fewer specifiers)
 * Test: absolute-imports-only (use @/ prefix)
 */

import { Button, Card, Modal } from "@/components";
import { variantData } from "@/data";
import { useCounter, useToggle } from "@/hooks";
import { appStrings } from "@/strings";
import { formatCurrency, formatDate, formatNumber } from "@/utils";

// Test: object-property-per-line
const appConfig = {
    name: "Test App",
    version: "1.0.0",
};

// Test: function-params-per-line, no-empty-lines-in-function-params
export const App = () => {
    const {
        count,
        increment: incrementHandler,
    } = useCounter(0);

    const {
        toggle: toggleHandler,
        value: isModalOpen,
    } = useToggle(false);

    // Test: object-property-per-line (>= 2 properties)

    const stats = {
        count: formatNumber(count),
        date: formatDate(Date.now()),
        total: formatCurrency(count * 10),
    };

    // Test: opening-brackets-same-line
    const clickHandler = () => {
        incrementHandler();

        toggleHandler();
    };

    // Test: jsx-parentheses-position
    return (
        <div className="app">
            <h1>{appConfig.name}</h1>
            <Card
                description={stats.date}
                isLoading={false}
                title={appStrings.counter}
            >
                <p>
                    {appStrings.countPrefix}
                    {stats.count}
                </p>
                <p>
                    {appStrings.totalPrefix}
                    {stats.total}
                </p>
                <Button
                    label={appStrings.increment}
                    variant={variantData.primary}
                    onClick={clickHandler}
                />
            </Card>
            <Modal
                isOpen={isModalOpen}
                title={appStrings.details}
                onClose={toggleHandler}
            >
                <p>{appStrings.modalContent}</p>
            </Modal>
        </div>
    );
};
