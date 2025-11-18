
import pyxel as px
from game import Game

from const import APP_WIDTH, APP_HEIGHT, APP_NAME, APP_DISPLAY_SCALE, \
    APP_CAPTURE_SCALE, APP_FPS, APP_GFX_FILE, PALETTE, SOUNDS_RES_FILE
from monospace_bitmap_font import MonospaceBitmapFont
from input import Input

class App:
    def __init__(self) -> None:
        px.init(
            APP_WIDTH, APP_HEIGHT, 
            title=APP_NAME,
            fps=APP_FPS,
            display_scale=APP_DISPLAY_SCALE,
            capture_scale=APP_CAPTURE_SCALE
        )

        px.colors.from_list(PALETTE)
        px.images[0].load(0, 0, "assets/" + APP_GFX_FILE)
        px.load("assets/" + SOUNDS_RES_FILE, excl_images=True, 
                excl_tilemaps=True, excl_musics=True)

        self.main_font = MonospaceBitmapFont()
        self.input = Input()

        self.game = Game(self)
        
        # 리플레이 모드 체크
        self._check_replay_mode()
    
        px.run(self.update, self.draw)
    
    def _check_replay_mode(self):
        """JavaScript에서 리플레이 데이터를 확인하고 리플레이 모드로 시작"""
        try:
            import js
            
            # localStorage에서 리플레이 데이터 확인
            replay_data = js.localStorage.getItem("pyxelReplayData")
            replay_mode = js.localStorage.getItem("pyxelReplayMode")
            
            if replay_mode == "true" and replay_data:
                js.console.log("Starting replay mode...")
                
                # 리플레이 모드로 게임 시작
                if self.game.go_to_replay(replay_data):
                    js.console.log("Replay mode started successfully")
                    # 리플레이 플래그 클리어
                    js.localStorage.removeItem("pyxelReplayMode")
                else:
                    js.console.error("Failed to start replay mode")
        except ImportError:
            # 웹 환경이 아닌 경우 무시
            pass
        except Exception as e:
            try:
                import js
                js.console.error(f"Error checking replay mode: {str(e)}")
            except:
                print(f"Error checking replay mode: {e}")
    
    def update(self):
        self.input.update()
        self.game.update()
    
    def draw(self):
        px.cls(0)
        self.game.draw()
    
if __name__ == "__main__":
    App()
