import { kv } from '@/lib/kv';

export interface Transaction {
    id: string;
    type: 'add' | 'spend';
    amount: number;
    memo?: string | null;
    photo?: string | null;
    date: string;
}

export const saveTransaction = async (transaction: Transaction) => {
    await kv.set(`transaction:${transaction.id}`, transaction);
};

export const getTransactions = async (): Promise<Awaited<Transaction | null>[]> => {
    const keys = await kv.keys('transaction:*');
    const transactions = await Promise.all(
        keys.map((key) => kv.get<Transaction>(key))
    );
    return transactions.filter(Boolean);
};
