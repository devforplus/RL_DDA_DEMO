# 배포 가이드

## 🚀 Vercel 배포 방법

### 사전 요구사항
- GitHub 계정
- Vercel 계정 (https://vercel.com - GitHub로 가입 가능)

### 배포 단계

#### 1. GitHub에 코드 푸시
```bash
git push origin main
```

#### 2. Vercel에서 프로젝트 가져오기
1. https://vercel.com/new 접속
2. "Import Git Repository" 선택
3. 이 저장소 선택 (`rl_dda_demo`)
4. 다음 설정 입력:

**프로젝트 설정:**
- **Framework Preset**: Vite
- **Root Directory**: `frontend`
- **Build Command**: `pnpm build`
- **Output Directory**: `dist`
- **Install Command**: `pnpm install`

**환경 변수:**
```
VITE_API_BASE=https://api.devfor.plus
```

5. "Deploy" 클릭

#### 3. 자동 배포 확인
- 이후 `main` 브랜치에 푸시하면 자동으로 배포됩니다
- Pull Request를 만들면 미리보기 배포가 생성됩니다

### 🌐 배포 후 확인사항

배포가 완료되면 Vercel이 제공하는 URL (예: `your-project.vercel.app`)로 접속하여 다음을 확인:

1. **홈페이지 로드 확인**
2. **랭킹 페이지에서 AWS 백엔드 연결 확인**
   - `/rank` 페이지에서 데이터가 로드되는지 확인
   - 브라우저 개발자 도구에서 `https://devfor.plus/api/...` 요청 확인

3. **게임 플레이 테스트**
   - `/play` 페이지에서 게임 실행
   - 점수 제출 후 랭킹에 반영되는지 확인

### 🔧 문제 해결

#### CORS 오류 발생 시
백엔드 서버(devfor.plus)에서 Vercel 도메인을 허용해야 합니다:
```python
# FastAPI 백엔드 예시
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-project.vercel.app",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

#### 빌드 실패 시
1. 로컬에서 `pnpm build`가 성공하는지 확인
2. Vercel 대시보드에서 빌드 로그 확인
3. 환경 변수가 올바르게 설정되었는지 확인

## 🌐 커스텀 도메인 설정 (devfor.plus 사용)

### 도메인 구조
- **프론트엔드**: `devfor.plus` (또는 `www.devfor.plus`)
- **백엔드 API**: `api.devfor.plus`

### 설정 방법

#### 1. AWS 백엔드 도메인 설정

AWS에서 백엔드를 `api.devfor.plus`로 설정:

**DNS 레코드 추가 (Route 53 또는 도메인 제공업체):**
```
Type: A 또는 CNAME
Name: api
Value: [AWS 서버 IP 또는 주소]
```

#### 2. Vercel 프론트엔드 도메인 설정

**2-1. Vercel 대시보드에서 설정:**
1. Vercel 프로젝트 페이지 접속
2. **Settings** > **Domains** 클릭
3. **Add Domain** 입력:
   - `devfor.plus` 또는
   - `www.devfor.plus`
4. **Add** 클릭

**2-2. DNS 레코드 설정:**

Vercel이 제공하는 DNS 레코드를 도메인 제공업체에 추가:

**Option A: 루트 도메인 (devfor.plus)**
```
Type: A
Name: @
Value: 76.76.21.21
```

**Option B: www 서브도메인 (www.devfor.plus)**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

**루트 도메인에서 www로 리다이렉트 설정:**
```
Type: A
Name: @
Value: 76.76.21.21

Type: CNAME
Name: www
Value: cname.vercel-dns.com
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
- DNS 변경 후 최대 24-48시간 소요될 수 있음
- 보통 몇 분 ~ 몇 시간 내 완료

## 📝 참고

- **배포 URL 설정**: Vercel에서 커스텀 도메인 설정 가능
- **환경 변수 수정**: Vercel 대시보드 > Settings > Environment Variables
- **롤백**: Vercel 대시보드에서 이전 배포 버전으로 즉시 롤백 가능
- **SSL 인증서**: Vercel과 AWS 모두 자동으로 SSL 인증서 발급

