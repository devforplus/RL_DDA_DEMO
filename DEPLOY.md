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
VITE_API_BASE=https://devfor.plus
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

## 📝 참고

- **배포 URL 설정**: Vercel에서 커스텀 도메인 설정 가능
- **환경 변수 수정**: Vercel 대시보드 > Settings > Environment Variables
- **롤백**: Vercel 대시보드에서 이전 배포 버전으로 즉시 롤백 가능

