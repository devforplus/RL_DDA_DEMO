# 모델 리플레이 기능 테스트 가이드

## 구현 완료 사항

✅ JSON 변환 스크립트 작성 및 실행
✅ 3개 모델 파일 변환 완료 (enemy_events 추가)
✅ Replay.tsx UI 개선 (모델 선택 기능)
✅ 적 패턴 일관성 검증 완료

## 변환 결과

| 모델 | 플레이 시간 | 총 프레임 | 적 이벤트 | 최종 점수 |
|------|------------|-----------|----------|----------|
| Beginner | 11.8초 | 355 | 2개 | 300 |
| Medium | 21.6초 | 647 | 4개 | 600 |
| Master | 43.9초 | 1317 | 8개 | 1500 |

### 패턴 일관성 확인

✅ **모든 모델이 동일한 적 패턴을 경험합니다**
- 프레임 128에서 모든 모델이 첫 번째 적(EnemyA)을 만남
- 공통 프레임 범위에서 총 2개의 스폰 이벤트가 일관되게 발생
- Beginner의 모든 이벤트가 Medium과 Master에도 존재
- Medium의 모든 이벤트가 Master에도 존재

## 브라우저 테스트 방법

### 1. 프론트엔드 서버 실행

```bash
cd frontend
pnpm dev
```

### 2. 브라우저에서 테스트

1. 브라우저에서 `http://localhost:5173/replay` 접속
2. 모델 선택 드롭다운에서 다음 중 하나 선택:
   - 초급 (Beginner) - Skill: 0.05
   - 중급 (Medium) - Skill: 0.5
   - 고급 (Master) - Skill: 0.95
3. 선택하면 자동으로 해당 모델의 데이터가 로드됨
4. 리플레이 정보 확인:
   - 모델명, 스킬 레벨
   - 최종 점수, 스테이지
   - 총 프레임, 플레이 시간
   - **적 이벤트 수** (중요!)
5. "리플레이 시작" 버튼 클릭
6. AI 에이전트의 플레이가 자동으로 재생됨

### 3. 검증 포인트

#### ✅ JSON 로드 확인
- 각 모델을 선택했을 때 데이터가 올바르게 표시되는지
- 적 이벤트 수가 표시되는지

#### ✅ 리플레이 재생 확인
- 게임이 정상적으로 시작되는지
- 플레이어가 자동으로 움직이는지
- 적이 나타나는지

#### ✅ 적 패턴 일관성 확인
- 각 모델의 리플레이를 재생해서 비교
- 초반에 나타나는 적의 종류와 위치가 동일한지 확인
- Beginner가 경험한 적들을 Medium과 Master도 동일하게 경험하는지

## 개발자 콘솔 확인

브라우저 개발자 도구(F12)의 Console 탭에서 다음을 확인:

```javascript
// 모델 선택 시
Model replay data loaded: {...}
  - Frames: 355
  - Enemy events: 2

// 리플레이 시작 시
Starting replay...
```

## 문제 해결

### 파일을 찾을 수 없음 (404)
- `frontend/public/models/` 디렉토리에 JSON 파일들이 있는지 확인
- 필요시 다시 복사: `xcopy models frontend\public\models\ /E /I /Y`

### 적이 나타나지 않음
- 브라우저 콘솔에서 에러 확인
- `enemy_events` 배열이 비어있지 않은지 확인

### 리플레이가 재생되지 않음
- localStorage에 데이터가 저장되었는지 확인:
  ```javascript
  localStorage.getItem('pyxelReplayData')
  localStorage.getItem('pyxelReplayMode')
  ```

## 검증 스크립트

JSON 파일들의 구조와 일관성을 다시 확인하려면:

```bash
python scripts/verify_replays.py
```

## 원본 파일 복원

변환 전 상태로 돌아가려면:

```bash
copy models\beginner.json.backup models\beginner.json /Y
copy models\master.json.backup models\master.json /Y
copy models\medium.json.backup models\medium.json /Y
```

## 다음 단계

1. ✅ 모든 구현 완료
2. ⏳ 사용자 브라우저 테스트 대기
3. 🔜 필요시 피드백 반영 및 개선

