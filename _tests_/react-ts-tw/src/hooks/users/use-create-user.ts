/*
 *Test Rules:
 *- code-style/hook-file-naming-convention (verb hook: use-{verb}-{module-singular})
 *- code-style/no-redundant-folder-suffix (hook exception: should NOT flag "user" suffix)
 */
// Test: hook-file-naming-convention — verb hook inside module subfolder

import { useState } from "react";

export const useCreateUser = () => {
    const [isLoading, setIsLoading] = useState(false);

    const createHandler = async (name: string) => {
        setIsLoading(true);

        await Promise.resolve(name);

        setIsLoading(false);
    };

    return {
        isLoading,
        onCreate: createHandler,
    };
};
