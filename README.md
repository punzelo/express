# Express REST API

Vercel로 배포 가능한 Express REST API 서버입니다.

## 프로젝트 구조

```
express-rest-api/
├── api/
│   └── index.js           # Express 앱 메인 파일
├── package.json           # 의존성 관리
├── vercel.json           # Vercel 배포 설정
├── .env.example          # 환경 변수 예제
├── .gitignore            # Git 무시 파일
└── README.md             # 이 파일
```

## 설정 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example` 파일을 기반으로 `.env` 파일을 생성합니다:

```bash
# .env 파일 생성
cp .env.example .env
```

### 3. 로컬 개발 서버 실행

```bash
npm run dev
```

서버가 `http://localhost:3000`에서 실행됩니다.

### 4. 프로덕션 모드 실행

```bash
npm start
```

## API 엔드포인트

### 홈
- **GET** `/`
  - 응답: API 기본 정보

### 헬스 체크
- **GET** `/api/health`
  - 응답: 서버 상태 확인

### 사용자 목록
- **GET** `/api/users`
  - 응답: 사용자 목록

### 사용자 상세
- **GET** `/api/users/:id`
  - 응답: 특정 사용자 정보

### 사용자 생성
- **POST** `/api/users`
  - 요청: `{ "name": "string", "email": "string" }`
  - 응답: 생성된 사용자 정보

## Vercel 배포

### 배포 전 준비

1. GitHub 저장소에 코드 푸시
2. [Vercel 웹사이트](https://vercel.com)에서 로그인
3. "New Project" 클릭

### 배포 방법

1. GitHub 저장소 선택
2. 프로젝트 이름 입력
3. "Deploy" 클릭

Vercel이 자동으로 `vercel.json` 설정을 읽어 배포를 진행합니다.

### 환경 변수 설정 (Vercel)

Vercel 대시보드에서 "Settings" → "Environment Variables"로 이동하여 필요한 환경 변수를 추가합니다.

## CORS 설정

`api/index.js`의 `cors()` 미들웨어를 통해 CORS가 활성화되어 있습니다.

특정 도메인만 허용하려면:

```javascript
app.use(cors({
  origin: 'https://yourdomain.com',
  credentials: true
}));
```

## 에러 처리

API는 다음과 같은 에러 응답을 반환합니다:

- **400**: Bad Request - 요청 매개변수 오류
- **404**: Not Found - 엔드포인트를 찾을 수 없음
- **500**: Internal Server Error - 서버 에러

## 라이센스

MIT
