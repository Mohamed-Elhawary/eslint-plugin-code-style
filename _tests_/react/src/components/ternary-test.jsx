/*
Test Rules:
- jsx-ternary-format (return statement with complex consequent, simple alternate)
*/
// Test: jsx-ternary-format in return statements

const TernaryTest = ({
    eventsModule,
    field,
    isComplex,
    moduleName,
}) => {
    // Test: complex consequent, simple alternate - correct format
    const renderCellHandler = (row) => moduleName === eventsModule && field === "title" ? (
        <a
            className="link"
            href={`/events/${row.id}`}
        >
            {row[field]}
        </a>
    ) : <span>{row[field]}</span>;

    // Test: ternary with JSX in return - correct format
    return isComplex ? (
        <div className="complex">
            <h1>Complex</h1>
            <p>Content</p>
            {renderCellHandler({ id: 1 })}
        </div>
    ) : <span>Simple</span>;
};

export { TernaryTest };
