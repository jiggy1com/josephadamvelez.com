import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export const updateChoreStatus = async (kidchoreid: number, completed: boolean) => {
    await sql`
        update kidchore
        set completed = ${completed}
        where kidchoreid = ${kidchoreid}
    `;
};
