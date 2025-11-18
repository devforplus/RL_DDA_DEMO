"""
레거시 리플레이 JSON을 새 형식으로 변환하는 스크립트

구버전: metadata + frames
신버전: metadata + score + final_stage + statistics + frames + enemy_events
"""
import json
import sys
from pathlib import Path
from typing import Dict, List, Any

# 게임 상수
VIEW_WIDTH = 256
SCROLL_X_SPEED = 0.5
MAP_HEIGHT_TILES = 20

# 적 스폰 타일 X 좌표 (src/enemy_spawn.py에서 가져옴)
ENEMY_SPAWN_TILE_X = {
    0: "EnemyA",
    16: "EnemyB", 
    32: "EnemyC",
    48: "EnemyD",
    64: "EnemyE",
    80: "EnemyF",
    96: "EnemyG",
    112: "EnemyH",
    128: "EnemyI",
    144: "EnemyJ",
    208: "EnemyN",
    224: "EnemyO",
    240: "EnemyP",
}

ENEMY_BOSS_SPAWN_TILE_X = {
    160: "EnemyK",
    176: "EnemyL",
    192: "EnemyM",
}


def generate_enemy_spawn_pattern() -> List[Dict[str, Any]]:
    """
    고정된 적 스폰 패턴을 생성합니다.
    타일맵이 없으므로 일반적인 스폰 위치를 추정합니다.
    
    실제 게임에서는 tilemap의 ENEMIES_TM_INDEX 레이어를 읽어서
    적이 어디에 배치되어 있는지 확인하지만, 여기서는 일반적인
    스폰 위치를 하드코딩합니다.
    """
    spawn_pattern = []
    
    # Stage 1의 일반적인 적 스폰 위치 (픽셀 단위의 col 위치)
    # 이것은 추정값이며, 실제 게임의 tilemap에 따라 다를 수 있습니다
    spawn_locations = [
        # (col, row, enemy_type) - col은 타일 X, row는 타일 Y
        (40, 10, "EnemyA"),   # 첫 번째 적
        (50, 8, "EnemyB"),
        (60, 12, "EnemyA"),
        (70, 9, "EnemyC"),
        (80, 11, "EnemyD"),
        (90, 10, "EnemyE"),
        (100, 8, "EnemyF"),
        (110, 12, "EnemyG"),
        (120, 10, "EnemyH"),
        (130, 9, "EnemyA"),
        (140, 11, "EnemyI"),
        (150, 10, "EnemyB"),
        (160, 8, "EnemyC"),
        (170, 12, "EnemyJ"),
        (180, 10, "EnemyD"),
        (190, 9, "EnemyE"),
        (200, 11, "EnemyF"),
        (210, 10, "EnemyN"),
        (220, 8, "EnemyO"),
        (230, 12, "EnemyP"),
        (240, 10, "EnemyA"),
        (250, 9, "EnemyB"),
    ]
    
    for col, row, enemy_type in spawn_locations:
        spawn_pattern.append({
            "col": col,
            "row": row,
            "enemy_type": enemy_type,
            "x": col * 8,  # 타일 좌표를 픽셀로 변환
            "y": 16 + row * 8,  # HUD 오프셋 16 추가
        })
    
    return spawn_pattern


def simulate_enemy_spawns(total_frames: int) -> List[Dict[str, Any]]:
    """
    프레임별 scroll_x를 시뮬레이션하여 적 스폰 이벤트를 생성합니다.
    """
    enemy_events = []
    spawn_pattern = generate_enemy_spawn_pattern()
    
    scroll_x = 0.0
    last_col_checked = 0
    enemy_id = 0
    
    for frame in range(total_frames):
        # 현재 프레임의 화면 우측 경계가 도달한 col 계산
        col = int((scroll_x + VIEW_WIDTH) / 8)
        
        # 새로운 col에 도달했을 때만 적 스폰 체크
        if col > last_col_checked:
            last_col_checked = col
            
            # 이 col에 스폰할 적이 있는지 확인
            for spawn in spawn_pattern:
                if spawn["col"] == col:
                    # 적 스폰 이벤트 생성
                    event = {
                        "event_type": "enemy_spawn",
                        "frame": frame,
                        "enemy_id": enemy_id,
                        "enemy_type": spawn["enemy_type"],
                        "x": float(col * 8 - scroll_x),  # 화면 상의 상대 위치
                        "y": float(spawn["y"]),
                        "scroll_x": float(scroll_x),
                    }
                    enemy_events.append(event)
                    enemy_id += 1
        
        # scroll_x 업데이트
        scroll_x += SCROLL_X_SPEED
    
    return enemy_events


def convert_replay(input_path: Path) -> Dict[str, Any]:
    """레거시 리플레이 JSON을 새 형식으로 변환합니다."""
    print(f"변환 중: {input_path}")
    
    # JSON 로드
    with open(input_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # 기존 데이터 추출
    metadata = data.get("metadata", {})
    frames = data.get("frames", [])
    total_frames = len(frames)
    
    # 적 스폰 이벤트 생성
    print(f"  - 총 {total_frames} 프레임에 대한 적 스폰 이벤트 생성 중...")
    enemy_events = simulate_enemy_spawns(total_frames)
    print(f"  - {len(enemy_events)}개의 적 스폰 이벤트 생성됨")
    
    # 최종 점수 계산 (마지막 프레임의 점수)
    final_score = frames[-1]["score"] if frames else 0
    
    # 통계 생성
    play_duration = total_frames / 30.0  # 30 FPS 가정
    statistics = {
        "total_frames": total_frames,
        "play_duration": play_duration,
        "enemies_destroyed": len(enemy_events),  # 추정값
        "shots_fired": 0,  # 알 수 없음
        "hits": 0,  # 알 수 없음
        "deaths": 0,  # 알 수 없음
    }
    
    # 새 형식으로 변환
    new_data = {
        "metadata": metadata,
        "score": final_score,
        "final_stage": 1,  # Stage 1 가정
        "statistics": statistics,
        "frames": frames,
        "enemy_events": enemy_events,
    }
    
    return new_data


def main():
    """메인 함수"""
    # 프로젝트 루트 디렉토리
    project_root = Path(__file__).parent.parent
    models_dir = project_root / "models"
    
    # 변환할 파일 목록
    model_files = ["beginner.json", "master.json", "medium.json"]
    
    for model_file in model_files:
        input_path = models_dir / model_file
        
        if not input_path.exists():
            print(f"[WARNING] 파일을 찾을 수 없음: {input_path}")
            continue
        
        # 백업 생성
        backup_path = input_path.with_suffix('.json.backup')
        if not backup_path.exists():
            print(f"백업 생성: {backup_path}")
            import shutil
            shutil.copy2(input_path, backup_path)
        
        # 변환
        try:
            new_data = convert_replay(input_path)
            
            # 저장
            with open(input_path, 'w', encoding='utf-8') as f:
                json.dump(new_data, f, indent=2, ensure_ascii=False)
            
            print(f"[SUCCESS] 변환 완료: {model_file}")
            print(f"   - 프레임: {new_data['statistics']['total_frames']}")
            print(f"   - 적 이벤트: {len(new_data['enemy_events'])}")
            print(f"   - 최종 점수: {new_data['score']}")
            print()
        
        except Exception as e:
            print(f"[ERROR] 변환 실패: {model_file}")
            print(f"   에러: {str(e)}")
            import traceback
            traceback.print_exc()
            print()
    
    print("=" * 60)
    print("변환 완료!")
    print("원본 파일은 .backup 확장자로 백업되었습니다.")


if __name__ == "__main__":
    main()

