# 게임 데이터 수집 및 랭킹 시스템

## 개요

이 시스템은 웹에서 Pyxel 게임을 플레이한 후, 플레이 데이터를 수집하고 점수를 등록하여 랭킹을 표시하는 기능을 제공합니다.

## 주요 기능

### 1. 게임 플레이 데이터 수집
- **프레임 단위 데이터 수집**: 매 프레임마다 플레이어 위치, 입력, 점수 등을 기록
- **게임 통계 수집**: 
  - 총 플레이 시간
  - 적 처치 수
  - 발사 횟수 및 명중률
  - 사망 횟수
  - 최종 도달 스테이지

### 2. JavaScript-Python 통신
- **localStorage 기반**: iframe 내부에서 실행되는 Pyxel 게임이 localStorage에 데이터 저장
- **폴링 방식**: 프론트엔드에서 500ms마다 localStorage를 체크하여 게임 완료 감지
- **게임 종료 시 자동 전송**: 게임 오버 또는 게임 완료 시 자동으로 데이터를 localStorage에 저장

### 3. 닉네임 입력 및 점수 등록
- **게임 종료 후 UI 표시**: 게임 완료 시 통계와 함께 닉네임 입력 폼 표시
- **점수 등록**: 백엔드 API로 점수 및 메타 정보 전송
- **게임 플레이 데이터 전송**: 전체 게임 플레이 데이터를 백엔드 API로 전송하여 DB에 저장

### 4. 랭킹 시스템
- **리더보드**: 점수 순으로 정렬된 랭킹 표시
- **상위권 하이라이트**: 1~3위에 메달 이모지 및 색상 강조
- **실시간 새로고침**: 버튼 클릭으로 최신 랭킹 갱신

## 구조

### Backend (Python)

#### 1. `game_data_collector.py`
게임 플레이 데이터를 수집하는 클래스

```python
class GameDataCollector:
    - start_recording(): 데이터 수집 시작
    - stop_recording(): 데이터 수집 종료
    - record_frame(): 프레임 데이터 기록
    - export_data(): JSON 형식으로 데이터 내보내기
```

#### 2. `game.py` (수정)
- `GameDataCollector` 인스턴스 추가
- 게임 시작 시 녹화 시작
- 게임 종료 시 녹화 종료

#### 3. `game_state_stage.py` (수정)
- 플레이 중 매 프레임 데이터 수집
- 게임 오버 시 JavaScript로 데이터 전송 (postMessage)

#### 4. `game_state_complete.py` (수정)
- 게임 완료 시 JavaScript로 데이터 전송 (postMessage)

### Frontend (React + TypeScript)

#### 1. `pages/Play.tsx` (수정)
- postMessage 이벤트 리스너 등록
- 게임 완료 메시지 수신 시 닉네임 입력 폼 표시
- 게임 통계 표시 (점수, 플레이 시간, 명중률 등)
- 점수 등록 및 JSON 파일 다운로드 기능

#### 2. `pages/Rank.tsx` (개선)
- 세련된 리더보드 UI
- 상위 3명 하이라이트 (금/은/동 메달)
- 실시간 새로고침 기능

#### 3. `api/scores.ts`
- `submitScore()`: 점수 제출 API
- `fetchLeaderboard()`: 랭킹 조회 API

## 데이터 형식

### 게임 플레이 데이터 (JSON)

```json
{
  "score": 12500,
  "final_stage": 3,
  "statistics": {
    "total_frames": 5400,
    "play_duration": 180.0,
    "enemies_destroyed": 45,
    "shots_fired": 320,
    "hits": 180,
    "deaths": 2
  },
  "frames": [
    {
      "frame_number": 0,
      "player_x": 128.0,
      "player_y": 92.0,
      "player_lives": 3,
      "player_score": 0,
      "current_weapon": 0,
      "input_left": 0,
      "input_right": 0,
      "input_up": 0,
      "input_down": 0,
      "input_button1": 0,
      "input_button2": 0,
      "stage_num": 1,
      "timestamp": 0.0
    },
    // ... 더 많은 프레임
  ]
}
```

## 사용 방법

### 1. 게임 플레이
1. `/play` 페이지에서 모델 선택 (선택사항)
2. "Run game" 버튼 클릭하여 게임 시작
3. 게임 플레이

### 2. 점수 등록
1. 게임 종료 (게임 오버 또는 게임 완료)
2. 자동으로 닉네임 입력 폼 표시
3. 게임 통계 확인 (점수, 플레이 시간, 명중률 등)
4. 닉네임 입력
5. "점수 등록" 버튼 클릭
6. 점수와 전체 게임 플레이 데이터가 백엔드 DB에 저장됨

### 3. 랭킹 확인
1. `/rank` 페이지 방문
2. 점수 순으로 정렬된 리더보드 확인
3. 🔄 새로고침 버튼으로 최신 랭킹 갱신

## 연구 데이터 활용

데이터베이스에 저장된 게임 플레이 데이터에는 다음 정보가 포함되어 있어 연구에 활용할 수 있습니다:

- **플레이어 행동 분석**: 프레임별 위치 및 입력 데이터
- **난이도 분석**: 사망 지점, 플레이 시간 등
- **AI 학습 데이터**: 입력-상태 쌍으로 강화학습 가능
- **통계 분석**: 명중률, 적 처치 패턴 등

## 기술 스택

- **Game**: Pyxel (Python)
- **Frontend**: React + TypeScript + Vite
- **Communication**: localStorage (iframe ↔ parent window)
- **Data Format**: JSON

## 개발자 노트

### iframe 통신 문제 해결
- 초기에는 `window` 객체에 직접 접근하려 했으나, iframe 격리 문제로 실패
- `postMessage`를 시도했으나 Pyxel 웹 환경에서 안정적으로 작동하지 않음
- **최종 해결책**: `localStorage` 사용
  - iframe과 부모 페이지가 같은 origin일 때 localStorage 공유
  - Python에서 `js.localStorage.setItem()`으로 데이터 저장
  - 프론트엔드에서 주기적으로 localStorage 폴링하여 게임 완료 감지
  - 타임스탬프를 사용하여 중복 처리 방지

### 게임 빌드
게임 코드 수정 후 다시 빌드:
```bash
python -m pyxel package src src/main.py
move /Y src.pyxapp frontend/public/game.pyxapp
```

### 백엔드 API
별도 레포지토리에서 관리됨. 필요한 API 엔드포인트:
- `POST /api/scores`: 점수 제출
- `POST /api/gameplay`: 게임 플레이 데이터 제출
- `GET /api/leaderboard`: 랭킹 조회

