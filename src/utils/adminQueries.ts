import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

// TABLES
export type Profile = {
    profilesId: number;
    name: string;
    email: string | null;
    username: string | null;
    isChild: boolean;
    isParent: boolean;
    isAdmin: boolean;
};

// For inserting/updating a profile — password is plaintext at this boundary
// (hashed by the API endpoint before hitting the DB).
export type ProfileInput = {
    name: string;
    email?: string | null;
    username?: string | null;
    isChild: boolean;
    isParent: boolean;
    isAdmin: boolean;
};

export type Task = {
    tasksId: number;
    name: string;
};

export type ProfilesTasks = {
    profilesTasksId: number;
    profilesId: number;
    tasksId: number;
    active: boolean;
    completed: boolean;
};

// JOINED
export type ProfilesTasksWithStatus = {
    profilesTasksId: number;
    tasksId: number;
    name: string;
    completed: boolean;
};

export type ProfileWithTasks = {
    profilesId: number;
    name: string;
    tasks: ProfilesTasksWithStatus[];
};

// PROFILES CRUD
// Note: password and salt are never SELECTed here — they should only be read by
// the auth flow via a dedicated query.
export async function qryGetProfileList(): Promise<Profile[]> {
    return (await sql`
        select profiles_id as "profilesId",
               name,
               email,
               username,
               is_child   as "isChild",
               is_parent  as "isParent",
               is_admin   as "isAdmin"
        from profiles
        order by lower(name)
    `) as Profile[];
}

export async function qryGetProfileById(profilesId: number): Promise<Profile | undefined> {
    const rows = (await sql`
        select profiles_id as "profilesId",
               name,
               email,
               username,
               is_child   as "isChild",
               is_parent  as "isParent",
               is_admin   as "isAdmin"
        from profiles
        where profiles_id = ${profilesId}
    `) as Profile[];
    return rows[0];
}

export async function qryAddProfile(
    input: ProfileInput,
    passwordHash: string,
    salt: string,
) {
    const email = input.email ? input.email.toLowerCase() : null;
    const username = input.username ? input.username.toLowerCase() : null;
    return sql`
        insert into profiles (name, email, username, password, salt, is_child, is_parent, is_admin)
        values (${input.name},
                ${email},
                ${username},
                ${passwordHash},
                ${salt},
                ${input.isChild},
                ${input.isParent},
                ${input.isAdmin})
        returning profiles_id as "profilesId", name
    `;
}

// Updates name + toggles + optional email/username. Password/salt are only
// changed when the caller passes both (i.e., the user chose to set a new password).
export async function qryUpdateProfile(
    profilesId: number,
    input: ProfileInput,
    passwordHash?: string,
    salt?: string,
) {
    const email = input.email ? input.email.toLowerCase() : null;
    const username = input.username ? input.username.toLowerCase() : null;

    if (passwordHash && salt) {
        return sql`
            update profiles
            set name      = ${input.name},
                email     = ${email},
                username  = ${username},
                password  = ${passwordHash},
                salt      = ${salt},
                is_child  = ${input.isChild},
                is_parent = ${input.isParent},
                is_admin  = ${input.isAdmin}
            where profiles_id = ${profilesId}
            returning profiles_id as "profilesId", name
        `;
    }

    return sql`
        update profiles
        set name      = ${input.name},
            email     = ${email},
            username  = ${username},
            is_child  = ${input.isChild},
            is_parent = ${input.isParent},
            is_admin  = ${input.isAdmin}
        where profiles_id = ${profilesId}
        returning profiles_id as "profilesId", name
    `;
}

export async function qryDeleteProfile(profilesId: number) {
    return sql`
        delete
        from profiles
        where profiles_id = ${profilesId}
    `;
}

// TASKS CRUD
export async function qryGetTaskList(): Promise<Task[]> {
    return (await sql`
        select tasks_id as "tasksId",
               name
        from tasks
        order by lower(name)
    `) as Task[];
}

export async function qryGetTaskById(tasksId: number): Promise<Task | undefined> {
    const rows = (await sql`
        select tasks_id as "tasksId",
               name
        from tasks
        where tasks_id = ${tasksId}
    `) as Task[];
    return rows[0];
}

export async function qryAddTask(name: string) {
    return sql`
        insert into tasks (name)
        values (${name})
        returning tasks_id as "tasksId", name
    `;
}

export async function qryUpdateTask(tasksId: number, name: string) {
    return sql`
        update tasks
        set name = ${name}
        where tasks_id = ${tasksId}
        returning tasks_id as "tasksId", name
    `;
}

export async function qryDeleteTask(tasksId: number) {
    return sql`
        delete
        from tasks
        where tasks_id = ${tasksId}
    `;
}

// PROFILES_TASKS (many-to-many)
export async function qryGetProfilesTasksByProfileGrouped(): Promise<ProfileWithTasks[]> {
    return (await sql`
        select p.profiles_id as "profilesId",
               p.name,
               json_agg(
                       json_build_object(
                               'profilesTasksId', pt.profiles_tasks_id,
                               'tasksId', t.tasks_id,
                               'name', t.name,
                               'completed', pt.completed
                       ) order by t.name
               ) filter (where t.tasks_id is not null) as tasks
        from profiles p
                 left join profiles_tasks pt on pt.profiles_id = p.profiles_id and pt.active = true
                 left join tasks t on t.tasks_id = pt.tasks_id
        group by p.profiles_id, p.name
    `) as ProfileWithTasks[];
}

export async function qryAddOrRemoveProfilesTasks(
    profilesId: number,
    tasksId: number,
    active: boolean,
) {
    const record = await sql`
        select *
        from profiles_tasks
        where profiles_id = ${profilesId}
          and tasks_id = ${tasksId}
    `;
    if (record.length > 0) {
        await sql`
            update profiles_tasks
            set active    = ${active},
                completed = false
            where profiles_id = ${profilesId}
              and tasks_id = ${tasksId}
        `;
    } else {
        await sql`
            insert into profiles_tasks (profiles_id, tasks_id, active, completed)
            values (${profilesId}, ${tasksId}, true, false)
        `;
    }
}

export async function qryRemoveAllProfilesTasks() {
    await sql`
        update profiles_tasks
        set active    = false,
            completed = false
    `;
}

// DEVICE LOCATIONS
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
        select d.id                  as "deviceId",
               d.name,
               d.platform,
               json_build_object(
                       'latitude', l.latitude,
                       'longitude', l.longitude,
                       'accuracy', l.horizontal_accuracy,
                       'timestamp', l.device_timestamp
               )                     as location,
               l.battery_level       as battery,
               l.is_charging         as charging
        from devices d
                 left join lateral (
            select *
            from locations
            where locations.device_id = d.id
            order by device_timestamp desc
                limit 1
            ) l on true
    `) as DeviceLocationRow[];
}

export type locationType = {
    device_id?: string;
    latitude?: number;
    longitude?: number;
    altitude?: number;
    horizontal_accuracy?: number;
    vertical_accuracy?: number;
    speed?: number;
    course?: number;
    battery_level?: number;
    is_charging?: boolean;
    platform?: string;
    device_model?: string;
    device_name?: string;
    system_version?: string;
    device_timestamp?: Date;
};

export async function qryAddDeviceLocation({
    device_id,
    latitude,
    longitude,
    altitude,
    horizontal_accuracy,
    vertical_accuracy,
    speed,
    course,
    battery_level,
    is_charging,
    platform,
    device_model,
    device_name,
    system_version,
    device_timestamp,
}: locationType) {
    await sql`
        insert into locations (device_id,
                               latitude,
                               longitude,
                               altitude,
                               horizontal_accuracy,
                               vertical_accuracy,
                               speed,
                               course,
                               battery_level,
                               is_charging,
                               platform,
                               device_model,
                               device_name,
                               system_version,
                               device_timestamp)
        values (${device_id},
                ${latitude},
                ${longitude},
                ${altitude},
                ${horizontal_accuracy},
                ${vertical_accuracy},
                ${speed},
                ${course},
                ${battery_level},
                ${is_charging},
                ${platform},
                ${device_model},
                ${device_name},
                ${system_version},
                ${device_timestamp})
    `;
}
