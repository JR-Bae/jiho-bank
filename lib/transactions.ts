import { kv } from '@/lib/kv';
import { Transaction } from '@/types/transaction';

export const saveTransaction = async (transaction: Transaction) => {
    await kv.set(`transaction:${transaction.id}`, transaction);
};

export const getTransactions = async (): Promise<Transaction[]> => {
    const keys = await kv.keys('transaction:*');
    if (keys.length === 0) return [];
    const transactions = await Promise.all(keys.map((key) => kv.get<Transaction>(key)));
    return transactions.filter((tx): tx is Transaction => tx !== null);
};

export const updateBalance = async (amount: number) => {
    const currentBalance = await kv.get<number>('currentBalance');
    const newBalance = (currentBalance || 0) + amount;
    await kv.set('currentBalance', newBalance);
    return newBalance;
};

export const getBalance = async (): Promise<number> => {
    const balance = await kv.get<number>('currentBalance');
    return balance || 0;
};
