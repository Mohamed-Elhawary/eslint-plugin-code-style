/*
 *Test Rules:
 *- code-style/hook-file-naming-convention (list hook: use-{module-plural}-list)
 *- code-style/no-redundant-folder-suffix (hook exception: should NOT flag "users" suffix)
 */
// Test: hook-file-naming-convention — list hook inside module subfolder

import { useState } from "react";

export const useUsersList = () => {
    const [items, setItems] = useState<string[]>([]);

    const refreshHandler = () => setItems(["user-1", "user-2"]);

    return {
        items,
        onRefresh: refreshHandler,
    };
};
