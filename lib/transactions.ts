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

export const getTransactions = async (): Promise<Transaction[]> => {
    // Redis에서 'transaction:*' 키들을 가져옴
    const keys = await kv.keys('transaction:*');

    // 키가 없을 경우 기본 값 생성
    if (keys.length === 0) {
        await kv.set('currentBalance', 0); // 기본 잔액 설정
        console.log("No transactions found. Initialized with default balance.");
        return []; // 빈 트랜잭션 리스트 반환
    }

    // 트랜잭션 데이터 가져오기
    const transactions = await Promise.all(
        keys.map((key) => kv.get<Transaction>(key))
    );

    return transactions.filter(Boolean); // null 값 제거 후 반환
};

