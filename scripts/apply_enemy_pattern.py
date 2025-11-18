"""
실제 게임에서 기록한 enemy_events를 모든 모델에 적용하는 스크립트

사용법:
1. 브라우저에서 실제 게임을 플레이 (Play 페이지)
2. 브라우저 콘솔에서:
   const gameData = JSON.parse(localStorage.getItem('pyxelGameData'));
   copy(JSON.stringify(gameData.enemy_events, null, 2));
3. 복사한 내용을 models/enemy_pattern_template.json에 저장
4. 이 스크립트 실행: python scripts/apply_enemy_pattern.py
"""
import json
from pathlib import Path


def main():
    # 프로젝트 루트
    project_root = Path(__file__).parent.parent
    models_dir = project_root / "models"
    
    # enemy_pattern_template.json이 있는지 확인
    template_path = models_dir / "enemy_pattern_template.json"
    
    if not template_path.exists():
        print("[ERROR] models/enemy_pattern_template.json 파일을 찾을 수 없습니다!")
        print()
        print("다음 단계를 따라주세요:")
        print("1. 브라우저에서 Play 페이지로 이동")
        print("2. 게임을 플레이 (5-10초면 충분)")
        print("3. 게임 오버 후 F12 개발자 도구 콘솔에서:")
        print("   const gameData = JSON.parse(localStorage.getItem('pyxelGameData'));")
        print("   copy(JSON.stringify(gameData.enemy_events, null, 2));")
        print("4. 복사한 내용을 models/enemy_pattern_template.json에 저장")
        print("5. 다시 이 스크립트 실행")
        return
    
    # enemy_events 로드
    try:
        with open(template_path, 'r', encoding='utf-8') as f:
            enemy_events = json.load(f)
        
        if not isinstance(enemy_events, list):
            print("[ERROR] enemy_pattern_template.json이 배열 형식이 아닙니다!")
            return
        
        print(f"[OK] {len(enemy_events)}개의 적 이벤트를 로드했습니다")
    
    except Exception as e:
        print(f"[ERROR] enemy_pattern_template.json 로드 실패: {e}")
        return
    
    # 모든 모델에 적용
    model_files = ["beginner.json", "master.json", "medium.json"]
    
    for model_file in model_files:
        model_path = models_dir / model_file
        
        if not model_path.exists():
            print(f"[WARNING] {model_file}를 찾을 수 없습니다")
            continue
        
        try:
            # 모델 데이터 로드
            with open(model_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # enemy_events 적용
            data['enemy_events'] = enemy_events
            data['statistics']['enemies_destroyed'] = len(enemy_events)
            
            # 저장
            with open(model_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            print(f"[SUCCESS] {model_file}에 {len(enemy_events)}개의 적 이벤트 적용 완료")
        
        except Exception as e:
            print(f"[ERROR] {model_file} 처리 실패: {e}")
    
    print()
    print("=" * 60)
    print("완료! frontend/public/models로 파일을 복사하세요:")
    print("xcopy models frontend\\public\\models\\ /E /I /Y")


if __name__ == "__main__":
    main()

