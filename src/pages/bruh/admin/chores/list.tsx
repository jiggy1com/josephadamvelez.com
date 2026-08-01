import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BruhNav } from '@/components/bruh/BruhNav';
import { Section } from '@/components/section/Section';
import { ConfirmModal } from '@/components/modal/ConfirmModal';
import { Alert, AlertType } from '@/components/alert/Alert';
import type { Chore } from '@/utils/adminQueries';
import { FlexItem } from '@/components/flexbox/FlexItem';
import { Flex } from '@/components/flexbox/Flex';

export default function BruhAdminChoresList() {
    const [chores, setChores] = useState<Chore[]>([]);
    const [pendingDelete, setPendingDelete] = useState<Chore | null>(null);
    const [alert, setAlert] = useState<AlertType>({ success: false, message: '' });

    const loadChores = async () => {
        const res = await fetch('/api/bruh/admin/chores/list');
        const json = await res.json();
        if (json.success) {
            setChores(json.data);
        } else {
            setAlert({ success: false, message: json.error ?? 'Failed to load chores' });
        }
    };

    useEffect(() => {
        void loadChores();
    }, []);

    const confirmDelete = async () => {
        if (!pendingDelete) return;
        const target = pendingDelete;
        setPendingDelete(null);
        const res = await fetch('/api/bruh/admin/chores/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ choreid: target.choreid }),
        });
        const json = await res.json();
        if (json.success) {
            setAlert({ success: true, message: `Deleted "${target.name}"` });
            await loadChores();
        } else {
            setAlert({ success: false, message: json.error ?? 'Failed to delete chore' });
        }
    };

    return (
        <>
            <BruhNav />
            <Section id={'bruh-admin-chores-list-header'} className={'admin-section'}>
                <Flex justifyContent={'space-between'} alignItems={'center'}>
                    <FlexItem>
                        <h1>Chores</h1>
                    </FlexItem>
                    <FlexItem>
                        <Link href={'/bruh/admin/chores/add'} className={'button'}>
                            Add
                        </Link>
                    </FlexItem>
                </Flex>
            </Section>
            <Section id={'bruh-admin-chores-list'} className={'admin-section'}>
                <Alert success={alert.success} message={alert.message} />
                <Flex flexDirection={'column'} className={'chore-rows'}>
                    {chores.map((chore) => (
                        <Flex
                            key={chore.choreid}
                            alignItems={'center'}
                            gap={'10px'}
                            className={'chore-row'}>
                            <FlexItem flexGrow={1}>{chore.name}</FlexItem>
                            <FlexItem>
                                <Link
                                    href={`/bruh/admin/chores/edit/${chore.choreid}`}
                                    className={'button'}>
                                    Edit
                                </Link>
                            </FlexItem>
                            <FlexItem>
                                <button
                                    className={'button'}
                                    onClick={() => setPendingDelete(chore)}>
                                    Delete
                                </button>
                            </FlexItem>
                        </Flex>
                    ))}
                </Flex>
            </Section>
            {pendingDelete && (
                <ConfirmModal
                    onConfirm={() => void confirmDelete()}
                    onCancel={() => setPendingDelete(null)}
                    confirmLabel={'Confirm'}>
                    <Flex>
                        <FlexItem>
                            <p>Delete chore &quot;{pendingDelete.name}&quot;?</p>
                        </FlexItem>
                    </Flex>
                </ConfirmModal>
            )}
        </>
    );
}
