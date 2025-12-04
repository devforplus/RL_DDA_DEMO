"""적 이벤트 데이터를 업데이트하는 스크립트"""
import json
from pathlib import Path


def update_enemy_events(replay_files: list[str], enemy_pattern_file: str):
    """리플레이 파일들의 enemy_events를 새로운 적 패턴 데이터로 업데이트"""
    
    # 적 패턴 파일 로드
    enemy_pattern_path = Path(enemy_pattern_file)
    if not enemy_pattern_path.exists():
        print(f"오류: 적 패턴 파일을 찾을 수 없습니다: {enemy_pattern_file}")
        return
    
    with open(enemy_pattern_path, 'r', encoding='utf-8') as f:
        new_enemy_events = json.load(f)
    
    print(f"적 패턴 파일 로드 완료: {len(new_enemy_events)}개의 이벤트")
    
    # 각 리플레이 파일 업데이트
    for replay_file in replay_files:
        replay_path = Path(replay_file)
        if not replay_path.exists():
            print(f"경고: 파일을 찾을 수 없습니다: {replay_file}")
            continue
        
        print(f"\n처리 중: {replay_file}")
        
        # 리플레이 파일 로드
        with open(replay_path, 'r', encoding='utf-8') as f:
            replay_data = json.load(f)
        
        # enemy_events 필드 업데이트
        old_count = len(replay_data.get('enemy_events', []))
        replay_data['enemy_events'] = new_enemy_events
        new_count = len(new_enemy_events)
        
        # 백업 파일 생성
        backup_path = replay_path.with_suffix(replay_path.suffix + '.backup')
        if not backup_path.exists():
            with open(backup_path, 'w', encoding='utf-8') as f:
                json.dump(replay_data, f, indent=2, ensure_ascii=False)
            print(f"  백업 파일 생성: {backup_path}")
        
        # 업데이트된 파일 저장
        with open(replay_path, 'w', encoding='utf-8') as f:
            json.dump(replay_data, f, indent=2, ensure_ascii=False)
        
        print(f"  업데이트 완료: {old_count}개 -> {new_count}개의 적 이벤트")
    
    print("\n모든 파일 업데이트 완료!")


def main():
    """메인 함수"""
    # 적 패턴 파일 경로
    enemy_pattern_file = "src/models/enemy_pattern_20251119_143335.json"
    
    # 업데이트할 리플레이 파일 목록
    replay_files = [
        "models/master.json",
        "models/medium.json",
        "models/beginner.json",
    ]
    
    update_enemy_events(replay_files, enemy_pattern_file)


if __name__ == "__main__":
    main()




