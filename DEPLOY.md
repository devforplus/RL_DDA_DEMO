# 배포 가이드

## 🚀 Cloudflare Pages 배포 방법

### 사전 요구사항
- GitHub 계정
- Cloudflare 계정 (https://cloudflare.com)

### 배포 단계

#### 1. GitHub에 코드 푸시
```bash
git push origin main
```

#### 2. Cloudflare Pages에서 프로젝트 생성

1. https://dash.cloudflare.com 접속
2. 좌측 메뉴에서 **Workers & Pages** 선택
3. **Create application** > **Pages** > **Connect to Git** 선택
4. 이 저장소 선택 (`RL_DDA_DEMO`)
5. 다음 설정 입력:

**프로젝트 설정:**
- **Project name**: rl-dda-demo (또는 원하는 이름)
- **Production branch**: `main`
- **Framework preset**: Vite
- **Build command**: `pnpm build`
- **Build output directory**: `dist`
- **Root directory**: `frontend`

**환경 변수:**
```
VITE_API_BASE=https://api.devfor.plus
```
또는 Cloudflare Workers를 사용하는 경우:
```
VITE_API_BASE=https://your-api-worker.your-account.workers.dev
```

6. **Save and Deploy** 클릭

#### 3. 자동 배포 확인
- 이후 `main` 브랜치에 푸시하면 자동으로 배포됩니다
- Pull Request를 만들면 미리보기 배포가 생성됩니다

### 🌐 배포 후 확인사항

배포가 완료되면 Cloudflare Pages가 제공하는 URL (예: `rl-dda-demo.pages.dev`)로 접속하여 다음을 확인:

1. **홈페이지 로드 확인**
2. **랭킹 페이지에서 백엔드 연결 확인**
   - `/rank` 페이지에서 데이터가 로드되는지 확인
   - 브라우저 개발자 도구에서 API 요청 확인

3. **게임 플레이 테스트**
   - `/play` 페이지에서 게임 실행
   - 점수 제출 후 랭킹에 반영되는지 확인

### 🔧 문제 해결

#### CORS 오류 발생 시
백엔드 서버에서 Cloudflare Pages 도메인을 허용해야 합니다:
```python
# FastAPI 백엔드 예시
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://rl-dda-demo.pages.dev",
        "https://devfor.plus",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### 빌드 실패 시
1. 로컬에서 `cd frontend && pnpm build`가 성공하는지 확인
2. Cloudflare Pages 대시보드에서 빌드 로그 확인
3. 환경 변수가 올바르게 설정되었는지 확인
4. Node.js 버전 확인 (Cloudflare Pages는 기본적으로 최신 LTS 사용)

## 🌐 커스텀 도메인 설정 (devfor.plus 사용)

### 도메인 구조
- **프론트엔드**: `devfor.plus` (또는 `www.devfor.plus`)
- **백엔드 API**: `api.devfor.plus`

### 설정 방법

#### 1. 백엔드 도메인 설정

백엔드 서버를 `api.devfor.plus`로 설정:

**DNS 레코드 추가 (Cloudflare DNS):**
```
Type: A 또는 CNAME
Name: api
Value: [백엔드 서버 IP 또는 Workers URL]
```

Cloudflare Workers를 사용하는 경우:
```
Type: CNAME
Name: api
Value: your-api-worker.your-account.workers.dev
```

#### 2. Cloudflare Pages 프론트엔드 도메인 설정

**2-1. Cloudflare Pages 대시보드에서 설정:**
1. Pages 프로젝트 페이지 접속
2. **Custom domains** 탭 클릭
3. **Set up a custom domain** 클릭
4. 도메인 입력:
   - `devfor.plus` 또는
   - `www.devfor.plus`
5. **Continue** 클릭

**2-2. DNS 레코드 자동 생성:**

Cloudflare가 도메인을 호스팅하는 경우, DNS 레코드가 자동으로 생성됩니다.
외부 DNS를 사용하는 경우, 다음 레코드를 추가:

**루트 도메인 (devfor.plus)**
```
Type: CNAME
Name: @
Value: rl-dda-demo.pages.dev
```

**www 서브도메인 (www.devfor.plus)**
```
Type: CNAME
Name: www
Value: rl-dda-demo.pages.dev
```

#### 3. CORS 설정 업데이트

백엔드 서버(`api.devfor.plus`)의 CORS 설정 업데이트:

```python
# FastAPI 백엔드 예시
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://devfor.plus",
        "https://www.devfor.plus",
        "https://rl-dda-demo.pages.dev",
        "http://localhost:5173",  # 로컬 개발용
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### 4. 확인

- **프론트엔드**: https://devfor.plus 접속
- **백엔드 API**: https://api.devfor.plus/api/gameplay/rankings 테스트

### DNS 전파 시간
- Cloudflare DNS는 일반적으로 몇 분 이내에 전파됩니다
- 외부 DNS를 사용하는 경우 최대 24-48시간 소요될 수 있음

## 🔒 보안 설정 (권장)

Cloudflare Pages는 다음과 같은 보안 기능을 제공합니다:

1. **자동 HTTPS/SSL**: 무료 SSL 인증서 자동 발급
2. **DDoS 보호**: Cloudflare의 DDoS 보호 기능 자동 활성화
3. **WAF (Web Application Firewall)**: Pro 플랜 이상에서 사용 가능
4. **Access Headers**: Pages 설정에서 보안 헤더 추가 가능

### 보안 헤더 추가 (권장)

`frontend/public/_headers` 파일 생성:

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## 📊 Cloudflare Workers (백엔드 배포 옵션)

FastAPI/Python 백엔드 대신 Cloudflare Workers를 사용하는 경우:

### Workers 배포
```bash
# Wrangler CLI 설치
pnpm add -g wrangler

# Workers 프로젝트 생성
wrangler init my-api

# 배포
wrangler deploy
```

### Workers KV를 사용한 데이터 저장
```javascript
// Worker 스크립트 예시
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    if (url.pathname === '/api/gameplay/rankings') {
      const rankings = await env.RANKINGS.get('top-scores', 'json');
      return new Response(JSON.stringify(rankings), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response('Not found', { status: 404 });
  }
};
```

## 📝 참고

- **배포 URL**: 기본적으로 `<project-name>.pages.dev` 형식
- **환경 변수 수정**: Cloudflare Pages 대시보드 > Settings > Environment variables
- **롤백**: Cloudflare Pages 대시보드에서 이전 배포 버전으로 즉시 롤백 가능
- **빌드 로그**: 각 배포마다 상세한 빌드 로그 제공
- **Analytics**: Cloudflare Web Analytics 무료 사용 가능
- **성능**: Cloudflare의 글로벌 CDN을 통한 빠른 컨텐츠 전송
- **무료 제공량**: 
  - 무제한 요청
  - 무제한 대역폭
  - 500회 빌드/월
  - 동시 빌드: 1개

## 🔗 유용한 링크

- [Cloudflare Pages 문서](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers 문서](https://developers.cloudflare.com/workers/)
- [Wrangler CLI 문서](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare Dashboard](https://dash.cloudflare.com)
