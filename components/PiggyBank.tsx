'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Moon, Sun, Type } from 'lucide-react';
import { fonts } from '@/lib/fonts';
import Image from 'next/image';
import { Transaction } from '@/types/transaction';
import { optimizeImage } from '@/lib/imageUtils';  // uploadToBlob 대신 optimizeImage 임포트

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('/api/transactions');
                const { transactions, balance } = await response.json();
                setBalance(balance);
                setTransactions(transactions);

                const savedFont = localStorage.getItem('selected-font');
                if (savedFont) setCurrentFont(Number(savedFont));
            } catch (error) {
                console.error('데이터 로드 중 오류 발생:', error);
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

        const amountValue = Number(amount);

        setIsAnimating(true); // 💰 애니메이션 시작
        setTimeout(async () => {
            setIsAnimating(false); // 💰 애니메이션 종료

            try {
                const newTransaction: Transaction = {
                    id: Date.now().toString(),
                    type: 'add',
                    amount: amountValue,
                    memo: null,
                    photo: null,
                    date: new Date().toISOString(),
                };

                // API 요청을 통해 서버에서 저장 & 잔액 업데이트
                const response = await fetch('/api/transactions', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ transaction: newTransaction, amount: amountValue }),
                });

                if (!response.ok) throw new Error('서버 오류 발생');

                const { newBalance } = await response.json();

                // 상태 업데이트
                setBalance(newBalance);
                setTransactions((prev) => [newTransaction, ...prev]);

                alert('저금이 완료되었습니다!');
            } catch (error) {
                console.error('저금 처리 중 오류 발생:', error);
                alert('저금 처리에 실패했습니다. 다시 시도해주세요.');
            }
        }, 1000);
    };

    const handleSpendMoney = async () => {
        const amount = prompt('얼마를 사용할까요?');
        if (!amount || isNaN(Number(amount))) return;

        const amountValue = Number(amount);
        if (amountValue > balance) {
            alert('잔액이 부족합니다!');
            return;
        }

        const memo = prompt('어디에 사용했나요? (선택사항)');
        const wantPhoto = confirm('사진을 추가할까요?');

        let photoUrl: string | null = null;
        if (wantPhoto) {
            try {
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
                    // 이미지 최적화
                    const optimizedBlob = await optimizeImage(file);

                    // 안전한 파일명 생성
                    const timestamp = Date.now();
                    const safeFilename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

                    // API route를 통해 업로드
                    const response = await fetch(`/api/upload?filename=uploads/${safeFilename}`, {
                        method: 'POST',
                        body: optimizedBlob,
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.error || 'Failed to upload image');
                    }

                    const blobData = await response.json();
                    photoUrl = blobData.url;
                }
            } catch (error) {
                console.error('사진 업로드 실패:', error);
                alert('사진 업로드에 실패했습니다. 다시 시도해주세요.');
                return;
            }
        }

        try {
            const newTransaction: Transaction = {
                id: Date.now().toString(),
                type: 'spend',
                amount: amountValue,
                memo: memo || null,
                photo: photoUrl,
                date: new Date().toISOString(),
            };

            const response = await fetch('/api/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transaction: newTransaction, amount: -amountValue }),
            });

            if (!response.ok) throw new Error('서버 오류 발생');

            const { newBalance } = await response.json();

            setBalance(newBalance);
            setTransactions((prev) => [newTransaction, ...prev]);

            alert('사용 내역이 저장되었습니다!');
        } catch (error) {
            console.error('사용 내역 저장 중 오류 발생:', error);
            alert('사용 내역 저장에 실패했습니다. 다시 시도해주세요.');
        }
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
                            <div className="w-full bg-background">
                                <div className="relative w-full" style={{ maxHeight: '70vh' }}>
                                    <Image
                                        src={tx.photo}
                                        alt="거래 사진"
                                        width={800}
                                        height={1200}
                                        className="w-full h-auto max-h-[70vh] object-contain mx-auto"
                                        quality={95}
                                        priority={transactions.indexOf(tx) < 2}
                                    />
                                </div>
                            </div>
                        )}

                        {/* 거래 내용 */}
                        <div className="p-4">
                            {/* 메모 */}
                            {tx.memo && (
                                <p className="text-lg mb-2 text-foreground">
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
