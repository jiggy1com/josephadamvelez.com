import styles from './Resume.module.scss';

export type ResumeItemType = {
    date: string;
    title: string;
    company: string;
    subheading: string;
    responsibilities: string[];
    environment: string;
};

export function ResumeItem({ item }: { item: ResumeItemType }) {
    return (
        <div className={styles.resumeItem}>
            <h1>
                <span>{item.title}</span>
                <span>{item.date}</span>
            </h1>
            <h2>{item.company}</h2>
            <p>{item.subheading}</p>

            {item.responsibilities.length > 0 && (
                <>
                    <h2>Responsibilities</h2>
                    <ul>
                        {item.responsibilities.map((responsibility, index) => (
                            <li key={index}>{responsibility}</li>
                        ))}
                    </ul>
                </>
            )}

            {item.environment.length > 0 && (
                <p>
                    <strong>Environment:</strong> {item.environment}
                </p>
            )}
        </div>
    );
}
