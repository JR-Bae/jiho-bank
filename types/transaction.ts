export interface Transaction {
    id: string;
    type: 'add' | 'spend';
    amount: number;
    memo?: string | null;
    photo?: string | null;
    date: string;
}
