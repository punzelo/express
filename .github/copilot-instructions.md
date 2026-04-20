<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

## Express REST API 프로젝트 가이드

이 프로젝트는 Vercel로 배포 가능한 Express REST API 서버입니다.

### 프로젝트 구조

- `api/index.js` - Express 앱 메인 파일 (Vercel Serverless Function)
- `vercel.json` - Vercel 배포 설정
- `package.json` - 의존성 관리
- `.env.example` - 환경 변수 예제

### 주요 기능

- Express.js 기반 REST API
- CORS 미들웨어 활성화
- 에러 처리 및 404 핸들러
- 로컬 개발 서버 지원
- Vercel Serverless 배포 지원

### 개발 시작

1. 의존성 설치: `npm install`
2. 개발 서버 실행: `npm run dev`
3. 레이아웃: `http://localhost:3000`

### API 라우트 추가 방법

`api/index.js`에 새로운 라우트를 추가합니다:

```javascript
app.get('/api/route-name', (req, res) => {
  res.json({ data: 'response' });
});
```

### Vercel 배포

1. GitHub에 저장소 푸시
2. Vercel 대시보드에서 프로젝트 연결
3. 자동 배포 (git push 시)

### 환경 변수

- `.env` 파일에서 로컬 환경 변수 설정
- Vercel 대시보드에서 프로덕션 환경 변수 설정
