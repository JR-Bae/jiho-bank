import { NextApiRequest, NextApiResponse } from 'next';
import { saveTransaction, getTransactions, updateBalance, getBalance } from '@/lib/transactions';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        switch (req.method) {
            case 'GET': {
                const transactions = await getTransactions();
                const balance = await getBalance();
                res.status(200).json({ transactions, balance });
                break;
            }
            case 'POST': {
                const { transaction, amount } = req.body;
                if (!transaction || amount === undefined) {
                    res.status(400).json({ error: 'Invalid request body' });
                    return;
                }

                await saveTransaction(transaction);
                const newBalance = await updateBalance(amount);
                res.status(200).json({ newBalance });
                break;
            }
            default:
                res.setHeader('Allow', ['GET', 'POST']);
                res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
