export interface NavItemInterface {
    href: string,
    items?: NavItemInterface[],
    title: string,
}

export interface NavSectionInterface {
    items: NavItemInterface[],
    title: string,
}
