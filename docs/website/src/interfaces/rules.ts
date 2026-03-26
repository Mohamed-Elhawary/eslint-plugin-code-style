export interface CategoryInterface {
    description: string,
    name: string,
    rules: RuleInterface[],
    slug: string,
}

export interface RuleInterface {
    badExample: string,
    description: string,
    goodExample: string,
    isConfigurable: boolean,
    isFixable: boolean,
    isTsOnly: boolean,
    name: string,
    options: RuleOptionInterface[],
    rationale: string,
}

export interface RuleOptionInterface {
    default: string,
    description: string,
    name: string,
    type: string,
}
