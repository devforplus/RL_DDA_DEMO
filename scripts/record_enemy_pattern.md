# 실제 게임의 적 패턴 기록하기

## 문제

현재 리플레이 JSON 파일의 `enemy_events`가 비어있어 적이 나타나지 않습니다.
실제 게임의 tilemap에서 적이 어디에 어떻게 스폰되는지 정확히 기록해야 합니다.

## 해결 방법

### 1단계: 실제 게임 플레이

1. Play 페이지로 이동
2. 게임을 플레이 (5-10초만 플레이하면 충분)
3. 게임 오버 또는 완료 시 데이터가 localStorage에 저장됨

### 2단계: enemy_events 추출

브라우저 개발자 도구(F12) 콘솔에서:

```javascript
// 저장된 게임 데이터 확인
const gameData = JSON.parse(localStorage.getItem('pyxelGameData'));
console.log('Enemy events:', gameData.enemy_events);
console.log('Total enemy events:', gameData.enemy_events.length);

// enemy_events를 복사
copy(JSON.stringify(gameData.enemy_events, null, 2));
```

### 3단계: enemy_events를 모든 모델에 적용

1. 콘솔에서 복사한 enemy_events를 파일로 저장: `models/enemy_pattern_template.json`
2. Python 스크립트로 모든 모델 JSON에 동일한 enemy_events 적용:

```python
# scripts/apply_enemy_pattern.py
import json
from pathlib import Path

# 실제 게임에서 기록한 enemy_events 로드
with open('models/enemy_pattern_template.json', 'r') as f:
    enemy_events = json.load(f)

# 모든 모델에 적용
for model_file in ['beginner.json', 'master.json', 'medium.json']:
    path = Path('models') / model_file
    with open(path, 'r') as f:
        data = json.load(f)
    
    data['enemy_events'] = enemy_events
    data['statistics']['enemies_destroyed'] = len(enemy_events)
    
    with open(path, 'w') as f:
        json.dump(data, f, indent=2)
    
    print(f'✓ {model_file}에 {len(enemy_events)}개의 적 이벤트 적용')
```

## 대안: 수동으로 특정 모델의 enemy_events 사용

가장 긴 플레이 시간을 가진 master 모델을 실제로 플레이해서 기록한 후:

```bash
# master의 enemy_events를 다른 모델에도 복사
python -c "
import json
with open('models/master.json') as f:
    master = json.load(f)
enemy_events = master['enemy_events']

for model in ['beginner', 'medium']:
    with open(f'models/{model}.json') as f:
        data = json.load(f)
    data['enemy_events'] = enemy_events
    with open(f'models/{model}.json', 'w') as f:
        json.dump(data, f, indent=2)
    print(f'{model}.json 업데이트 완료')
"
```

## 테스트

1. `pnpm dev`로 프론트엔드 서버 실행
2. `/replay` 페이지 접속
3. 모델 선택 후 리플레이 시작
4. 플레이어가 움직이고 적이 나타나는지 확인

## 중요 사항

- **모든 모델이 동일한 enemy_events를 사용해야 합니다**
- enemy_events의 frame 번호가 해당 모델의 총 프레임 수를 초과하면 안 됩니다
- 짧은 플레이 모델(beginner)은 나중에 나오는 적을 경험하지 못할 수 있습니다 (정상)

