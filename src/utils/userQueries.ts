import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export const updateTaskStatus = async (profilesTasksId: number, completed: boolean) => {
    await sql`
        update profiles_tasks
        set completed = ${completed}
        where profiles_tasks_id = ${profilesTasksId}
    `;
};
