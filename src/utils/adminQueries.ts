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
    // The dedicated shared-viewer profile used for the wall/kiosk device.
    // At most one row can have this true (enforced by partial unique index).
    // Not a child, not a parent, not an admin — its own thing.
    isHousehold: boolean;
    // Profile-picked accent color (hex). Null = fallback to app primary.
    // Set here; every profile-specific UI surface (map markers, task lists,
    // chore attribution, etc.) reads it back from Profile.
    color: string | null;
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
    color?: string | null;
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
        select profiles_id  as "profilesId",
               name,
               email,
               username,
               is_child     as "isChild",
               is_parent    as "isParent",
               is_admin     as "isAdmin",
               is_household as "isHousehold",
               color
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
        select profiles_id  as "profilesId",
               name,
               email,
               username,
               is_child     as "isChild",
               is_parent    as "isParent",
               is_admin     as "isAdmin",
               is_household as "isHousehold",
               color,
               password     as "passwordHash",
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
        select profiles_id  as "profilesId",
               name,
               email,
               username,
               is_child     as "isChild",
               is_parent    as "isParent",
               is_admin     as "isAdmin",
               is_household as "isHousehold",
               color
        from profiles
        order by lower(name)
    `) as Profile[];
}

export async function qryGetProfileById(profilesId: number): Promise<Profile | undefined> {
    const rows = (await sql`
        select profiles_id  as "profilesId",
               name,
               email,
               username,
               is_child     as "isChild",
               is_parent    as "isParent",
               is_admin     as "isAdmin",
               is_household as "isHousehold",
               color
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
    const color = input.color ?? null;
    return sql`
        insert into profiles (name, email, username, password, salt, is_child, is_parent, is_admin, color)
        values (${input.name},
                ${email},
                ${username},
                ${passwordHash},
                ${salt},
                ${input.isChild},
                ${input.isParent},
                ${input.isAdmin},
                ${color})
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

    const color = input.color ?? null;

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
                is_admin  = ${input.isAdmin},
                color     = ${color}
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
            is_admin  = ${input.isAdmin},
            color     = ${color}
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

// HOUSEHOLD PROFILE
// Kept separate from the general profile CRUD because it has different rules:
// - At most one row can be is_household = true (enforced by partial unique index)
// - Onboarding creates it; the admin form can edit name/email/username/password
//   but not the role flags, is_admin, or color
// - It cannot be deleted

export async function qryHasHouseholdProfile(): Promise<boolean> {
    const rows = (await sql`
        select 1 from profiles where is_household = true limit 1
    `) as { '?column?': number }[];
    return rows.length > 0;
}

export async function qryAddHouseholdProfile(
    input: { name: string; email: string; username: string },
    passwordHash: string,
    salt: string,
) {
    return sql`
        insert into profiles (name, email, username, password, salt,
                              is_child, is_parent, is_admin, is_household)
        values (${input.name},
                ${input.email.toLowerCase()},
                ${input.username.toLowerCase()},
                ${passwordHash},
                ${salt},
                false, false, false, true)
        returning profiles_id as "profilesId", name
    `;
}

// Limited-scope update for the household profile — no role flags, no admin, no color.
// Password optional (empty = keep existing).
export async function qryUpdateHouseholdProfile(
    profilesId: number,
    input: { name: string; email: string; username: string },
    passwordHash?: string,
    salt?: string,
) {
    const email = input.email.toLowerCase();
    const username = input.username.toLowerCase();

    if (passwordHash && salt) {
        return sql`
            update profiles
            set name     = ${input.name},
                email    = ${email},
                username = ${username},
                password = ${passwordHash},
                salt     = ${salt}
            where profiles_id = ${profilesId}
              and is_household = true
            returning profiles_id as "profilesId", name
        `;
    }

    return sql`
        update profiles
        set name     = ${input.name},
            email    = ${email},
            username = ${username}
        where profiles_id = ${profilesId}
          and is_household = true
        returning profiles_id as "profilesId", name
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

export async function qryRenameListItem(listItemsId: number, name: string) {
    return sql`
        update list_items
        set name = ${name}
        where list_items_id = ${listItemsId}
        returning list_items_id as "listItemsId",
                  name
    `;
}

export async function qryDeleteListItem(listItemsId: number) {
    return sql`
        delete
        from list_items
        where list_items_id = ${listItemsId}
    `;
}

// DEVICE LOCATIONS
export type DeviceLocationRow = {
    deviceId: string;
    deviceName: string | null;
    platform: string | null;
    profileName: string | null;
    profileColor: string | null;
    location: {
        latitude: number;
        longitude: number;
        accuracy: number;
        timestamp: string;
    } | null;
    battery: number | null;
    charging: boolean | null;
    // Friendly name of the nearest matching known_location (within its radius).
    // Null when no known place covers this coord.
    placeName: string | null;
};

// Kids-facing map data. Only surfaces devices that (a) have a profile assigned
// and (b) have at least one location on record — anything else is admin/setup
// noise and shouldn't appear as a marker. Enriches each row with a nearest
// known-place match so popups can show "Willow — Bob's House" instead of coords.
export async function qryGetLastKnownDeviceLocation(): Promise<DeviceLocationRow[]> {
    const rows = (await sql`
        select d.devices_id           as "deviceId",
               d.name                 as "deviceName",
               d.platform,
               p.name                 as "profileName",
               p.color                as "profileColor",
               json_build_object(
                       'latitude', l.latitude,
                       'longitude', l.longitude,
                       'accuracy', l.horizontal_accuracy,
                       'timestamp', l.device_timestamp
               )                      as location,
               l.battery_level        as battery,
               l.is_charging          as charging
        from devices d
                 inner join profiles p on p.profiles_id = d.profiles_id
                 inner join lateral (
            select *
            from locations
            where locations.device_id = d.devices_id
            order by device_timestamp desc
                limit 1
            ) l on true
    `) as Omit<DeviceLocationRow, 'placeName'>[];

    // Fetch the (small) known_locations list once and enrich every row in-process.
    // Family scale = ~10-30 places × ~5 devices = trivial compute.
    const places = await qryGetKnownLocationsList();
    return rows.map((r) => ({
        ...r,
        placeName: r.location
            ? nearestPlace(r.location.latitude, r.location.longitude, places)?.name ?? null
            : null,
    }));
}

export type DeviceRow = {
    devicesId: string;
    name: string | null;
    platform: string | null;
    profilesId: number | null;
    profileName: string | null;
    lastSeen: string | null;
};

export async function qryListDevicesWithProfile(): Promise<DeviceRow[]> {
    return (await sql`
        select d.devices_id  as "devicesId",
               d.name        as name,
               d.platform    as platform,
               d.profiles_id as "profilesId",
               p.name        as "profileName",
               l.last_seen   as "lastSeen"
        from devices d
                 left join profiles p on p.profiles_id = d.profiles_id
                 left join lateral (
            select max(received_at) as last_seen
            from locations
            where locations.device_id = d.devices_id
            ) l on true
        order by lower(d.name) nulls last, d.devices_id
    `) as DeviceRow[];
}

export async function qryAssignDeviceToProfile(
    devicesId: string,
    profilesId: number | null,
): Promise<void> {
    await sql`
        update devices
        set profiles_id = ${profilesId}
        where devices_id = ${devicesId}
    `;
}

// DEVICE HISTORY — all pings for a single device on a specific local date.
// Ordered by capture time (`device_timestamp`), falling back to `received_at`
// only when the client omitted a timestamp. Using received_at here made
// queued/late-delivered pings show up under "now" instead of when the phone
// actually took the fix — misleading on the map and its popups. Cached
// CoreLocation fixes are already dropped client-side (LocationService's
// 30-second staleness guard) so device_timestamp is trustworthy in practice.

export type DeviceHistoryPing = {
    latitude: number;
    longitude: number;
    // Server-received time — kept in the payload for diagnostics, but the UI
    // should prefer deviceTimestamp for anything user-facing.
    receivedAt: string;
    // Device-reported capture time. Preferred for ordering, day-bucketing, and
    // popup labels since it reflects when the event actually happened.
    deviceTimestamp: string | null;
    accuracy: number | null;
    battery: number | null;
    charging: boolean | null;
    // Nearest known place covering this ping's coord, if any. `placeId` is
    // the segmentation key — string-based `placeName` would false-match if
    // two places ever share a name.
    placeId: number | null;
    placeName: string | null;
};

// De-duped subset of known_locations that were actually visited on `date`.
// Rendered as dwell markers by the map view — anchored to canonical place
// coords rather than any single ping's coord so the pin doesn't drift
// day-to-day with GPS jitter.
export type VisitedPlace = {
    placeId: number;
    name: string;
    latitude: number;
    longitude: number;
};

export type DeviceHistoryPayload = {
    device: {
        deviceId: string;
        deviceName: string | null;
        platform: string | null;
        profileName: string | null;
        profileColor: string | null;
    };
    // The local-date string (YYYY-MM-DD) that was queried, echoed back so the UI
    // can render it without re-parsing the input.
    date: string;
    // Timezone that "date" was interpreted in.
    timezone: string;
    pings: DeviceHistoryPing[];
    visitedPlaces: VisitedPlace[];
};

// Same TZ constant used by insights — one place to change if we ever go multi-timezone.
const HISTORY_TZ = 'America/New_York';

export async function qryGetDeviceHistory(
    deviceId: string,
    date: string,
): Promise<DeviceHistoryPayload | null> {
    const deviceRows = (await sql`
        select d.devices_id  as "deviceId",
               d.name        as "deviceName",
               d.platform,
               p.name        as "profileName",
               p.color       as "profileColor"
        from devices d
                 left join profiles p on p.profiles_id = d.profiles_id
        where d.devices_id = ${deviceId}
    `) as DeviceHistoryPayload['device'][];

    if (deviceRows.length === 0) return null;

    const rawPings = (await sql`
        select l.latitude,
               l.longitude,
               l.received_at        as "receivedAt",
               l.device_timestamp   as "deviceTimestamp",
               l.horizontal_accuracy as accuracy,
               l.battery_level      as battery,
               l.is_charging        as charging
        from locations l
        where l.device_id = ${deviceId}
          and (coalesce(l.device_timestamp, l.received_at) at time zone ${HISTORY_TZ})::date = ${date}::date
        order by coalesce(l.device_timestamp, l.received_at) asc
    `) as Omit<DeviceHistoryPing, 'placeName' | 'placeId'>[];

    // Same trick as the current-location query — enrich in-process against the
    // full known_locations list. Trivial cost at family scale even for a
    // ~400-ping day.
    const places = await qryGetKnownLocationsList();
    const visitedIds = new Set<number>();
    const pings: DeviceHistoryPing[] = rawPings.map((p) => {
        const match = nearestPlace(p.latitude, p.longitude, places);
        if (match) visitedIds.add(match.knownLocationsId);
        return {
            ...p,
            placeId: match?.knownLocationsId ?? null,
            placeName: match?.name ?? null,
        };
    });

    const visitedPlaces: VisitedPlace[] = places
        .filter((pl) => visitedIds.has(pl.knownLocationsId))
        .map((pl) => ({
            placeId: pl.knownLocationsId,
            name: pl.name,
            latitude: pl.latitude,
            longitude: pl.longitude,
        }));

    return {
        device: deviceRows[0],
        date,
        timezone: HISTORY_TZ,
        pings,
        visitedPlaces,
    };
}

// Called on every location ping — the mobile app is just a beacon and doesn't
// register itself separately. We upsert so first-ping creates the device row,
// and later pings refresh name/platform if they changed (e.g. user renamed
// their phone in iOS Settings). profiles_id is left alone once set.
export type DeviceClientInfo = {
    appVersion: string | null;
    appBuild: string | null;
    systemVersion: string | null;
    deviceModel: string | null;
};

export async function qryUpsertDevice(
    devicesId: string,
    name: string | null,
    platform: string | null,
    client: DeviceClientInfo,
): Promise<void> {
    // app_build is deliberately NOT coalesced: when a ping reports a version but
    // no build, the app predates build reporting and the stale value would lie.
    await sql`
        insert into devices (devices_id, name, platform, app_version, app_build, system_version, device_model)
        values (${devicesId}, ${name}, ${platform}, ${client.appVersion}, ${client.appBuild},
                ${client.systemVersion}, ${client.deviceModel})
        on conflict (devices_id) do update
            set name           = coalesce(excluded.name, devices.name),
                platform       = coalesce(excluded.platform, devices.platform),
                app_version    = coalesce(excluded.app_version, devices.app_version),
                app_build      = case when excluded.app_version is not null
                                      then excluded.app_build
                                      else devices.app_build end,
                system_version = coalesce(excluded.system_version, devices.system_version),
                device_model   = coalesce(excluded.device_model, devices.device_model)
    `;
}

// LOCATION EVENTS — geofence arrivals/departures.
// Computed on the server as each ping arrives; readers just query the feed.

export type LocationEventType = 'arrival' | 'departure';

export type LocationEventFeedRow = {
    eventId: number;
    devicesId: string;
    deviceName: string | null;
    profilesId: number | null;
    profileName: string | null;
    profileColor: string | null;
    knownLocationsId: number;
    placeName: string;
    eventType: LocationEventType;
    occurredAt: string;
    latitude: number;
    longitude: number;
};

// Fetch device's most recent location BEFORE inserting a new ping. Used by
// location-add to compute geofence transitions (the new ping is compared
// against the last-known position).
export async function qryGetLastLocationForDevice(
    deviceId: string,
): Promise<{ latitude: number; longitude: number } | null> {
    const rows = (await sql`
        select latitude, longitude
        from locations
        where device_id = ${deviceId}
        order by received_at desc
        limit 1
    `) as { latitude: number; longitude: number }[];
    return rows[0] ?? null;
}

export async function qryInsertLocationEvent(input: {
    devicesId: string;
    knownLocationsId: number;
    eventType: LocationEventType;
    latitude: number;
    longitude: number;
}): Promise<void> {
    await sql`
        insert into location_events (devices_id, known_locations_id, event_type, latitude, longitude)
        values (${input.devicesId}, ${input.knownLocationsId}, ${input.eventType},
                ${input.latitude}, ${input.longitude})
    `;
}

export type BackfillResult = {
    arrivals: number;
    departures: number;
    devicesScanned: number;
    pingsScanned: number;
};

// Replays historical pings for one known location and inserts synthetic
// arrival/departure events. Matches the live semantics in
// api/bruh/devices/location-add.ts: an "inside" first ping (no prior ping)
// counts as an arrival, then transitions in/out of the radius emit events.
// Call sites:
//   - Auto-invoked after CREATE (replaceExisting=false; the new id has no events yet)
//   - Manual "Backfill" button on the edit page (replaceExisting=true; wipes
//     this place's existing events first so a corrected radius/pin re-derives cleanly)
export async function qryBackfillLocationEventsForPlace(
    knownLocationsId: number,
    opts: { replaceExisting: boolean },
): Promise<BackfillResult> {
    const place = await qryGetKnownLocationById(knownLocationsId);
    if (!place) throw new Error(`known_location ${knownLocationsId} not found`);

    if (opts.replaceExisting) {
        await sql`
            delete from location_events
            where known_locations_id = ${knownLocationsId}
        `;
    }

    const deviceRows = (await sql`
        select distinct device_id as "deviceId"
        from locations
        where latitude is not null
          and longitude is not null
    `) as { deviceId: string }[];

    let arrivals = 0;
    let departures = 0;
    let pingsScanned = 0;

    for (const { deviceId } of deviceRows) {
        const pings = (await sql`
            select latitude, longitude, received_at as "receivedAt"
            from locations
            where device_id = ${deviceId}
              and latitude is not null
              and longitude is not null
            order by received_at asc
        `) as { latitude: number; longitude: number; receivedAt: string }[];

        let wasInside = false;
        for (const p of pings) {
            const isInside =
                haversineMeters(p.latitude, p.longitude, place.latitude, place.longitude) <=
                place.radiusM;
            if (!wasInside && isInside) {
                await sql`
                    insert into location_events
                        (devices_id, known_locations_id, event_type, latitude, longitude, occurred_at)
                    values
                        (${deviceId}, ${knownLocationsId}, 'arrival',
                         ${p.latitude}, ${p.longitude}, ${p.receivedAt})
                `;
                arrivals++;
            } else if (wasInside && !isInside) {
                await sql`
                    insert into location_events
                        (devices_id, known_locations_id, event_type, latitude, longitude, occurred_at)
                    values
                        (${deviceId}, ${knownLocationsId}, 'departure',
                         ${p.latitude}, ${p.longitude}, ${p.receivedAt})
                `;
                departures++;
            }
            wasInside = isInside;
        }
        pingsScanned += pings.length;
    }

    return { arrivals, departures, devicesScanned: deviceRows.length, pingsScanned };
}

export type LocationEventFilter = {
    profilesId?: number;
    knownLocationsId?: number;
    // Inclusive date bounds in ISO YYYY-MM-DD (local time, interpreted in HISTORY_TZ).
    since?: string;
    until?: string;
    limit?: number;
};

export async function qryGetLocationEventsFeed(
    filter: LocationEventFilter = {},
): Promise<LocationEventFeedRow[]> {
    // Cap the limit — the feed page paginates via since/until, not offset/limit,
    // so an unbounded return would only hurt.
    const limit = Math.min(filter.limit ?? 200, 500);
    // Optional filters use the "param IS NULL OR col = param" pattern so a single
    // query handles all combinations. Nulls come through the neon driver as
    // untyped, hence the explicit ::int / ::date casts on the parameter side.
    const profilesId = filter.profilesId ?? null;
    const knownLocationsId = filter.knownLocationsId ?? null;
    const since = filter.since ?? null;
    const until = filter.until ?? null;
    return (await sql`
        select le.event_id            as "eventId",
               le.devices_id          as "devicesId",
               d.name                 as "deviceName",
               p.profiles_id          as "profilesId",
               p.name                 as "profileName",
               p.color                as "profileColor",
               le.known_locations_id  as "knownLocationsId",
               kl.name                as "placeName",
               le.event_type          as "eventType",
               le.occurred_at         as "occurredAt",
               le.latitude, le.longitude
        from location_events le
                 inner join devices d on d.devices_id = le.devices_id
                 left join profiles p on p.profiles_id = d.profiles_id
                 inner join known_locations kl on kl.known_locations_id = le.known_locations_id
        where (${profilesId}::int is null or p.profiles_id = ${profilesId}::int)
          and (${knownLocationsId}::int is null or le.known_locations_id = ${knownLocationsId}::int)
          and (${since}::text is null or (le.occurred_at at time zone ${HISTORY_TZ})::date >= ${since}::date)
          and (${until}::text is null or (le.occurred_at at time zone ${HISTORY_TZ})::date <= ${until}::date)
        order by le.occurred_at desc
        limit ${limit}
    `) as LocationEventFeedRow[];
}

// KNOWN LOCATIONS — household-shared friendly names for coordinates.
// A ping is considered "at" a known location when it falls within that
// location's radius_m. Multiple places with overlapping radii resolve to
// the nearest by center-to-center distance.

export type KnownLocation = {
    knownLocationsId: number;
    name: string;
    latitude: number;
    longitude: number;
    radiusM: number;
    address: string | null;
};

export async function qryGetKnownLocationsList(): Promise<KnownLocation[]> {
    return (await sql`
        select known_locations_id as "knownLocationsId",
               name,
               latitude,
               longitude,
               radius_m           as "radiusM",
               address
        from known_locations
        order by lower(name)
    `) as KnownLocation[];
}

export async function qryGetKnownLocationById(
    knownLocationsId: number,
): Promise<KnownLocation | undefined> {
    const rows = (await sql`
        select known_locations_id as "knownLocationsId",
               name,
               latitude,
               longitude,
               radius_m           as "radiusM",
               address
        from known_locations
        where known_locations_id = ${knownLocationsId}
    `) as KnownLocation[];
    return rows[0];
}

export type KnownLocationInput = {
    name: string;
    latitude: number;
    longitude: number;
    radiusM: number;
    address?: string | null;
};

export async function qryAddKnownLocation(input: KnownLocationInput) {
    const address = input.address ?? null;
    return sql`
        insert into known_locations (name, latitude, longitude, radius_m, address)
        values (${input.name}, ${input.latitude}, ${input.longitude}, ${input.radiusM}, ${address})
        returning known_locations_id as "knownLocationsId", name
    `;
}

export async function qryUpdateKnownLocation(
    knownLocationsId: number,
    input: KnownLocationInput,
) {
    const address = input.address ?? null;
    return sql`
        update known_locations
        set name      = ${input.name},
            latitude  = ${input.latitude},
            longitude = ${input.longitude},
            radius_m  = ${input.radiusM},
            address   = ${address}
        where known_locations_id = ${knownLocationsId}
        returning known_locations_id as "knownLocationsId", name
    `;
}

export async function qryDeleteKnownLocation(knownLocationsId: number) {
    return sql`
        delete from known_locations where known_locations_id = ${knownLocationsId}
    `;
}

// Haversine distance in meters between two (lat, lon) pairs.
// Kept small and unit-testable — the SQL alternative works but reads like
// alien technology and doesn't scale better at family volumes.
export function haversineMeters(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
): number {
    const R = 6371000;
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
}

// Returns the nearest known location whose center is within its own radius
// of (lat, lon). Null if none match. `places` is passed in to avoid a per-call
// DB round trip — callers fetch the list once and pass it in for each ping.
export function nearestPlace(
    lat: number,
    lon: number,
    places: KnownLocation[],
): KnownLocation | null {
    let best: { place: KnownLocation; dist: number } | null = null;
    for (const p of places) {
        const d = haversineMeters(lat, lon, p.latitude, p.longitude);
        if (d <= p.radiusM && (!best || d < best.dist)) {
            best = { place: p, dist: d };
        }
    }
    return best?.place ?? null;
}

// INSIGHTS — location-firehose analysis
// Timezone hard-coded to America/New_York (single admin, single household).
// If the admin moves timezones, this becomes a config value.
const INSIGHTS_TZ = 'America/New_York';

// Trip-fidelity stats over consecutive pings that look like travel: gap between
// the two pings ≤ 30 min and implied speed > 3 m/s. Straight lines on the history
// map come from large steps here. Measured from capture time, not receive time.
export type InsightsMovingStats = {
    steps: number;
    medianIntervalSeconds: number | null;
    p95IntervalSeconds: number | null;
    // Straight-line distance between consecutive moving pings.
    medianStepM: number | null;
    p95StepM: number | null;
    // Share of moving steps longer than 1 km (0..1) — the "cuts across roads" number.
    pctStepsOver1km: number | null;
};

export type InsightsSourceBucket = {
    // What triggered the ping on the device (e.g. slc, standard, foreground,
    // background, oneshot). "unknown" = row from a build that predates the field.
    source: string;
    pings24h: number;
    pings7d: number;
};

// Why the app version could be wrong or missing is spelled out per status so
// the admin page and a pasted JSON read the same way.
//  unknown  — no ping since the server started recording version info
//  no-build — version reported but no build number: the app predates build reporting
//  behind   — build is lower than the newest build seen on the same platform
//  current  — matches the newest build seen on the same platform
export type InsightsAppStatus = 'unknown' | 'no-build' | 'behind' | 'current';

export type InsightsAppInfo = {
    appVersion: string | null;
    appBuild: string | null;
    systemVersion: string | null;
    deviceModel: string | null;
    // Capture time of the most recent ping ever recorded for the device.
    lastPingAt: string | null;
    status: InsightsAppStatus;
};

export type InsightsPeriod = {
    // Total rows inserted in the period
    pings: number;
    // Distinct ~10m cells (lat/lon rounded to 4 decimals) — GPS-jitter-level resolution.
    // A stationary phone can rack these up just from fix noise, so this number is
    // most useful compared against distinctCells100m to spot jitter.
    distinctCells10m: number;
    // Distinct ~100m cells (lat/lon rounded to 3 decimals) — "same block" resolution.
    // Honest "distinct places" number.
    distinctCells100m: number;
    // Typical accuracy — high number = jittery fix, low = solid
    medianAccuracyM: number | null;
    // Lowest battery seen while OFF charger — the "how much did we drain it" number
    minBatteryOffCharger: number | null;
    // Max seconds between consecutive pings — big gap = background mode gave up
    maxGapSeconds: number | null;
    // First and last battery reading while OFF charger in the window, in that order.
    // Difference gives an honest drain reading; single-reading windows collapse both
    // to the same value.
    batteryStartOffCharger: number | null;
    batteryEndOffCharger: number | null;
    // Share of pings recorded while the device was on a charger (0..1).
    // High values mean the "min battery" reading below is optimistic — the device
    // was mostly plugged in.
    pctPingsCharging: number | null;
    // Median and p95 seconds between consecutive pings — cadence sanity check.
    // Median should approximate the client's target interval; p95 catches OS
    // throttling.
    medianIntervalSeconds: number | null;
    p95IntervalSeconds: number | null;
    // Average speed while moving (speed > 1 m/s), in m/s. Null if never moved.
    avgSpeedMovingMps: number | null;
    // Share of pings with speed ≤ 1 m/s (0..1). High values on a moving device
    // usually means the sensor never got a fresh velocity reading.
    pctStationary: number | null;
    moving: InsightsMovingStats;
};

export type InsightsHourBucket = {
    // 0–23 in the configured local timezone
    hour: number;
    // Raw pings during this hour-of-day in the last 24 hours (single day, not averaged).
    // Best signal when data is sparse or you want to see what actually happened today.
    pings24h: number;
    // Average pings during this hour-of-day, over the last 7 days (total/7).
    // Best signal for spotting recurring patterns once you have a full week.
    avgPings7d: number;
};

export type InsightsDevice = {
    devicesId: string;
    deviceName: string | null;
    platform: string | null;
    profileName: string | null;
    profileColor: string | null;
    period24h: InsightsPeriod;
    period7d: InsightsPeriod;
    // Per-hour-of-day buckets (0–23 local time). Each bucket carries both 24h raw
    // pings and 7d average pings so consumers can toggle between views.
    hourly: InsightsHourBucket[];
    // Extrapolation of last-24h rate → rows if this pace held for 30 days.
    projectedRowsPerMonth: number;
    app: InsightsAppInfo;
    sources: InsightsSourceBucket[];
};

export type InsightsPayload = {
    generatedAt: string;
    timezone: string;
    devices: InsightsDevice[];
};

type SummaryRow = {
    devicesId: string;
    deviceName: string | null;
    platform: string | null;
    profileName: string | null;
    profileColor: string | null;
    pings24h: number;
    distinctCells10m24h: number;
    distinctCells100m24h: number;
    medianAccuracy24h: number | null;
    minBatteryOff24h: number | null;
    maxGapSeconds24h: number | null;
    batteryStartOff24h: number | null;
    batteryEndOff24h: number | null;
    pctCharging24h: number | null;
    medianInterval24h: number | null;
    p95Interval24h: number | null;
    avgSpeedMoving24h: number | null;
    pctStationary24h: number | null;
    movingSteps24h: number;
    movingMedInt24h: number | null;
    movingP95Int24h: number | null;
    movingMedStep24h: number | null;
    movingP95Step24h: number | null;
    movingPctOver1km24h: number | null;
    pings7d: number;
    distinctCells10m7d: number;
    distinctCells100m7d: number;
    medianAccuracy7d: number | null;
    minBatteryOff7d: number | null;
    maxGapSeconds7d: number | null;
    batteryStartOff7d: number | null;
    batteryEndOff7d: number | null;
    pctCharging7d: number | null;
    medianInterval7d: number | null;
    p95Interval7d: number | null;
    avgSpeedMoving7d: number | null;
    pctStationary7d: number | null;
    movingSteps7d: number;
    movingMedInt7d: number | null;
    movingP95Int7d: number | null;
    movingMedStep7d: number | null;
    movingP95Step7d: number | null;
    movingPctOver1km7d: number | null;
};

type AppInfoRow = {
    devicesId: string;
    appVersion: string | null;
    appBuild: string | null;
    systemVersion: string | null;
    deviceModel: string | null;
    lastPingAt: string | null;
};

type SourceRow = {
    devicesId: string;
    source: string;
    pings24h: number;
    pings7d: number;
};

type HourlyRow = {
    devicesId: string;
    hour: number;
    // Pings in this hour-of-day, within the last 24 hours.
    pings24h: number;
    // Pings in this hour-of-day, across the whole 7-day window.
    pings7d: number;
};

export async function qryGetLocationInsights(): Promise<InsightsPayload> {
    // One row per device with 24h + 7d aggregates. The FILTER (WHERE ...)
    // clause lets us compute both windows in a single scan of the last 7d
    // slice of the locations table (indexed by received_at).
    // Gaps are computed in a subquery via LAG then MAX'd here.
    const summary = (await sql`
        with base as (
            -- ts = capture time. An offline-queue flush shares one received_at, which
            -- collapses intervals to 0 — so every interval/window below uses ts.
            -- 8 days of received_at leaves room for pings captured late in the window.
            select l.*, coalesce(l.device_timestamp, l.received_at) as ts
            from locations l
            where l.received_at > now() - interval '8 days'
        ),
        stepped as (
            select b.*,
                   extract(epoch from b.ts - lag(b.ts) over w) as gap_seconds,
                   2 * 6371000 * asin(least(1, sqrt(
                       power(sin(radians(b.latitude::float8 - (lag(b.latitude) over w)::float8) / 2), 2)
                       + cos(radians((lag(b.latitude) over w)::float8)) * cos(radians(b.latitude::float8))
                         * power(sin(radians(b.longitude::float8 - (lag(b.longitude) over w)::float8) / 2), 2)
                   ))) as step_m
            from base b
            where b.ts > now() - interval '7 days'
            window w as (partition by b.device_id order by b.ts)
        ),
        recent as (
            select s.*,
                   (s.gap_seconds between 1 and 1800 and s.step_m / nullif(s.gap_seconds, 0) > 3) as moving_step
            from stepped s
        )
        select d.devices_id                                             as "devicesId",
               d.name                                                    as "deviceName",
               d.platform                                                as platform,
               p.name                                                    as "profileName",
               p.color                                                   as "profileColor",
               count(*) filter (where r.ts > now() - interval '24 hours')                                    as "pings24h",
               count(distinct (round(r.latitude::numeric, 4) || ',' || round(r.longitude::numeric, 4)))
                   filter (where r.ts > now() - interval '24 hours')                                          as "distinctCells10m24h",
               count(distinct (round(r.latitude::numeric, 3) || ',' || round(r.longitude::numeric, 3)))
                   filter (where r.ts > now() - interval '24 hours')                                          as "distinctCells100m24h",
               percentile_cont(0.5) within group (order by r.horizontal_accuracy)
                   filter (where r.ts > now() - interval '24 hours' and r.horizontal_accuracy > 0)            as "medianAccuracy24h",
               min(r.battery_level)
                   filter (where r.ts > now() - interval '24 hours' and not r.is_charging and r.battery_level >= 0) as "minBatteryOff24h",
               max(r.gap_seconds)
                   filter (where r.ts > now() - interval '24 hours')                                          as "maxGapSeconds24h",
               (array_agg(r.battery_level order by r.ts asc)
                   filter (where r.ts > now() - interval '24 hours' and not r.is_charging and r.battery_level >= 0)
               )[1]                                                                                                    as "batteryStartOff24h",
               (array_agg(r.battery_level order by r.ts desc)
                   filter (where r.ts > now() - interval '24 hours' and not r.is_charging and r.battery_level >= 0)
               )[1]                                                                                                    as "batteryEndOff24h",
               avg(case when r.is_charging then 1.0 else 0.0 end)
                   filter (where r.ts > now() - interval '24 hours')                                          as "pctCharging24h",
               percentile_cont(0.5) within group (order by r.gap_seconds)
                   filter (where r.ts > now() - interval '24 hours' and r.gap_seconds > 0)                    as "medianInterval24h",
               percentile_cont(0.95) within group (order by r.gap_seconds)
                   filter (where r.ts > now() - interval '24 hours' and r.gap_seconds > 0)                    as "p95Interval24h",
               avg(r.speed)
                   filter (where r.ts > now() - interval '24 hours' and r.speed > 1)                          as "avgSpeedMoving24h",
               avg(case when coalesce(r.speed, 0) <= 1 then 1.0 else 0.0 end)
                   filter (where r.ts > now() - interval '24 hours')                                          as "pctStationary24h",
               count(*) filter (where r.moving_step and r.ts > now() - interval '24 hours')::int                                                       as "movingSteps24h",
               percentile_cont(0.5) within group (order by r.gap_seconds) filter (where r.moving_step and r.ts > now() - interval '24 hours')            as "movingMedInt24h",
               percentile_cont(0.95) within group (order by r.gap_seconds) filter (where r.moving_step and r.ts > now() - interval '24 hours')           as "movingP95Int24h",
               percentile_cont(0.5) within group (order by r.step_m) filter (where r.moving_step and r.ts > now() - interval '24 hours')                 as "movingMedStep24h",
               percentile_cont(0.95) within group (order by r.step_m) filter (where r.moving_step and r.ts > now() - interval '24 hours')                as "movingP95Step24h",
               avg(case when r.step_m > 1000 then 1.0 else 0.0 end) filter (where r.moving_step and r.ts > now() - interval '24 hours')                  as "movingPctOver1km24h",
               count(r.device_id)                                                                                      as "pings7d",
               count(distinct (round(r.latitude::numeric, 4) || ',' || round(r.longitude::numeric, 4)))                as "distinctCells10m7d",
               count(distinct (round(r.latitude::numeric, 3) || ',' || round(r.longitude::numeric, 3)))                as "distinctCells100m7d",
               percentile_cont(0.5) within group (order by r.horizontal_accuracy)
                   filter (where r.horizontal_accuracy > 0)                                                             as "medianAccuracy7d",
               min(r.battery_level)
                   filter (where not r.is_charging and r.battery_level >= 0)                                            as "minBatteryOff7d",
               max(r.gap_seconds)                                                                                       as "maxGapSeconds7d",
               (array_agg(r.battery_level order by r.ts asc)
                   filter (where not r.is_charging and r.battery_level >= 0)
               )[1]                                                                                                     as "batteryStartOff7d",
               (array_agg(r.battery_level order by r.ts desc)
                   filter (where not r.is_charging and r.battery_level >= 0)
               )[1]                                                                                                     as "batteryEndOff7d",
               avg(case when r.is_charging then 1.0 else 0.0 end) filter (where r.device_id is not null)                as "pctCharging7d",
               percentile_cont(0.5) within group (order by r.gap_seconds)
                   filter (where r.gap_seconds > 0)                                                                     as "medianInterval7d",
               percentile_cont(0.95) within group (order by r.gap_seconds)
                   filter (where r.gap_seconds > 0)                                                                     as "p95Interval7d",
               avg(r.speed) filter (where r.speed > 1)                                                                  as "avgSpeedMoving7d",
               avg(case when coalesce(r.speed, 0) <= 1 then 1.0 else 0.0 end) filter (where r.device_id is not null)    as "pctStationary7d",
               count(*) filter (where r.moving_step)::int                                                               as "movingSteps7d",
               percentile_cont(0.5) within group (order by r.gap_seconds) filter (where r.moving_step)                  as "movingMedInt7d",
               percentile_cont(0.95) within group (order by r.gap_seconds) filter (where r.moving_step)                 as "movingP95Int7d",
               percentile_cont(0.5) within group (order by r.step_m) filter (where r.moving_step)                       as "movingMedStep7d",
               percentile_cont(0.95) within group (order by r.step_m) filter (where r.moving_step)                      as "movingP95Step7d",
               avg(case when r.step_m > 1000 then 1.0 else 0.0 end) filter (where r.moving_step)                        as "movingPctOver1km7d"
        from devices d
                 left join profiles p on p.profiles_id = d.profiles_id
                 left join recent r on r.device_id = d.devices_id
        group by d.devices_id, d.name, d.platform, p.name, p.color
        order by lower(coalesce(p.name, d.name, '')), d.devices_id
    `) as SummaryRow[];

    // Hour-of-day buckets across last 7d, in local time so "3am" means user's 3am.
    // Both windows computed in one scan via FILTER — 24h subset uses the same rows.
    const hourly = (await sql`
        select d.devices_id                                                                       as "devicesId",
               extract(hour from coalesce(l.device_timestamp, l.received_at) at time zone ${INSIGHTS_TZ})::int as hour,
               count(*) filter (where coalesce(l.device_timestamp, l.received_at) > now() - interval '24 hours')::int as "pings24h",
               count(*)::int                                                                      as "pings7d"
        from locations l
                 inner join devices d on d.devices_id = l.device_id
        where l.received_at > now() - interval '8 days'
          and coalesce(l.device_timestamp, l.received_at) > now() - interval '7 days'
        group by d.devices_id, hour
        order by d.devices_id, hour
    `) as HourlyRow[];

    // Device/app info lives on the devices row (refreshed on every ping); last
    // ping is the capture time of the newest location, any age.
    const appRows = (await sql`
        select d.devices_id      as "devicesId",
               d.app_version     as "appVersion",
               d.app_build       as "appBuild",
               d.system_version  as "systemVersion",
               d.device_model    as "deviceModel",
               lp.last_ping_at   as "lastPingAt"
        from devices d
                 left join lateral (
            select max(coalesce(l.device_timestamp, l.received_at)) as last_ping_at
            from locations l
            where l.device_id = d.devices_id
            ) lp on true
    `) as AppInfoRow[];

    const sourceRows = (await sql`
        select l.device_id                                                                              as "devicesId",
               coalesce(l.source, 'unknown')                                                            as source,
               count(*) filter (where coalesce(l.device_timestamp, l.received_at) > now() - interval '24 hours')::int as "pings24h",
               count(*)::int                                                                            as "pings7d"
        from locations l
        where l.received_at > now() - interval '8 days'
          and coalesce(l.device_timestamp, l.received_at) > now() - interval '7 days'
        group by l.device_id, coalesce(l.source, 'unknown')
        order by l.device_id, "pings7d" desc
    `) as SourceRow[];

    const appByDevice = new Map(appRows.map((r) => [r.devicesId, r] as const));
    const sourcesByDevice = new Map<string, InsightsSourceBucket[]>();
    for (const r of sourceRows) {
        const list = sourcesByDevice.get(r.devicesId) ?? [];
        list.push({ source: r.source, pings24h: Number(r.pings24h), pings7d: Number(r.pings7d) });
        sourcesByDevice.set(r.devicesId, list);
    }

    // Newest numeric build seen per platform — the yardstick for "behind".
    const platformKey = (p: string | null) => (p ?? '').toLowerCase();
    const maxBuildByPlatform = new Map<string, number>();
    for (const d of summary) {
        const build = Number(appByDevice.get(d.devicesId)?.appBuild);
        if (!Number.isFinite(build)) continue;
        const key = platformKey(d.platform);
        maxBuildByPlatform.set(key, Math.max(maxBuildByPlatform.get(key) ?? -Infinity, build));
    }

    // Group hourly by device for O(1) lookup while building the payload.
    const hourlyByDevice = new Map<string, HourlyRow[]>();
    for (const row of hourly) {
        const list = hourlyByDevice.get(row.devicesId) ?? [];
        list.push(row);
        hourlyByDevice.set(row.devicesId, list);
    }

    const devices: InsightsDevice[] = summary.map((s) => {
        // Fill in all 24 hours so consumers get a stable-length array,
        // even for hours with zero pings.
        const raw = hourlyByDevice.get(s.devicesId) ?? [];
        const byHour = new Map(raw.map((r) => [r.hour, r] as const));
        const hourly: InsightsHourBucket[] = Array.from({ length: 24 }, (_, hour) => {
            const row = byHour.get(hour);
            return {
                hour,
                pings24h: Number(row?.pings24h ?? 0),
                avgPings7d: Math.round((Number(row?.pings7d ?? 0) / 7) * 100) / 100,
            };
        });

        const appInfo = appByDevice.get(s.devicesId);
        const build = Number(appInfo?.appBuild);
        const newest = maxBuildByPlatform.get(platformKey(s.platform));
        let appStatus: InsightsAppStatus;
        if (!appInfo?.appVersion) appStatus = 'unknown';
        else if (!appInfo.appBuild) appStatus = 'no-build';
        else if (Number.isFinite(build) && newest !== undefined && build < newest) appStatus = 'behind';
        else appStatus = 'current';

        return {
            devicesId: s.devicesId,
            deviceName: s.deviceName,
            platform: s.platform,
            profileName: s.profileName,
            profileColor: s.profileColor,
            period24h: {
                pings: Number(s.pings24h ?? 0),
                distinctCells10m: Number(s.distinctCells10m24h ?? 0),
                distinctCells100m: Number(s.distinctCells100m24h ?? 0),
                medianAccuracyM: s.medianAccuracy24h !== null ? Number(s.medianAccuracy24h) : null,
                minBatteryOffCharger:
                    s.minBatteryOff24h !== null ? Number(s.minBatteryOff24h) : null,
                maxGapSeconds:
                    s.maxGapSeconds24h !== null ? Math.round(Number(s.maxGapSeconds24h)) : null,
                batteryStartOffCharger:
                    s.batteryStartOff24h !== null ? Number(s.batteryStartOff24h) : null,
                batteryEndOffCharger:
                    s.batteryEndOff24h !== null ? Number(s.batteryEndOff24h) : null,
                pctPingsCharging:
                    s.pctCharging24h !== null ? Number(s.pctCharging24h) : null,
                medianIntervalSeconds:
                    s.medianInterval24h !== null ? Math.round(Number(s.medianInterval24h)) : null,
                p95IntervalSeconds:
                    s.p95Interval24h !== null ? Math.round(Number(s.p95Interval24h)) : null,
                avgSpeedMovingMps:
                    s.avgSpeedMoving24h !== null ? Number(s.avgSpeedMoving24h) : null,
                pctStationary:
                    s.pctStationary24h !== null ? Number(s.pctStationary24h) : null,
                moving: {
                    steps: Number(s.movingSteps24h ?? 0),
                    medianIntervalSeconds:
                        s.movingMedInt24h !== null ? Math.round(Number(s.movingMedInt24h)) : null,
                    p95IntervalSeconds:
                        s.movingP95Int24h !== null ? Math.round(Number(s.movingP95Int24h)) : null,
                    medianStepM:
                        s.movingMedStep24h !== null ? Math.round(Number(s.movingMedStep24h)) : null,
                    p95StepM:
                        s.movingP95Step24h !== null ? Math.round(Number(s.movingP95Step24h)) : null,
                    pctStepsOver1km:
                        s.movingPctOver1km24h !== null ? Number(s.movingPctOver1km24h) : null,
                },
            },
            period7d: {
                pings: Number(s.pings7d ?? 0),
                distinctCells10m: Number(s.distinctCells10m7d ?? 0),
                distinctCells100m: Number(s.distinctCells100m7d ?? 0),
                medianAccuracyM: s.medianAccuracy7d !== null ? Number(s.medianAccuracy7d) : null,
                minBatteryOffCharger:
                    s.minBatteryOff7d !== null ? Number(s.minBatteryOff7d) : null,
                maxGapSeconds:
                    s.maxGapSeconds7d !== null ? Math.round(Number(s.maxGapSeconds7d)) : null,
                batteryStartOffCharger:
                    s.batteryStartOff7d !== null ? Number(s.batteryStartOff7d) : null,
                batteryEndOffCharger:
                    s.batteryEndOff7d !== null ? Number(s.batteryEndOff7d) : null,
                pctPingsCharging:
                    s.pctCharging7d !== null ? Number(s.pctCharging7d) : null,
                medianIntervalSeconds:
                    s.medianInterval7d !== null ? Math.round(Number(s.medianInterval7d)) : null,
                p95IntervalSeconds:
                    s.p95Interval7d !== null ? Math.round(Number(s.p95Interval7d)) : null,
                avgSpeedMovingMps:
                    s.avgSpeedMoving7d !== null ? Number(s.avgSpeedMoving7d) : null,
                pctStationary:
                    s.pctStationary7d !== null ? Number(s.pctStationary7d) : null,
                moving: {
                    steps: Number(s.movingSteps7d ?? 0),
                    medianIntervalSeconds:
                        s.movingMedInt7d !== null ? Math.round(Number(s.movingMedInt7d)) : null,
                    p95IntervalSeconds:
                        s.movingP95Int7d !== null ? Math.round(Number(s.movingP95Int7d)) : null,
                    medianStepM:
                        s.movingMedStep7d !== null ? Math.round(Number(s.movingMedStep7d)) : null,
                    p95StepM:
                        s.movingP95Step7d !== null ? Math.round(Number(s.movingP95Step7d)) : null,
                    pctStepsOver1km:
                        s.movingPctOver1km7d !== null ? Number(s.movingPctOver1km7d) : null,
                },
            },
            hourly,
            // Extrapolate 24h rate → 30-day projection. Rough but useful for
            // sizing the retention decision.
            projectedRowsPerMonth: Number(s.pings24h ?? 0) * 30,
            app: {
                appVersion: appInfo?.appVersion ?? null,
                appBuild: appInfo?.appBuild ?? null,
                systemVersion: appInfo?.systemVersion ?? null,
                deviceModel: appInfo?.deviceModel ?? null,
                lastPingAt: appInfo?.lastPingAt ? new Date(appInfo.lastPingAt).toISOString() : null,
                status: appStatus,
            },
            sources: sourcesByDevice.get(s.devicesId) ?? [],
        };
    });

    return {
        generatedAt: new Date().toISOString(),
        timezone: INSIGHTS_TZ,
        devices,
    };
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
    app_version?: string | null;
    app_build?: string | null;
    source?: string | null;
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
    app_version,
    app_build,
    source,
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
                               device_timestamp,
                               app_version,
                               app_build,
                               source)
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
                ${device_timestamp},
                ${app_version ?? null},
                ${app_build ?? null},
                ${source ?? null})
    `;
}
