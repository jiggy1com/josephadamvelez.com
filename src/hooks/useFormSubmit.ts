import { useState } from 'react';
import { AlertType } from '@/components/alert/Alert';

type UseFormSubmitOptions<TData> = {
    onSuccess?: (data: TData) => void;
    onError?: (message: string) => void;
    successMessage?: string | ((data: TData) => string);
    // If set, clears the alert this many ms after a successful submit. Error alerts stay put.
    autoClearMs?: number;
};

type UseFormSubmitReturn<TPayload> = {
    submit: (payload: TPayload) => Promise<void>;
    submitting: boolean;
    alert: AlertType;
};

export function useFormSubmit<TPayload, TData = unknown>(
    url: string,
    options: UseFormSubmitOptions<TData> = {},
): UseFormSubmitReturn<TPayload> {
    const [submitting, setSubmitting] = useState(false);
    const [alert, setAlert] = useState<AlertType>({ success: false, message: '' });

    const submit = async (payload: TPayload) => {
        if (submitting) return;
        setSubmitting(true);
        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            const json = await res.json();
            if (json.success) {
                const data = json.data as TData;
                const message =
                    typeof options.successMessage === 'function'
                        ? options.successMessage(data)
                        : (options.successMessage ?? '');
                setAlert({ success: true, message });
                options.onSuccess?.(data);
                if (options.autoClearMs) {
                    setTimeout(
                        () => setAlert({ success: false, message: '' }),
                        options.autoClearMs,
                    );
                }
            } else {
                const errorMsg = json.error ?? 'Request failed';
                setAlert({ success: false, message: errorMsg });
                options.onError?.(errorMsg);
            }
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : String(e);
            setAlert({ success: false, message: errorMsg });
            options.onError?.(errorMsg);
        } finally {
            setSubmitting(false);
        }
    };

    return { submit, submitting, alert };
}
