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

export async function qryGetChoreById(choreid: number): Promise<Chore | undefined> {
    const rows = (await sql`
        select choreid,
               name
        from chore
        where choreid = ${choreid}
    `) as Chore[];
    return rows[0];
}

export async function qryAddChore(name: string) {
    return sql`
        insert into chore (name)
        values (${name})
        returning choreid, name
    `;
}

export async function qryUpdateChore(choreid: number, name: string) {
    return sql`
        update chore
        set name = ${name}
        where choreid = ${choreid}
        returning choreid, name
    `;
}

export async function qryDeleteChore(choreid: number) {
    return sql`
        delete from chore
        where choreid = ${choreid}
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

export type DeviceLocationRow = {
    deviceId: string;
    name: string;
    platform: string;
    location: {
        latitude: number;
        longitude: number;
        accuracy: number;
        timestamp: string;
    };
    battery: number;
    charging: boolean;
};

export async function qryGetLastKnownDeviceLocation(): Promise<DeviceLocationRow[]> {
    return (await sql`
        SELECT d.id             as "deviceId",

               d.name,
               d.platform,
               json_build_object(
                       'latitude', l.latitude,
                       'longitude', l.longitude,
                       'accuracy', l."horizontalAccuracy",
                       'timestamp', l."deviceTimestamp"
               )                AS location,
               l."batteryLevel" AS battery,
               l."isCharging"   AS charging
        FROM devices d
                 LEFT JOIN LATERAL (
            SELECT *
            FROM locations
            WHERE locations."deviceId" = d.id
            ORDER BY "deviceTimestamp" DESC
                LIMIT 1
    ) l
        ON true;
    `) as DeviceLocationRow[];
}

export type locationType = {
    deviceId?: string;
    latitude?: number;
    longitude?: number;
    altitude?: number;
    horizontalAccuracy?: number;
    verticalAccuracy?: number;
    speed?: number;
    course?: number;
    batteryLevel?: number;
    isCharging?: boolean;
    platform?: string;
    deviceModel?: string;
    deviceName?: string;
    systemVersion?: string;
    deviceTimestamp?: Date;
    receivedAt?: Date;
    networkType?: string;
    isMockLocation?: boolean;
};

export async function qryAddDeviceLocation({
    deviceId,
    latitude,
    longitude,
    altitude,
    horizontalAccuracy,
    verticalAccuracy,
    speed,
    course,
    batteryLevel,
    isCharging,
    platform,
    deviceModel,
    deviceName,
    systemVersion,
    deviceTimestamp,
    // receivedAt,
    // networkType,
    // isMockLocation,
}: locationType) {
    await sql`
        INSERT INTO locations ("deviceId",
                               latitude,
                               longitude,
                               altitude,
                               "horizontalAccuracy",
                               "verticalAccuracy",
                               speed,
                               course,
                               "batteryLevel",
                               "isCharging",
                               platform,
                               "deviceModel",
                               "deviceName",
                               "systemVersion",
                               "deviceTimestamp"
            -- "receivedAt",
            -- "networkType",
            -- "isMockLocation"
        )
        VALUES (${deviceId},
                ${latitude},
                ${longitude},
                ${altitude},
                ${horizontalAccuracy},
                ${verticalAccuracy},
                ${speed},
                ${course},
                ${batteryLevel},
                ${isCharging},
                ${platform},
                ${deviceModel},
                ${deviceName},
                ${systemVersion},
                ${deviceTimestamp}
                   -- receivedAt,
                   -- networkType,
                   -- isMockLocation
               )
    `;

    // const x = {
    //     altitude: 0,
    //     appVersion: '1.0.0',
    //     battery: -1,
    //     charging: false,
    //     course: 0,
    //     deviceId: 'F4CA2524-DE7F-40B0-9A1A-CEBDCF4F324D',
    //     deviceModel: 'iPhone',
    //     deviceName: 'iPhone 17 Pro',
    //     horizontalAccuracy: 5,
    //     latitude: 37.785834,
    //     longitude: -122.406417,
    //     platform: 'iOS',
    //     speed: 0,
    //     systemVersion: '26.2',
    //     timestamp: '2026-07-31T15:13:44Z',
    //     verticalAccuracy: -1,
    // };
}
