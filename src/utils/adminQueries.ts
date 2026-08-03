import { neon } from '@neondatabase/serverless';
import { DAYS_OF_WEEK, type DayOfWeek } from '@/constants/days';

const sql = neon(process.env.DATABASE_URL!);

// Re-export so existing server-side consumers that already import from here keep working.
// Client components must import from '@/constants/days' directly — pulling this module
// into the browser bundle would execute `neon()` at load time and fail (no DATABASE_URL).
export { DAYS_OF_WEEK };
export type { DayOfWeek };

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
    // null (or empty) = active every day. Populated = only active on these days.
    daysOfWeek: DayOfWeek[] | null;
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

// AUTH — the only query that returns password + salt. Never call this from the client;
// it's for the login endpoint only.
export type ProfileForAuth = Profile & {
    passwordHash: string;
    salt: string;
};

// Forgot-password flow — updates the reset token by username. Returns the row so the caller
// can decide whether to actually send an email (never leak "no such user" via the response).
export async function qrySetForgotPasswordToken(username: string, token: string) {
    const rows = (await sql`
        update profiles
        set forgot_password_token = ${token}
        where username = ${username.toLowerCase()}
        returning profiles_id as "profilesId", name, email
    `) as { profilesId: number; name: string; email: string | null }[];
    return rows[0];
}

export async function qryGetProfileByForgotPasswordToken(
    token: string,
): Promise<Profile | undefined> {
    const rows = (await sql`
        select profiles_id as "profilesId",
               name,
               email,
               username,
               is_child   as "isChild",
               is_parent  as "isParent",
               is_admin   as "isAdmin"
        from profiles
        where forgot_password_token = ${token}
    `) as Profile[];
    return rows[0];
}

export async function qryResetPasswordByToken(
    token: string,
    passwordHash: string,
    salt: string,
) {
    const rows = (await sql`
        update profiles
        set password              = ${passwordHash},
            salt                  = ${salt},
            forgot_password_token = null
        where forgot_password_token = ${token}
        returning profiles_id as "profilesId"
    `) as { profilesId: number }[];
    return rows[0];
}

export async function qryGetProfileForAuth(username: string): Promise<ProfileForAuth | undefined> {
    const rows = (await sql`
        select profiles_id as "profilesId",
               name,
               email,
               username,
               is_child   as "isChild",
               is_parent  as "isParent",
               is_admin   as "isAdmin",
               password   as "passwordHash",
               salt
        from profiles
        where username = ${username.toLowerCase()}
    `) as ProfileForAuth[];
    return rows[0];
}

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
// daysOfWeek is a nullable array of day-of-week strings; null means "active every day".
export async function qryGetTaskList(): Promise<Task[]> {
    return (await sql`
        select tasks_id     as "tasksId",
               name,
               days_of_week as "daysOfWeek"
        from tasks
        order by lower(name)
    `) as Task[];
}

export async function qryGetTaskById(tasksId: number): Promise<Task | undefined> {
    const rows = (await sql`
        select tasks_id     as "tasksId",
               name,
               days_of_week as "daysOfWeek"
        from tasks
        where tasks_id = ${tasksId}
    `) as Task[];
    return rows[0];
}

export async function qryAddTask(name: string, daysOfWeek: DayOfWeek[] | null) {
    return sql`
        insert into tasks (name, days_of_week)
        values (${name}, ${daysOfWeek})
        returning tasks_id as "tasksId", name, days_of_week as "daysOfWeek"
    `;
}

export async function qryUpdateTask(
    tasksId: number,
    name: string,
    daysOfWeek: DayOfWeek[] | null,
) {
    return sql`
        update tasks
        set name         = ${name},
            days_of_week = ${daysOfWeek}
        where tasks_id = ${tasksId}
        returning tasks_id as "tasksId", name, days_of_week as "daysOfWeek"
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
// filterByToday=true excludes tasks whose days_of_week is set and doesn't include today's
// day. Kids-facing views use this so they only see what's applicable right now; the admin
// assign views pass false so every assignment is visible regardless of day.
export async function qryGetProfilesTasksByProfileGrouped(
    filterByToday: boolean = false,
): Promise<ProfileWithTasks[]> {
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
                     and (
                         ${filterByToday}::boolean = false
                         or t.days_of_week is null
                         or cardinality(t.days_of_week) = 0
                         or to_char(current_date, 'dy') = any(t.days_of_week)
                     )
        group by p.profiles_id, p.name
    `) as ProfileWithTasks[];
}

// Returns the flat set of active (profilesId, tasksId) links — used by the matrix
// view for O(1) checkbox lookups without pulling the joined task metadata.
export async function qryGetActiveProfilesTasksLinks(): Promise<
    { profilesId: number; tasksId: number }[]
> {
    return (await sql`
        select profiles_id as "profilesId",
               tasks_id    as "tasksId"
        from profiles_tasks
        where active = true
    `) as { profilesId: number; tasksId: number }[];
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

// MEALS CRUD
export type Meal = {
    mealId: number;
    name: string;
};

export async function qryGetMealList(): Promise<Meal[]> {
    return (await sql`
        select meal_id as "mealId",
               name
        from meals
        order by lower(name)
    `) as Meal[];
}

export async function qryGetMealById(mealId: number): Promise<Meal | undefined> {
    const rows = (await sql`
        select meal_id as "mealId",
               name
        from meals
        where meal_id = ${mealId}
    `) as Meal[];
    return rows[0];
}

export async function qryAddMeal(name: string) {
    return sql`
        insert into meals (name)
        values (${name})
        returning meal_id as "mealId", name
    `;
}

export async function qryUpdateMeal(mealId: number, name: string) {
    return sql`
        update meals
        set name = ${name}
        where meal_id = ${mealId}
        returning meal_id as "mealId", name
    `;
}

export async function qryDeleteMeal(mealId: number) {
    return sql`
        delete
        from meals
        where meal_id = ${mealId}
    `;
}

// ICS FEEDS CRUD
export type IcsFeed = {
    icsFeedId: number;
    name: string;
    url: string;
    color: string | null;
    active: boolean;
};

export async function qryGetIcsFeedList(): Promise<IcsFeed[]> {
    return (await sql`
        select ics_feed_id as "icsFeedId",
               name,
               url,
               color,
               active
        from ics_feeds
        order by lower(name)
    `) as IcsFeed[];
}

export async function qryGetIcsFeedById(icsFeedId: number): Promise<IcsFeed | undefined> {
    const rows = (await sql`
        select ics_feed_id as "icsFeedId",
               name,
               url,
               color,
               active
        from ics_feeds
        where ics_feed_id = ${icsFeedId}
    `) as IcsFeed[];
    return rows[0];
}

export async function qryAddIcsFeed(
    name: string,
    url: string,
    color: string | null,
    active: boolean,
) {
    return sql`
        insert into ics_feeds (name, url, color, active)
        values (${name}, ${url}, ${color}, ${active})
        returning ics_feed_id as "icsFeedId", name, url, color, active
    `;
}

export async function qryUpdateIcsFeed(
    icsFeedId: number,
    name: string,
    url: string,
    color: string | null,
    active: boolean,
) {
    return sql`
        update ics_feeds
        set name   = ${name},
            url    = ${url},
            color  = ${color},
            active = ${active}
        where ics_feed_id = ${icsFeedId}
        returning ics_feed_id as "icsFeedId", name, url, color, active
    `;
}

export async function qryDeleteIcsFeed(icsFeedId: number) {
    return sql`
        delete
        from ics_feeds
        where ics_feed_id = ${icsFeedId}
    `;
}

// MEAL PLANS
// A "meal plan" is the scheduled appearance of a meal on a specific date + slot.
// The (date, slot) UNIQUE constraint means one meal per slot per day — upsert
// handles both "add to empty slot" and "drop onto occupied slot to replace".
export type MealSlot = 'breakfast' | 'lunch' | 'dinner';

export type MealPlan = {
    mealPlansId: number;
    mealId: number;
    mealName: string;
    date: string;  // YYYY-MM-DD — cast to text so we bypass Date object timezone weirdness
    slot: MealSlot;
};

export async function qryGetMealPlansInRange(from: string, to: string): Promise<MealPlan[]> {
    return (await sql`
        select mp.meal_plans_id                    as "mealPlansId",
               mp.meal_id                          as "mealId",
               m.name                              as "mealName",
               to_char(mp.date, 'YYYY-MM-DD')      as "date",
               mp.slot
        from meal_plans mp
                 inner join meals m on m.meal_id = mp.meal_id
        where mp.date between ${from} and ${to}
        order by mp.date, mp.slot
    `) as MealPlan[];
}

export async function qryUpsertMealPlan(mealId: number, date: string, slot: MealSlot) {
    return sql`
        insert into meal_plans (meal_id, date, slot)
        values (${mealId}, ${date}, ${slot})
        on conflict (date, slot) do update set meal_id = excluded.meal_id
        returning meal_plans_id                as "mealPlansId",
                  meal_id                      as "mealId",
                  to_char(date, 'YYYY-MM-DD')  as "date",
                  slot
    `;
}

export async function qryDeleteMealPlan(mealPlansId: number) {
    return sql`
        delete
        from meal_plans
        where meal_plans_id = ${mealPlansId}
    `;
}

// LISTS + LIST ITEMS
// Lists are named collections (Grocery, Honey-Do, etc.). Items belong to a list.
// `is_public` gates whether kids-facing UI shows the list at all.

export type ListRow = {
    listsId: number;
    name: string;
    color: string | null;
    isPublic: boolean;
};

export type ListWithCounts = ListRow & {
    itemCount: number;
    uncheckedCount: number;
};

export type ListItem = {
    listItemsId: number;
    listsId: number;
    name: string;
    checked: boolean;
    addedBy: number | null;
    addedAt: string;    // ISO datetime
    checkedAt: string | null;
};

// LIST DEFINITION CRUD
export async function qryGetListList(): Promise<ListRow[]> {
    return (await sql`
        select lists_id  as "listsId",
               name,
               color,
               is_public as "isPublic"
        from lists
        order by lower(name)
    `) as ListRow[];
}

export async function qryGetPublicListsWithCounts(): Promise<ListWithCounts[]> {
    return (await sql`
        select l.lists_id  as "listsId",
               l.name,
               l.color,
               l.is_public as "isPublic",
               coalesce(counts.total, 0)::int     as "itemCount",
               coalesce(counts.unchecked, 0)::int as "uncheckedCount"
        from lists l
        left join (
            select lists_id,
                   count(*)                                 as total,
                   count(*) filter (where checked = false)  as unchecked
            from list_items
            group by lists_id
        ) counts on counts.lists_id = l.lists_id
        where l.is_public = true
        order by lower(l.name)
    `) as ListWithCounts[];
}

export async function qryGetListById(listsId: number): Promise<ListRow | undefined> {
    const rows = (await sql`
        select lists_id  as "listsId",
               name,
               color,
               is_public as "isPublic"
        from lists
        where lists_id = ${listsId}
    `) as ListRow[];
    return rows[0];
}

export async function qryAddList(name: string, color: string | null, isPublic: boolean) {
    return sql`
        insert into lists (name, color, is_public)
        values (${name}, ${color}, ${isPublic})
        returning lists_id as "listsId", name, color, is_public as "isPublic"
    `;
}

export async function qryUpdateList(
    listsId: number,
    name: string,
    color: string | null,
    isPublic: boolean,
) {
    return sql`
        update lists
        set name      = ${name},
            color     = ${color},
            is_public = ${isPublic}
        where lists_id = ${listsId}
        returning lists_id as "listsId", name, color, is_public as "isPublic"
    `;
}

export async function qryDeleteList(listsId: number) {
    return sql`
        delete
        from lists
        where lists_id = ${listsId}
    `;
}

// LIST ITEMS
// Sort: unchecked first (oldest first — first added is first grabbed).
// Then checked (most recently checked at top of checked section).
export async function qryGetListItems(listsId: number): Promise<ListItem[]> {
    return (await sql`
        select list_items_id as "listItemsId",
               lists_id      as "listsId",
               name,
               checked,
               added_by      as "addedBy",
               added_at      as "addedAt",
               checked_at    as "checkedAt"
        from list_items
        where lists_id = ${listsId}
        order by checked asc,
                 case when checked then checked_at end desc,
                 case when not checked then added_at end asc
    `) as ListItem[];
}

export async function qryAddListItem(
    listsId: number,
    name: string,
    addedBy: number | null,
) {
    return sql`
        insert into list_items (lists_id, name, added_by)
        values (${listsId}, ${name}, ${addedBy})
        returning list_items_id as "listItemsId",
                  lists_id      as "listsId",
                  name,
                  checked,
                  added_by      as "addedBy",
                  added_at      as "addedAt",
                  checked_at    as "checkedAt"
    `;
}

export async function qryToggleListItemChecked(listItemsId: number, checked: boolean) {
    return sql`
        update list_items
        set checked    = ${checked},
            checked_at = case when ${checked} then now() else null end
        where list_items_id = ${listItemsId}
        returning list_items_id as "listItemsId",
                  checked,
                  checked_at    as "checkedAt"
    `;
}

export async function qryClearCheckedItems(listsId: number) {
    return sql`
        delete
        from list_items
        where lists_id = ${listsId}
          and checked = true
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
        select d.devices_id                  as "deviceId",
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
            where locations.device_id = d.devices_id
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
