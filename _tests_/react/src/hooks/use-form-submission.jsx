/*
 *Test Rules:
 *- code-style/react-code-order (correct ordering of code blocks in custom hooks)
 *- code-style/hook-callback-format
 *- code-style/hook-deps-per-line
 *
 *This hook demonstrates the correct order of code blocks in custom hooks:
 *1. useRef declarations
 *2. useState declarations
 *3. useReducer declarations
 *4. useSelector / useDispatch (Redux)
 *5. Router hooks (useNavigate, useLocation, useParams, useSearchParams)
 *6. Context hooks (useContext, useToast, etc.)
 *7. Custom hooks (use* pattern)
 *8. Derived state / variables
 *9. useMemo declarations
 *10. useCallback declarations
 *11. Handler functions
 *12. useEffect / useLayoutEffect
 *13. Return statement
 */

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { fieldData } from "@/data";
import { appStrings } from "@/strings";

export const useFormSubmission = (initialData) => {
    // 1. useRef declarations
    const submitCountRef = useRef(0);

    const lastSubmitTimeRef = useRef(null);

    // 2. useState declarations
    const [formData, setFormData] = useState(initialData);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [error, setError] = useState(null);

    const [isSuccess, setIsSuccess] = useState(false);

    // 3. Derived state / variables (computed from hooks above)
    const isFormValid = formData.name.length > 0 && formData.email.includes("@");

    const hasBeenSubmitted = submitCountRef.current > 0;

    // 4. useMemo declarations
    const formSummary = useMemo(
        () => ({
            email: formData.email,
            isValid: isFormValid,
            name: formData.name,
        }),
        [formData, isFormValid],
    );

    // 5. useCallback declarations
    const resetFormHandler = useCallback(
        () => {
            setFormData(initialData);

            setError(null);

            setIsSuccess(false);
        },
        [initialData],
    );

    const updateFieldHandler = useCallback(
        (
            field,
            value,
        ) => setFormData((prev) => ({
            ...prev,
            [field]: value,
        })),
        [],
    );

    // 6. Handler functions
    const submitHandler = async () => {
        if (!isFormValid) {
            setError(appStrings.pleaseFillRequired);

            return;
        }

        setIsSubmitting(true);

        setError(null);

        try {
            await new Promise((resolve) => setTimeout(
                resolve,
                1000,
            ));

            submitCountRef.current += 1;

            lastSubmitTimeRef.current = Date.now();

            setIsSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : appStrings.submissionFailed);
        } finally {
            setIsSubmitting(false);
        }
    };

    const validateFieldHandler = (field) => {
        if (field === fieldData.name) return formData.name.length > 0;

        if (field === fieldData.email) return formData.email.includes("@");

        return false;
    };

    // 7. useEffect / useLayoutEffect
    useEffect(
        () => {
            if (isSuccess) {
                const timer = setTimeout(
                    () => setIsSuccess(false),
                    3000,
                );

                return () => clearTimeout(timer);
            }

            return undefined;
        },
        [isSuccess],
    );

    useEffect(
        () => () => submitCountRef.current = 0,
        [],
    );

    // 8. Return statement
    return {
        error,
        formData,
        formSummary,
        hasBeenSubmitted,
        isFormValid,
        isSubmitting,
        isSuccess,
        resetForm: resetFormHandler,
        submit: submitHandler,
        updateField: updateFieldHandler,
        validateField: validateFieldHandler,
    };
};
