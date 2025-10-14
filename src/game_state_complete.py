import pyxel as px
import json

import input
from hud import Hud
from const import MUSIC_GAME_COMPLETE
from audio import load_music, play_music, stop_music

VIEW_WIDTH = 256
MAP_HEIGHT = 192
BG_SCROLL_SPD = 8
TITLE_SCREEN_MAP_FILE = "complete.tmx"
BG_TM_INDEX = 0


class GameStateComplete:
    def __init__(self, game) -> None:
        self.game = game
        self.input = self.game.app.input
        self.font = game.app.main_font

        self.hud = Hud(game.game_vars, self.font)

        px.tilemaps[BG_TM_INDEX] = px.Tilemap.from_tmx(
            "assets/" + TITLE_SCREEN_MAP_FILE, BG_TM_INDEX
        )

        self.scroll_x = 0
        self.data_sent = False

        self.music = load_music(MUSIC_GAME_COMPLETE)
        play_music(self.music, True, num_channels=3)

        # 게임 데이터를 JavaScript로 전달
        self._export_game_data()

    def _export_game_data(self):
        """게임 데이터를 JavaScript로 전달"""
        try:
            game_data = self.game.data_collector.export_data(
                score=self.game.game_vars.score,
                final_stage=self.game.game_vars.stage_num,
            )

            # JSON 문자열로 변환
            json_data = json.dumps(game_data)

            # JavaScript로 데이터 전달 (Pyxel 웹 환경)
            # postMessage를 사용하여 부모 window에 전달
            try:
                import js
                
                # 부모 창으로 메시지 전송
                message = {
                    "type": "GAME_COMPLETED",
                    "data": json_data
                }
                js.window.parent.postMessage(js.JSON.stringify(message), "*")
                js.console.log("Game completed - Data sent to parent window")
            except ImportError:
                # 로컬 실행 환경에서는 파일로 저장
                print("Game completed!")
                print(f"Score: {self.game.game_vars.score}")
                print(f"Statistics: {game_data['statistics']}")

        except Exception as e:
            print(f"Failed to export game data: {e}")

    def on_exit(self):
        stop_music(3)

    def update(self):
        self.scroll_x -= BG_SCROLL_SPD
        if self.scroll_x <= -VIEW_WIDTH:
            self.scroll_x += VIEW_WIDTH

        if self.input.has_tapped(input.BUTTON_1) or self.input.has_tapped(
            input.BUTTON_2
        ):
            self.game.go_to_titles()

    def draw(self):
        px.bltm(self.scroll_x, 0, BG_TM_INDEX, 0, 0, VIEW_WIDTH, MAP_HEIGHT)
        px.bltm(
            self.scroll_x + VIEW_WIDTH, 0, BG_TM_INDEX, 0, 0, VIEW_WIDTH, MAP_HEIGHT
        )

        self.font.draw_text(56, 72, "THANKS FOR PLAYING")
        self.font.draw_text(88, 96, "FINAL SCORE")
        self.font.draw_text(104, 112, f"{self.game.game_vars.score}")
