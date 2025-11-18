"""게임을 짧게 실행해서 적 패턴 데이터를 수집하는 테스트 스크립트"""
import sys
sys.path.insert(0, 'src')

import pyxel as px
from main import App
import time

# 자동으로 5초 후 종료하도록 설정
class TestApp(App):
    def __init__(self):
        self.start_time = time.time()
        super().__init__()
        
    def update(self):
        super().update()
        # 5초 후 자동 종료
        if time.time() - self.start_time > 5:
            print("\n=== 5초 경과, 게임 종료 ===")
            # 게임 오버 처리
            if hasattr(self.game, 'data_collector'):
                import json
                from pathlib import Path
                
                game_data = self.game.data_collector.export_data(
                    score=self.game.game_vars.score if hasattr(self.game, 'game_vars') else 0,
                    final_stage=1
                )
                
                print(f"Collected: {len(game_data['enemy_events'])} enemy events")
                
                # 저장
                models_dir = Path("models")
                models_dir.mkdir(exist_ok=True)
                
                output = models_dir / "enemy_pattern_template.json"
                with open(output, 'w', encoding='utf-8') as f:
                    json.dump(game_data['enemy_events'], f, indent=2, ensure_ascii=False)
                print(f"✓ Saved to: {output.absolute()}")
            
            px.quit()

if __name__ == "__main__":
    print("게임이 5초 동안 자동으로 실행됩니다...")
    print("적들이 나타나는 것을 확인하세요.")
    TestApp()

