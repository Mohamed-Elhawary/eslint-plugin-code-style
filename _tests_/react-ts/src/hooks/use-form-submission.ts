/*
 *Test Rules:
 *- code-style/react-code-order (correct ordering of code blocks in custom hooks)
 *- code-style/hook-callback-format
 *- code-style/hook-deps-per-line
 *- code-style/type-annotation-spacing (colon spacing in type annotations)
 *
 *Custom Hook Code Order (15 categories):
 *1. Props/params destructure (parameter level)
 *2. Props/params destructure in body (`const { x } = param` where param is a function parameter)
 *3. useRef declarations
 *4. useState declarations
 *5. useReducer declarations
 *6. useSelector / useDispatch (Redux)
 *7. Router hooks (useNavigate, useLocation, useParams, useSearchParams)
 *8. Context hooks (useContext, useToast, etc.)
 *9. Custom hooks (use* pattern)
 *10. Derived state / variables (computed from hooks above)
 *11. useMemo declarations
 *12. useCallback declarations
 *13. Handler functions
 *14. useEffect / useLayoutEffect
 *15. Return statement
 */

import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import { FormFieldEnum } from "@/enums";
import type { FormInitialDataInterface, UseFormSubmissionReturnInterface } from "@/interfaces";
import { appStrings } from "@/strings";
import type { FormFieldNameType } from "@/types";

export const useFormSubmission = (initialData: FormInitialDataInterface): UseFormSubmissionReturnInterface => {
    // 1. useRef declarations
    const submitCountRef = useRef(0);

    const lastSubmitTimeRef = useRef<number | null>(null);

    // 2. useState declarations
    const [formData, setFormData] = useState(initialData);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [error, setError] = useState<string | null>(null);

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
            field: FormFieldNameType,
            value: string,
        ) => setFormData((prev) => ({
            ...prev,
            [field]: value,
        })),
        [],
    );

    // 6. Handler functions
    const submitHandler = async () => {
        if (!isFormValid) {
            setError(appStrings.form.requiredFieldsError);

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
            setError(err instanceof Error ? err.message : appStrings.form.submissionFailed);
        } finally {
            setIsSubmitting(false);
        }
    };

    const validateFieldHandler = (field: FormFieldNameType) => {
        if (field === FormFieldEnum.NAME) return formData.name.length > 0;

        if (field === FormFieldEnum.EMAIL) return formData.email.includes("@");

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
