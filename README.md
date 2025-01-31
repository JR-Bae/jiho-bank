# 💰 지호의 저금통

**Next.js + Vercel KV + Vercel Blob을 활용한 저금통 애플리케이션**

이 프로젝트는 사용자가 가상의 저금통에 돈을 넣고 사용할 수 있도록 구현되었습니다. 거래 내역과 이미지를 저장할 수 있으며, **Vercel KV**(Redis 기반)와 **Vercel Blob**(이미지 저장소)를 활용합니다.

---

## 🚀 시작하기

### 1️⃣ 프로젝트 클론

```
git clone https://github.com/your-repo/jiho-bank.git
cd jiho-bank
```

### 2️⃣ 환경 변수 설정

프로젝트 루트에 `.env.local` 파일을 생성하고 아래 내용을 입력하세요.

```
KV_REST_API_URL="https://your-vercel-kv-url"
KV_REST_API_TOKEN="your-vercel-kv-token"
BLOB_READ_WRITE_TOKEN="your-vercel-blob-token"
```

⚠ **이 파일은 절대 Git에 올리지 마세요!**
Git에 올라가면 **보안 위험**이 발생할 수 있습니다. `.gitignore`에 `.env.local`을 추가하세요.

---

## 📦 설치 및 실행

### 1️⃣ 패키지 설치

```
npm install
또는
yarn install
```

### 2️⃣ 개발 서버 실행

```
npm run dev
또는
yarn dev
```

서버가 실행되면 브라우저에서 http://localhost:3000 을 열어 확인하세요.

---

## 📤 배포

이 프로젝트는 **Vercel**을 사용하여 배포됩니다. 배포하려면 아래 명령어를 실행하세요.

```
vercel
```

또는 GitHub과 Vercel을 연동하여 자동 배포할 수도 있습니다.

---

## 🛠️ 주요 기능

### ✅ 1. 저금 기능 (돈 넣기)

* 사용자가 돈을 입력하면 애니메이션 효과와 함께 저금됨
* 거래 내역이 **Vercel KV**에 저장됨
* 애니메이션 후에 **잔액이 업데이트됨**

### ✅ 2. 지출 기능 (돈 사용하기)

* 금액을 입력하고, 메모 및 사진을 추가 가능
* 사용한 내역이 **Vercel KV**에 저장됨
* 사진은 **Vercel Blob**을 통해 압축 후 업로드됨
* **잔액이 감소**하고 UI가 실시간 업데이트됨

### ✅ 3. 거래 내역 조회

* 사용자의 저금 및 사용 내역을 불러와 리스트 형태로 표시
* 각각의 거래 내역에 **사진과 메모**가 포함됨
* 최신 거래 내역이 맨 위에 표시됨

### ✅ 4. 데이터 저장 및 관리

* 거래 데이터는 **Vercel KV**(Redis 기반)에서 관리됨
* 업로드된 이미지는 **Vercel Blob**에 저장됨
* 데이터를 불러올 때 **로컬 스토리지와 KV를 함께 활용**하여 속도 최적화

---

## 🔧 기술 스택

**Frontend**
* **Next.js 15**
* **React 18**
* **Tailwind CSS**

**Backend & Database**
* **Vercel KV (Redis 기반)** → 데이터 저장
* **Vercel Blob** → 이미지 저장
* **Serverless API Routes**

---

## 📄 API 설명

### ▶ `/api/transactions` (GET)

```
fetch('/api/transactions')
```
* 모든 거래 내역을 가져옴

### ▶ `/api/transactions` (POST)

```
fetch('/api/transactions', {
  method: 'POST',
  body: JSON.stringify({
    id: '12345',
    type: 'add',
    amount: 5000,
    memo: '용돈 추가',
    date: '2024-01-31',
  })
})
```
* 새로운 거래 내역을 추가함

### ▶ `/api/upload` (POST)

```
const formData = new FormData();
formData.append('file', imageFile);

fetch('/api/upload', {
  method: 'POST',
  body: formData,
});
```
* 이미지를 **Vercel Blob**에 업로드하고 URL을 반환

---

## 📄 라이선스

이 프로젝트는 **MIT 라이선스**를 따릅니다.
