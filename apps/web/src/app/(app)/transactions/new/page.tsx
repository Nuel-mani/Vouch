import { cookies } from 'next/headers';
import { validateSession } from '@vouch/auth';
import { TransactionForm } from '../_components/TransactionForm';

export default async function NewTransactionPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;
    const user = await validateSession(token!);

    if (!user) return null;

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Add Transaction</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">Record a new income or expense</p>
            </div>

            <TransactionForm />
        </div>
    );
}
