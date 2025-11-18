"""
리플레이 JSON 파일 검증 스크립트
- 3개 모델이 동일한 적 패턴을 가지고 있는지 확인
- JSON 구조가 올바른지 검증
"""
import json
from pathlib import Path
from typing import Dict, List, Any


def load_replay(path: Path) -> Dict[str, Any]:
    """리플레이 JSON 로드"""
    with open(path, 'r', encoding='utf-8') as f:
        return json.load(f)


def get_enemy_spawn_signature(enemy_events: List[Dict[str, Any]]) -> List[tuple]:
    """
    적 스폰 이벤트의 시그니처를 생성합니다.
    (frame, enemy_type) 튜플 리스트를 반환하여 패턴을 비교할 수 있게 합니다.
    """
    return [
        (event['frame'], event['enemy_type'])
        for event in enemy_events
        if event.get('event_type') == 'enemy_spawn'
    ]


def verify_structure(data: Dict[str, Any], model_name: str) -> bool:
    """JSON 구조가 올바른지 검증"""
    print(f"\n[{model_name}] 구조 검증 중...")
    
    required_fields = ['metadata', 'score', 'final_stage', 'statistics', 'frames', 'enemy_events']
    
    for field in required_fields:
        if field not in data:
            print(f"  [ERROR] 필수 필드 누락: {field}")
            return False
        print(f"  [OK] {field} 존재")
    
    # statistics 하위 필드 확인
    stats_fields = ['total_frames', 'play_duration', 'enemies_destroyed', 'shots_fired', 'hits', 'deaths']
    stats = data.get('statistics', {})
    
    for field in stats_fields:
        if field not in stats:
            print(f"  [WARNING] statistics.{field} 누락")
        else:
            print(f"  [OK] statistics.{field} = {stats[field]}")
    
    print(f"  [OK] 총 프레임 수: {len(data['frames'])}")
    print(f"  [OK] 적 이벤트 수: {len(data['enemy_events'])}")
    
    return True


def compare_enemy_patterns(replays: Dict[str, Dict[str, Any]]) -> bool:
    """모든 리플레이가 동일한 적 패턴을 가지고 있는지 확인"""
    print("\n" + "=" * 60)
    print("적 패턴 비교")
    print("=" * 60)
    
    # 각 리플레이의 적 스폰 시그니처 추출
    signatures = {}
    for model_name, data in replays.items():
        enemy_events = data.get('enemy_events', [])
        signatures[model_name] = get_enemy_spawn_signature(enemy_events)
        print(f"\n[{model_name}]")
        print(f"  - 플레이 시간: {data['statistics']['play_duration']:.1f}초")
        print(f"  - 적 스폰 이벤트: {len(signatures[model_name])}개")
        if signatures[model_name]:
            print(f"  - 첫 스폰: 프레임 {signatures[model_name][0][0]}, 타입 {signatures[model_name][0][1]}")
            print(f"  - 마지막 스폰: 프레임 {signatures[model_name][-1][0]}, 타입 {signatures[model_name][-1][1]}")
    
    # 중복되는 이벤트 확인 (더 짧게 플레이한 모델의 이벤트가 모두 포함되는지)
    print("\n패턴 일관성 검증:")
    print("(각 모델이 경험한 프레임 범위 내에서 동일한 적이 스폰되는지 확인)")
    
    model_names = sorted(signatures.keys(), key=lambda x: len(signatures[x]))
    
    all_consistent = True
    for i, model_name in enumerate(model_names[:-1]):
        shorter_sig = set(signatures[model_name])
        
        for longer_model in model_names[i+1:]:
            longer_sig = set(signatures[longer_model])
            
            # shorter 모델의 모든 이벤트가 longer 모델에도 있는지 확인
            missing = shorter_sig - longer_sig
            
            if not missing:
                print(f"  [OK] {model_name}의 모든 적 이벤트가 {longer_model}에도 존재합니다")
            else:
                print(f"  [ERROR] {longer_model}에 {model_name}의 일부 이벤트가 없습니다!")
                print(f"    - 누락된 이벤트: {len(missing)}개")
                for frame, enemy_type in sorted(list(missing))[:5]:  # 처음 5개만 표시
                    print(f"      * 프레임 {frame}: {enemy_type}")
                all_consistent = False
    
    # 동일한 프레임 범위에서 동일한 적이 나타나는지 확인
    print("\n프레임별 일관성 검증:")
    
    # 모든 리플레이에서 공통적으로 경험한 프레임 범위
    min_frames = min(data['statistics']['total_frames'] for data in replays.values())
    
    # 각 프레임에서 스폰되는 적을 딕셔너리로 정리
    frame_spawns = {}  # frame -> enemy_type
    for model_name, sig in signatures.items():
        for frame, enemy_type in sig:
            if frame < min_frames:
                if frame not in frame_spawns:
                    frame_spawns[frame] = enemy_type
                elif frame_spawns[frame] != enemy_type:
                    print(f"  [ERROR] 프레임 {frame}에서 모델 간 다른 적이 스폰됨!")
                    print(f"    - 기존: {frame_spawns[frame]}")
                    print(f"    - {model_name}: {enemy_type}")
                    all_consistent = False
    
    if all_consistent:
        print(f"  [OK] 공통 프레임 범위(0-{min_frames})에서 모든 모델이 동일한 적 패턴을 경험합니다")
        print(f"  [OK] 총 {len(frame_spawns)}개의 스폰 이벤트가 일관되게 발생합니다")
    
    return all_consistent


def main():
    """메인 함수"""
    print("=" * 60)
    print("리플레이 JSON 검증 스크립트")
    print("=" * 60)
    
    # 프로젝트 루트 디렉토리
    project_root = Path(__file__).parent.parent
    models_dir = project_root / "models"
    
    # 모델 파일 목록
    model_files = ["beginner.json", "master.json", "medium.json"]
    
    # 모든 리플레이 로드 및 검증
    replays = {}
    all_valid = True
    
    for model_file in model_files:
        model_name = model_file.replace('.json', '')
        input_path = models_dir / model_file
        
        if not input_path.exists():
            print(f"\n[ERROR] 파일을 찾을 수 없음: {input_path}")
            all_valid = False
            continue
        
        try:
            data = load_replay(input_path)
            replays[model_name] = data
            
            # 구조 검증
            if not verify_structure(data, model_name):
                all_valid = False
        
        except Exception as e:
            print(f"\n[ERROR] {model_name} 로드 실패: {e}")
            all_valid = False
    
    # 적 패턴 비교
    if len(replays) >= 2:
        patterns_match = compare_enemy_patterns(replays)
        if not patterns_match:
            all_valid = False
    
    # 최종 결과
    print("\n" + "=" * 60)
    print("검증 결과")
    print("=" * 60)
    
    if all_valid:
        print("[SUCCESS] 모든 검증을 통과했습니다!")
        print("  - 모든 JSON 파일이 올바른 구조를 가지고 있습니다")
        print("  - 모든 모델이 동일한 적 패턴을 경험합니다")
    else:
        print("[FAILED] 일부 검증에 실패했습니다")
        print("  위의 오류 메시지를 확인하세요")
    
    print("\n다음 단계:")
    print("1. 프론트엔드 서버 실행: cd frontend && pnpm dev")
    print("2. 브라우저에서 /replay 페이지 접속")
    print("3. 각 모델을 선택하여 리플레이가 올바르게 재생되는지 확인")


if __name__ == "__main__":
    main()

