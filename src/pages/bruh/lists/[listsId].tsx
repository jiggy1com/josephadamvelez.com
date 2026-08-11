import { FormEvent, MouseEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Section } from '@/components/section/Section';
import { Alert, AlertType } from '@/components/alert/Alert';
import { Flex } from '@/components/flexbox/Flex';
import { FlexItem } from '@/components/flexbox/FlexItem';
import { ConfirmModal } from '@/components/modal/ConfirmModal';
import type { ListItem, ListRow } from '@/utils/adminQueries';

export default function BruhListDetail() {
    const router = useRouter();
    const listsId = Number(router.query.listsId);
    const [list, setList] = useState<ListRow | null>(null);
    const [items, setItems] = useState<ListItem[]>([]);
    const [newItem, setNewItem] = useState('');
    const [alert, setAlert] = useState<AlertType>({ success: false, message: '' });
    const [busy, setBusy] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState('');
    const [pendingDelete, setPendingDelete] = useState<ListItem | null>(null);

    const loadItems = async () => {
        if (!listsId) return;
        const res = await fetch(`/api/bruh/lists/items?listsId=${listsId}`, {
            cache: 'no-store',
        });
        const json = await res.json();
        if (json.success) {
            setList(json.list);
            setItems(json.items);
        } else {
            setAlert({ success: false, message: json.error ?? 'Failed to load list' });
        }
    };

    useEffect(() => {
        if (router.isReady) void loadItems();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [router.isReady, listsId]);

    const addItem = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const name = newItem.trim();
        if (!name || busy) return;
        setBusy(true);
        setNewItem('');
        const res = await fetch('/api/bruh/lists/items/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ listsId, name }),
        });
        const json = await res.json();
        if (!json.success) {
            setAlert({ success: false, message: json.error ?? 'Failed to add item' });
        }
        await loadItems();
        setBusy(false);
    };

    const toggleItem = async (item: ListItem) => {
        // Optimistic — flip locally, then sync.
        setItems((prev) =>
            prev.map((i) =>
                i.listItemsId === item.listItemsId ? { ...i, checked: !i.checked } : i,
            ),
        );
        await fetch('/api/bruh/lists/items/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ listItemsId: item.listItemsId, checked: !item.checked }),
        });
        await loadItems(); // resync canonical order
    };

    const startEdit = (e: MouseEvent, item: ListItem) => {
        e.stopPropagation();
        setEditingId(item.listItemsId);
        setEditingName(item.name);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditingName('');
    };

    const saveEdit = async (e: FormEvent<HTMLFormElement>, item: ListItem) => {
        e.preventDefault();
        const name = editingName.trim();
        if (!name || name === item.name) {
            cancelEdit();
            return;
        }
        const res = await fetch('/api/bruh/lists/items/rename', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ listItemsId: item.listItemsId, name }),
        });
        const json = await res.json();
        if (!json.success) {
            setAlert({ success: false, message: json.error ?? 'Failed to rename item' });
        }
        cancelEdit();
        await loadItems();
    };

    const requestDelete = (e: MouseEvent, item: ListItem) => {
        e.stopPropagation();
        setPendingDelete(item);
    };

    const confirmDelete = async () => {
        if (!pendingDelete) return;
        const target = pendingDelete;
        setPendingDelete(null);
        const res = await fetch('/api/bruh/lists/items/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ listItemsId: target.listItemsId }),
        });
        const json = await res.json();
        if (!json.success) {
            setAlert({ success: false, message: json.error ?? 'Failed to delete item' });
        }
        await loadItems();
    };

    const clearChecked = async () => {
        if (busy) return;
        setBusy(true);
        await fetch('/api/bruh/lists/items/clear-checked', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ listsId }),
        });
        await loadItems();
        setBusy(false);
    };

    if (!list && alert.message) {
        return (
            <>
                <Section id={'bruh-list-missing'}>
                    <h1>List not found</h1>
                    <p>{alert.message}</p>
                </Section>
            </>
        );
    }

    const checkedCount = items.filter((i) => i.checked).length;

    return (
        <>
            <Section id={'bruh-list-header'}>
                <Flex justifyContent={'space-between'} alignItems={'center'}>
                    <FlexItem>
                        <h1>{list?.name ?? 'List'}</h1>
                    </FlexItem>
                    <FlexItem>
                        {checkedCount > 0 && (
                            <button
                                className={'button button-danger'}
                                onClick={() => void clearChecked()}
                                disabled={busy}>
                                Delete Checked ({checkedCount})
                            </button>
                        )}
                    </FlexItem>
                </Flex>
            </Section>

            <Section id={'bruh-list-body'} removeArticle={true}>
                <Alert success={alert.success} message={alert.message} />

                <form
                    onSubmit={(e) => void addItem(e)}
                    style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <input
                        type={'text'}
                        value={newItem}
                        onChange={(e) => setNewItem(e.target.value)}
                        placeholder={'Add an item…'}
                        autoComplete={'off'}
                        style={{
                            flexGrow: 1,
                            padding: '15px 20px',
                            fontSize: '16px',
                            border: 'solid 1px var(--gray-200)',
                            borderRadius: '10px',
                        }}
                    />
                    <button type={'submit'} className={'button'} disabled={busy || !newItem.trim()}>
                        Add
                    </button>
                </form>

                <ul className={'list-items'}>
                    {items.map((item) => {
                        const isEditing = editingId === item.listItemsId;
                        return (
                            <li
                                key={item.listItemsId}
                                className={`list-item ${item.checked ? 'checked' : ''} ${isEditing ? 'editing' : ''}`}
                                onClick={() => {
                                    if (!isEditing) void toggleItem(item);
                                }}>
                                <span className={'list-item-check'} aria-hidden={true}>
                                    {item.checked ? '✓' : ''}
                                </span>
                                {isEditing ? (
                                    <form
                                        className={'list-item-edit'}
                                        onSubmit={(e) => void saveEdit(e, item)}
                                        onClick={(e) => e.stopPropagation()}>
                                        <input
                                            type={'text'}
                                            value={editingName}
                                            onChange={(e) => setEditingName(e.target.value)}
                                            autoFocus={true}
                                            autoComplete={'off'}
                                            className={'list-item-edit-input'}
                                        />
                                        <button type={'submit'} className={'button'}>
                                            Save
                                        </button>
                                        <button
                                            type={'button'}
                                            className={'button button-secondary'}
                                            onClick={cancelEdit}>
                                            Cancel
                                        </button>
                                    </form>
                                ) : (
                                    <>
                                        <span className={'list-item-name'}>{item.name}</span>
                                        <span className={'list-item-actions'}>
                                            <button
                                                type={'button'}
                                                className={'list-item-action'}
                                                aria-label={'Edit item'}
                                                onClick={(e) => startEdit(e, item)}>
                                                <span className={'material-symbols-outlined'}>
                                                    edit
                                                </span>
                                            </button>
                                            <button
                                                type={'button'}
                                                className={'list-item-action danger'}
                                                aria-label={'Delete item'}
                                                onClick={(e) => requestDelete(e, item)}>
                                                <span className={'material-symbols-outlined'}>
                                                    delete
                                                </span>
                                            </button>
                                        </span>
                                    </>
                                )}
                            </li>
                        );
                    })}
                    {items.length === 0 && (
                        <li className={'list-empty'}>Nothing here yet. Add something above.</li>
                    )}
                </ul>
            </Section>

            {pendingDelete && (
                <ConfirmModal
                    onConfirm={() => void confirmDelete()}
                    onCancel={() => setPendingDelete(null)}
                    confirmLabel={'Delete'}>
                    <Flex>
                        <FlexItem>
                            <p>Delete &quot;{pendingDelete.name}&quot;?</p>
                        </FlexItem>
                    </Flex>
                </ConfirmModal>
            )}
        </>
    );
}
