import { Section } from '@/components/section/Section';

// Placeholder — model TBD. Options being considered: points-per-task with a
// reward catalog, tie-in with allowance, streak-based unlocks, or none at all
// (keep chores intrinsically motivated). Decision deferred; page just exists
// so the nav link isn't a 404.
export default function BruhAdminRewards() {
    return (
        <>
            <Section id={'bruh-admin-rewards-header'} className={'admin-section'}>
                <h1>Rewards</h1>
            </Section>
            <Section id={'bruh-admin-rewards'} className={'admin-section'}>
                <p style={{ marginBottom: '10px' }}>Coming soon.</p>
                <p style={{ opacity: 0.7 }}>
                    Reward mechanics haven&apos;t been decided yet — see the notes in the
                    feature backlog. This page keeps the nav link from 404&apos;ing while
                    the design is still open.
                </p>
            </Section>
        </>
    );
}
