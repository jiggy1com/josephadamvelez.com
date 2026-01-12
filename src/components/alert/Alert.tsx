import styles from './Alert.module.scss';
import { JSX } from 'react';

export type AlertType = {
    success: boolean;
    message: string;
};

export const AlertProps = {
    success: false,
    message: '',
};

export function Alert({ success, message }: AlertType = { ...AlertProps }): JSX.Element | null {
    const getAlertClassList = () => {
        const classList = 'alert';
        const alertClass = success ? 'alert-success' : 'alert-error';
        return `${styles[classList]} ${styles[alertClass]}`;
    };

    return message.length === 0 ? null : <div className={getAlertClassList()}>{message}</div>;
}
