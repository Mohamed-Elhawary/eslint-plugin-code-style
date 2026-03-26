/*
 *Test Rules:
 *- code-style/type-format (PascalCase + Type suffix, camelCase props, commas)
 *- code-style/typescript-definition-location (types in types folder)
 */

import type { FormFieldEnum } from "@/enums";

// Type for form field name union
export type FormFieldNameType = FormFieldEnum.NAME | FormFieldEnum.EMAIL;
