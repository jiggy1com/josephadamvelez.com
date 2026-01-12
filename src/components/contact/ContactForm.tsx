import styles from './ContactForm.module.scss';
import { fontUbuntu } from '@/utils/fonts';
import { Alert } from '@/components/alert/Alert';
import React, { ChangeEvent, JSX, useState } from 'react';
import { Loading } from '@/components/loading/Loading';

type ApiResponse = {
    success: boolean;
    message?: string;
};

export function ContactForm(): JSX.Element {
    const [state, setState] = useState({
        loading: false,
        alert: {
            success: false,
            message: '',
        },
        formData: {
            name: '',
            phone: '',
            email: '',
            message: '',
        },
    });

    const updateLoading = (loading: boolean) => {
        setState((prevState) => {
            return {
                ...prevState,
                loading,
            };
        });
    };

    const handleOnChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setState((prevState) => {
            return {
                ...prevState,
                formData: {
                    ...prevState.formData,
                    [name]: value,
                },
            };
        });
    };

    const validateForm = () => {
        let isValid = true;
        Object.keys(state.formData).forEach((key) => {
            if ((state.formData as any)[key] === '') {
                isValid = false;
            }
        });
        return isValid;
    };

    const updateAlert = (success: boolean, message: string) => {
        setState((prevState) => {
            return {
                ...prevState,
                alert: {
                    success,
                    message,
                },
            };
        });
    };

    const submitForm = async () => {
        updateLoading(true);

        const isValid = validateForm();
        if (!isValid) {
            updateLoading(false);
            updateAlert(false, 'Please fill out all fields.');
        }
        if (isValid) {
            await sendFormData()
                .then((data: ApiResponse) => {
                    updateLoading(false);
                    if (data.success) {
                        updateAlert(true, 'Message sent successfully!');
                        setState((prevState) => {
                            return {
                                ...prevState,
                                formData: {
                                    ...prevState.formData,
                                    name: '',
                                    phone: '',
                                    email: '',
                                    message: '',
                                },
                            };
                        });
                    } else {
                        updateAlert(
                            false,
                            data.message || 'An error occurred while sending the message.',
                        );
                    }
                })
                .catch(() => {
                    updateLoading(false);
                    updateAlert(false, 'An unexpected error occurred.');
                });
        }
    };

    const sendFormData = async () => {
        return await fetch('/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(state.formData),
        })
            .then((res) => res.json())
            .then((data) => {
                return data;
            })
            .catch((err: Error) => {
                updateAlert(false, 'An error occurred while sending the message: ' + err.message);
            });
    };

    return (
        <div className={styles.contactForm}>
            {state.loading && <Loading />}

            <Alert success={state.alert.success} message={state.alert.message} />

            <input
                type={'text'}
                name={'name'}
                placeholder={'Name'}
                className={fontUbuntu.className}
                onChange={handleOnChange}
                value={state.formData.name}
            />

            <input
                type={'text'}
                name={'phone'}
                placeholder={'Phone'}
                className={fontUbuntu.className}
                onChange={handleOnChange}
                value={state.formData.phone}
            />

            <input
                type={'email'}
                name={'email'}
                placeholder={'Email'}
                className={fontUbuntu.className}
                onChange={handleOnChange}
                value={state.formData.email}
            />

            <textarea
                name={'message'}
                placeholder={'Message'}
                className={fontUbuntu.className}
                onChange={handleOnChange}
                value={state.formData.message}
            />

            <button onClick={submitForm}>Submit</button>
        </div>
    );
}
