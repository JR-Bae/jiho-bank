'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun, Type } from 'lucide-react';
import { fonts } from '@/lib/fonts';
import Image from 'next/image';
import { saveTransaction, getTransactions } from '@/lib/transactions';
import { uploadToBlob } from '@/lib/blob';
import { Redis } from '@upstash/redis';

interface Transaction {
    id: string;
    type: 'add' | 'spend';
    amount: number;
    memo?: string | null;
    photo?: string | null;
    date: string;
}

interface FontOption {
    name: string;
    className: string;
}

const fontOptions: FontOption[] = [
    { name: '가애구', className: fonts.gaegu },
    { name: '하이멜로디', className: fonts.hiMelody },
    { name: '푸어스토리', className: fonts.poorStory },
    { name: '동글', className: fonts.dongle },
];

export default function PiggyBank() {
    const [balance, setBalance] = useState<number>(0);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isAnimating, setIsAnimating] = useState<boolean>(false);
    const [currentFont, setCurrentFont] = useState<number>(0);
    const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();
    const redis = new Redis({
        url: 'https://noble-bison-26037.upstash.io',
        token: 'AWW1AAIjcDFhYjc2Mjc0NTljMGQ0MzgxOTZiZTM3ZDE0MGYzMjkxMnAxMA',
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Redis에서 트랜잭션과 현재 잔액 가져오기
                const transactionsFromRedis = await getTransactions();
                const balanceFromRedis = await redis.get<number>('currentBalance');

                // 2. 상태 업데이트
                setBalance(balanceFromRedis || 0);
                // @ts-ignore
                setTransactions(transactionsFromRedis);

                // 3. 글꼴 설정 (로컬 스토리지 사용)
                const savedFont = localStorage.getItem('selected-font');
                if (savedFont) {
                    setCurrentFont(Number(savedFont));
                }
            } catch (error) {
                console.error('Redis 데이터 가져오기 오류:', error);

                // Redis 호출 실패 시 로컬 스토리지 데이터 사용
                const savedData = localStorage.getItem('piggybank-data');
                if (savedData) {
                    const data = JSON.parse(savedData);
                    setBalance(data.balance);
                    setTransactions(data.transactions);
                }
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('.font-dropdown')) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const formatKoreanNumber = (num: number) => {
        if (num === 0) return '영원';

        const units = ['', '만', '억', '조'];
        const smallUnits = ['', '십', '백', '천'];
        const koreanNumbers = ['영', '일', '이', '삼', '사', '오', '육', '칠', '팔', '구'];

        let result = '';
        let unitIndex = 0;
        let numStr = num.toString();

        while (numStr.length > 0) {
            const chunk = numStr.slice(-4);
            numStr = numStr.slice(0, -4);

            let chunkResult = '';
            for (let i = 0; i < chunk.length; i++) {
                const digit = parseInt(chunk[i]);
                if (digit !== 0) {
                    if (digit === 1 && i < chunk.length - 1) {
                        chunkResult += smallUnits[chunk.length - 1 - i];
                    } else {
                        chunkResult += koreanNumbers[digit] + smallUnits[chunk.length - 1 - i];
                    }
                }
            }

            if (chunkResult) {
                result = chunkResult + units[unitIndex] + ' ' + result;
            }
            unitIndex++;
        }

        return result.trim() + '원';
    };

    const handleAddMoney = async () => {
        const amount = prompt('얼마를 넣을까요?');
        if (!amount || isNaN(Number(amount))) return;

        setIsAnimating(true);
        setTimeout(async () => {
            setIsAnimating(false);

            const newBalance = balance + Number(amount);
            setBalance(newBalance);

            const newTransaction: Transaction = {
                id: Date.now().toString(),
                type: 'add',
                amount: Number(amount),
                memo: null,
                photo: null,
                date: new Date().toISOString(),
            };

            const newTransactions = [newTransaction, ...transactions];
            setTransactions(newTransactions);

            // Redis에 데이터 저장
            try {
                await redis.set(`transaction:${newTransaction.id}`, newTransaction);
                await redis.set('currentBalance', newBalance);
            } catch (err) {
                console.error('Redis 저장 중 오류 발생:', err);
            }

            // // 로컬 스토리지 백업 (선택)
            // localStorage.setItem(
            //     'piggybank-data',
            //     JSON.stringify({ balance: newBalance, transactions: newTransactions })
            // );
        }, 1000);
    };

    const handleSpendMoney = async () => {
        const amount = prompt('얼마를 사용할까요?');
        if (!amount || isNaN(Number(amount))) return;

        const memo = prompt('어디에 사용했나요? (선택사항)');
        const wantPhoto = confirm('사진을 추가할까요?');

        let photoUrl = null;
        if (wantPhoto) {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';

            const file = await new Promise<File | null>((resolve) => {
                input.onchange = (e) => {
                    const files = (e.target as HTMLInputElement).files;
                    resolve(files ? files[0] : null);
                };
                input.click();
            });

            if (file) {
                photoUrl = await uploadToBlob(file);
            }
        }

        const transaction: Transaction = {
            id: Date.now().toString(),
            type: 'spend',
            amount: Number(amount),
            memo: memo || null,
            photo: photoUrl,
            date: new Date().toISOString(),
        };

        await saveTransaction(transaction);
        setTransactions([transaction, ...transactions]);
    };

    const handleFontChange = (index: number) => {
        setCurrentFont(index);
        setIsDropdownOpen(false);
        localStorage.setItem('selected-font', String(index));
    };

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null; // 또는 로딩 상태 표시
    }

    const toggleTheme = () => {
        setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    return (
        <div className={`max-w-4xl mx-auto p-4 ${fontOptions[currentFont].className}`}>
            {/* 헤더 */}
            <div className="mb-8">
                <div className="flex justify-end items-center mb-4">
                    {/* 글꼴 선택 및 테마 전환 버튼 */}
                    <div className="flex gap-2 relative">
                        <div className="font-dropdown">
                            <button
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center gap-1"
                            >
                                <Type size={20}/>
                                <span className="text-sm">글꼴</span>
                            </button>
                            {isDropdownOpen && (
                                <div
                                    className="absolute right-0 mt-2 w-48 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50">
                                    {fontOptions.map((font, index) => (
                                        <button
                                            key={font.name}
                                            className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 ${
                                                currentFont === index ? 'bg-gray-100 dark:bg-gray-700' : ''
                                            }`}
                                            onClick={() => handleFontChange(index)}
                                        >
                                            {font.name}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                            aria-label="Toggle theme"
                        >
                            {mounted && theme === 'dark' ? <Sun size={24}/> : <Moon size={24}/>}
                        </button>
                    </div>
                </div>
                <h1 className="text-3xl font-bold text-center">지호의 저금통</h1>
            </div>

            {/* 금액 표시 섹션 */}
            <div className="text-center mb-8 bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md">
                <div className="text-4xl font-bold mb-2">{balance.toLocaleString()}원</div>
                <div className="text-xl text-gray-600 dark:text-gray-400">{formatKoreanNumber(balance)}</div>
            </div>

            {/* 저금통 섹션 */}
            <div className="relative h-40 mb-8">
                {isAnimating && (
                    <div className="absolute drop-coin">
                        <Image src="/money.png" alt="돈" className="w-16 h-16 mx-auto"
                               width={128}
                               height={128}
                               layout="intrinsic"/>
                    </div>
                )}
                <Image
                    src="/piggy.png"
                    alt="저금통"
                    className="w-32 h-32 mx-auto"
                    width={128}
                    height={128}
                    layout="intrinsic"
                />
            </div>

            {/* 버튼 섹션 */}
            <div className="flex justify-center gap-4 mb-8 bg-gray-100 dark:bg-gray-800 p-6 rounded-lg shadow-md">
                {/* 돈 넣기 버튼 */}
                <button
                    onClick={handleAddMoney}
                    className="flex flex-col items-center justify-between p-4 bg-green-100 dark:bg-green-900 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 active:scale-95 transition-transform duration-150 button-touch h-40 w-40"
                >
                    <Image src="/add-money.png" alt="돈 넣기" className="w-24 h-24 object-contain"
                           width={128}
                           height={128}
                           layout="intrinsic"/>
                    <span className="text-lg font-bold mt-2">돈 넣기</span>
                </button>

                {/* 돈 쓰기 버튼 */}
                <button
                    onClick={handleSpendMoney}
                    className="flex flex-col items-center justify-between p-4 bg-red-100 dark:bg-red-900 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 active:scale-95 transition-transform duration-150 button-touch h-40 w-40"
                >
                    <Image src="/use-money.png" alt="돈 쓰기" className="w-24 h-24 object-contain"
                           width={128}
                           height={128}
                           layout="intrinsic"/>
                    <span className="text-lg font-bold mt-2">돈 쓰기</span>
                </button>
            </div>

            {/* 돈 사용 이야기 섹션 */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold mb-4">돈 사용한 이야기</h2>
                {transactions.map((tx) => (
                    <div
                        key={tx.id}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden"
                    >
                        {/* 사진 표시 */}
                        {tx.photo && (
                            <Image
                                src={tx.photo}
                                alt="거래 사진"
                                className="w-full h-48 object-cover"
                                width={128}
                                height={128}
                                layout="intrinsic"
                            />
                        )}

                        {/* 거래 내용 */}
                        <div className="p-4">
                            {/* 메모 */}
                            {tx.memo && (
                                <p className="text-lg mb-2 text-gray-900 dark:text-gray-100">
                                    {tx.memo}
                                </p>
                            )}
                            <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                                {/* 거래 날짜 */}
                                <span>{new Date(tx.date).toLocaleString()}</span>
                                {/* 금액 */}
                                <span
                                    className={`text-lg font-bold ${
                                        tx.type === 'add' ? 'text-green-500' : 'text-red-500'
                                    }`}
                                >
                        {tx.type === 'add' ? '+' : '-'}
                                    {tx.amount.toLocaleString()}원
                    </span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

}
