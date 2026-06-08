import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// TABLES
export type Kid = {
    kidid: number;
    name: string;
};

export type Chore = {
    choreid: number;
    name: string;
};

export type KidChore = {
    kidchoreid: number;
    kidid: number;
    choreid: number;
    active: boolean;
    completed: boolean;
};

// JOINED TABLES
export type KidChoreWithStatus = {
    kidchoreid: number;
    choreid: number;
    name: string;
    completed: boolean;
};
export type KidChoreList = {
    kidid: number;
    name: string;
    chores: KidChoreWithStatus[];
};

export async function qryGetKidList() {
    return sql`
        select kidid,
               name
        from kid
        order by kidid
    `;
}

export async function qryGetChoreList() {
    return sql`
        select choreid,
               name
        from chore
        order by name
    `;
}

export async function qryGetKidChoreList() {
    return sql`
        select kc.kidchoreid,
               k.kidid,
               k.name as kid_name,
               c.choreid,
               c.name as chore_name,
               kc.active,
               kc.completed
        from kidchore kc
                 inner join kid k
                            on k.kidid = kc.kidid
                 inner join chore c
                            on c.choreid = kc.choreid
        where kc.active = true
        order by k.name,
                 c.name;
    `;
}

export async function qryGetKidChoreListByKidIdGrouped(): Promise<KidChoreList[]> {
    return (await sql`select k.kidid,
                             k.name,
                             json_agg(
                                     json_build_object(
                                             'kidchoreid', kc.kidchoreid,
                                             'choreid', c.choreid,
                                             'name', c.name,
                                             'completed', kc.completed
                                     ) order by  c.name
                             ) filter (where c.choreid is not null) as chores
                      from kid k
                               left join kidchore kc on kc.kidid = k.kidid and kc.active = true
                               left join chore c on c.choreid = kc.choreid

                      group by k.kidid, k.name
    ;`) as KidChoreList[];
}

export async function qryAddOrRemoveKidChore(kidid: number, choreid: number, active: boolean) {
    const record = await sql`select *
                             from kidchore
                             where kidid = ${kidid}
                               and choreid = ${choreid}`;
    console.log('record', record, {
        kidid,
        choreid,
        active,
    });
    if (record.length > 0) {
        console.log('updating', kidid, choreid, active);
        await sql`update kidchore
                  set active    = ${active},
                      completed = false
                  where kidid = ${kidid}
                    and choreid = ${choreid}`;
    } else {
        console.log('inserting', kidid, choreid, active);
        await sql`insert into kidchore (kidid, choreid, active, completed)
                  values (${kidid}, ${choreid}, true, false)`;
    }
}

export async function qryRemoveAllKidChores() {
    await sql`update kidchore
              set active    = false,
                  completed = false`;
}

// export async function qryGetKidChoreListByKidId(kidId: number) {
//     return sql`
//         select kc.kidchoreid,
//                k.kidid,
//                k.name as kid_name,
//                c.choreid,
//                c.name as chore_name,
//                kc.active,
//                kc.completed
//         from kidchore kc
//                  inner join kid k
//                             on k.kidid = kc.kidid
//                  inner join chore c
//                             on c.choreid = kc.choreid
//         where kc.active = true
//           and k.kidid = ${kidId}
//         order by k.name,
//                  c.name;
//     `;
// }
