/*
 *Test Rules:
 *- code-style/function-object-destructure (non-component functions use typed params, destructure in body)
 *- code-style/component-props-inline-type (regular functions can use interface references)
 *- code-style/opening-brackets-same-line (preserves TypeScript generics)
 */
/*
 * Test: Non-component functions with typed params and destructuring in body
 * These are NOT React components, so they should NOT destructure in the signature.
 * Instead, use a typed param and destructure at the top of the function body. 
 */

import { useState } from "react";

import type {
    CreateUserParamsInterface,
    DeleteUserParamsInterface,
    UpdateUserParamsInterface,
    UserInterface,
} from "@/interfaces";
import { strings } from "@/strings";

// Test: TypeScript generics are preserved in function calls
export const useUserActions = () => {
    const [users, setUsers] = useState<UserInterface[]>([]);

    const [loading, setLoading] = useState<boolean>(false);

    const [error, setError] = useState<string | null>(null);

    /*
     * Test: Non-component function with typed param and destructuring in body
     * Spacing: data : InterfaceName (one space before and after colon) 
     */
    const createUserHandler = async (data: CreateUserParamsInterface) => {
        const {
            age,
            email,
            isActive,
            name,
        } = data;

        setLoading(true);

        try {
            const newUser: UserInterface = {
                age,
                email,
                id: crypto.randomUUID(),
                isActive: isActive ?? true,
                name,
            };

            setUsers((prev) => [...prev, newUser]);
        } catch (err) {
            setError(err instanceof Error ? err.message : strings.common.unknownError);
        } finally {
            setLoading(false);
        }
    };

    // Test: Non-component function with typed param and destructuring in body
    const updateUserHandler = async (data: UpdateUserParamsInterface) => {
        const {
            age,
            email,
            id,
            isActive,
            name,
        } = data;

        setLoading(true);

        try {
            setUsers((prev) => prev.map(({ id: currentId, ...rest }) =>
                currentId === id
                    ? {
                        ...rest,
                        id: currentId,
                        ...age !== undefined && { age },
                        ...email !== undefined && { email },
                        ...isActive !== undefined && { isActive },
                        ...name !== undefined && { name },
                    }
                    : {
                        id: currentId,
                        ...rest,
                    },
            ),
            );
        } catch (err) {
            setError(err instanceof Error ? err.message : strings.common.unknownError);
        } finally {
            setLoading(false);
        }
    };

    // Test: Non-component function with typed param and destructuring in body
    const deleteUserHandler = async (data: DeleteUserParamsInterface) => {
        const {
            force,
            id,
        } = data;

        setLoading(true);

        try {
            if (force) setUsers((prev) => prev.filter(({ id: currentId }) => currentId !== id));
            else {
                setUsers((prev) => prev.map(({ id: currentId, ...rest }) =>
                    currentId === id ? {
                        id: currentId,
                        ...rest,
                        isActive: false,
                    } : {
                        id: currentId,
                        ...rest,
                    },
                ),
                );
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : strings.common.unknownError);
        } finally {
            setLoading(false);
        }
    };

    return {
        createUserHandler,
        deleteUserHandler,
        error,
        loading,
        updateUserHandler,
        users,
    };
};
