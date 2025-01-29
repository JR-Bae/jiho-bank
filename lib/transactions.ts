import { kv } from '@/lib/kv';
import { Transaction } from '@/types/transaction';

/** 🚀 트랜잭션 저장 */
export const saveTransaction = async (transaction: Transaction) => {
    try {
        await kv.set(`transaction:${transaction.id}`, JSON.stringify(transaction));
    } catch (error) {
        console.error('❌ saveTransaction 오류:', error);
        throw error;
    }
};

/** 🚀 모든 트랜잭션 가져오기 */
export const getTransactions = async (): Promise<Transaction[]> => {
    try {
        const keys = await kv.keys('transaction:*');
        if (keys.length === 0) return [];

        const transactions = await Promise.all(
            keys.map(async (key) => {
                const data = await kv.get(key); // 🔥 `kv.get<string>(key)` → `kv.get(key)`
                return data ? JSON.parse(data as string) : null;
            })
        );

        return transactions.filter((tx): tx is Transaction => tx !== null);
    } catch (error) {
        console.error('❌ getTransactions 오류:', error);
        return [];
    }
};

/** 🚀 잔액 업데이트 */
export const updateBalance = async (amount: number) => {
    try {
        const currentBalanceStr = await kv.get('currentBalance');
        const currentBalance = currentBalanceStr ? Number(currentBalanceStr) : 0;
        const newBalance = currentBalance + amount;

        await kv.set('currentBalance', String(newBalance));
        return newBalance;
    } catch (error) {
        console.error('❌ updateBalance 오류:', error);
        throw error;
    }
};

/** 🚀 현재 잔액 가져오기 */
export const getBalance = async (): Promise<number> => {
    try {
        const balanceStr = await kv.get('currentBalance');
        return balanceStr ? Number(balanceStr) : 0;
    } catch (error) {
        console.error('❌ getBalance 오류:', error);
        return 0;
    }
};
