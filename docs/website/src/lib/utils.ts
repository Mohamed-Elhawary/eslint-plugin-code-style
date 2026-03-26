export const joinClassesHandler = (...classes: (string | undefined | null | false)[]): string => classes.filter(Boolean).join(" "); // eslint-disable-line code-style/type-annotation-spacing
