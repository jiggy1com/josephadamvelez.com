import styles from './Loading.module.scss';

export function Loading() {
    return (
        <div className={styles.loading}>
            <span
                className={`material-symbols-outlined ${styles['material-symbols-outlined']} ${styles.progress_activity}`}>
                progress_activity
            </span>
            Loading...
        </div>
    );
}
