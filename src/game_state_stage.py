from enum import Enum, auto

import pyxel as px

from const import (
    FINAL_STAGE,
    STAGE_MUSIC_FILES,
    MUSIC_GAME_OVER,
    MUSIC_BOSS,
    MUSIC_STAGE_CLEAR,
)
from player import Player
from sprite import (
    sprites_update,
    sprites_draw,
    sprite_lists_collide,
    sprite_collide_list,
)
from hud import Hud
from explosion import Explosion
from powerup import Powerup
from stage_background import StageBackground
import input
from audio import load_music, play_music, is_music_playing, stop_music


class State(Enum):
    PLAYER_SPAWNED = 0
    PLAY = auto()
    PLAYER_DEAD = auto()
    PAUSED = auto()
    GAME_OVER = auto()
    STAGE_CLEAR = auto()


PLAYER_SPAWN_IN_FRAMES = 30
STAGE_CLEAR_FRAMES = 180


class GameStateStage:
    def __init__(self, game) -> None:
        self.game = game
        self.state = State.PLAYER_SPAWNED
        
        # 리플레이 모드인 경우 replay_input 사용
        if game.is_replay_mode and game.replay_input:
            self.input = game.replay_input
        else:
            self.input = game.app.input
            
        self.font = game.app.main_font

        self.state_time = 0
        self.game_frame = 0  # 리플레이용 프레임 카운터

        self.player = Player(self)
        self.player_shots = []

        self.enemies = []
        self.enemy_shots = []
        self.bosses = []

        self.explosions = []

        self.powerups = []
        Powerup.reset_cycle()

        self.background = StageBackground(
            self,
            f"stage_{game.game_vars.stage_num}.tmx",
            self.game.game_vars.is_vortex_stage(),
        )

        self.hud = Hud(game.game_vars, self.font)
        self.hud.player = self.player  # HUD에 플레이어 참조 전달

        self.check_stage_clear = False

        self.music = load_music(STAGE_MUSIC_FILES[self.game.game_vars.stage_num])
        play_music(self.music, num_channels=3)

    def on_exit(self):
        px.stop()

    def end_of_vortex_stage(self):
        if self.state == State.PLAY:
            self.check_stage_clear = True

    def stage_clear_init(self):
        self.enemy_shots.clear()
        for e in self.enemies:
            e.destroy()
        self.switch_state(State.STAGE_CLEAR)
        if self.game.game_vars.stage_num < FINAL_STAGE:
            self.music = load_music(MUSIC_STAGE_CLEAR)
            play_music(self.music, False, 3, 620)
        else:
            stop_music()

    def respawn_player(self):
        self.player = Player(self)
        self.hud.player = self.player  # HUD에 새 플레이어 참조 전달

    def get_scroll_x_speed(self):
        return self.background.scroll_x_speed

    def add_enemy(self, e):
        self.enemies.append(e)
        # print(f"Added enemy type {e.type} at {e.x//8},{e.y//8}")

    def add_boss(self, b):
        self.bosses.append(b)

    def add_powerup(self, p):
        self.powerups.append(p)

    def add_explosion(self, x, y, delay):
        self.explosions.append(Explosion(self, x, y, delay))

    def trigger_bomb(self):
        self.enemy_shots.clear()
        for e in self.enemies:
            e.hit_with_bomb()
        for b in self.bosses:
            b.hit_with_bomb()

    def add_score(self, amount):
        self.game.game_vars.add_score(amount)

    # Doesnt include bosses.
    def get_num_enemies(self):
        return len(self.enemies)

    def add_player_shot(self, s):
        self.player_shots.append(s)

    def add_enemy_shot(self, s):
        self.enemy_shots.append(s)

    def update_play(self):
        self.player.update()
        
        # 리플레이 모드에서 적 이벤트 처리
        if self.game.is_replay_mode:
            self._process_replay_enemy_events()
            if self.game.replay_input:
                self.game.replay_input.next_frame()
            self.game_frame += 1
        else:
            self._record_frame_data()

    def _process_replay_enemy_events(self):
        """리플레이 모드에서 적 이벤트 처리"""
        if not self.game.is_replay_mode:
            return
            
        events = self.game.replay_manager.get_enemy_events_for_frame(self.game_frame)
        
        if len(events) > 0:
            try:
                import js
                js.console.log(f"Frame {self.game_frame}: Processing {len(events)} events")
            except:
                pass
        
        for event in events:
            event_type = event.get('event_type')
            
            if event_type == 'enemy_spawn':
                self._replay_enemy_spawn(event)
            elif event_type == 'enemy_shoot':
                self._replay_enemy_shoot(event)
    
    def _replay_enemy_spawn(self, event: dict):
        """리플레이에서 적 생성 재현"""
        enemy_id = event.get('enemy_id')
        enemy_type = event.get('enemy_type')
        x = event.get('x')
        y = event.get('y')
        
        if not enemy_type:
            return
        
        try:
            # JavaScript 콘솔에 로그 출력
            try:
                import js
                js.console.log(f"Spawning enemy: {enemy_type} at ({x}, {y}), id={enemy_id}")
            except:
                pass
            
            # 각 적 클래스를 직접 임포트
            enemy_class = None
            if enemy_type == 'EnemyA':
                from enemy_a import EnemyA
                enemy_class = EnemyA
            elif enemy_type == 'EnemyB':
                from enemy_b import EnemyB
                enemy_class = EnemyB
            elif enemy_type == 'EnemyC':
                from enemy_c import EnemyC
                enemy_class = EnemyC
            elif enemy_type == 'EnemyD':
                from enemy_d import EnemyD
                enemy_class = EnemyD
            elif enemy_type == 'EnemyE':
                from enemy_e import EnemyE
                enemy_class = EnemyE
            elif enemy_type == 'EnemyF':
                from enemy_f import EnemyF
                enemy_class = EnemyF
            elif enemy_type == 'EnemyG':
                from enemy_g import EnemyG
                enemy_class = EnemyG
            elif enemy_type == 'EnemyH':
                from enemy_h import EnemyH
                enemy_class = EnemyH
            elif enemy_type == 'EnemyI':
                from enemy_i import EnemyI
                enemy_class = EnemyI
            elif enemy_type == 'EnemyJ':
                from enemy_j import EnemyJ
                enemy_class = EnemyJ
            elif enemy_type == 'EnemyK':
                from enemy_k import EnemyK
                enemy_class = EnemyK
            elif enemy_type == 'EnemyL':
                from enemy_l import EnemyL
                enemy_class = EnemyL
            elif enemy_type == 'EnemyM':
                from enemy_m import EnemyM
                enemy_class = EnemyM
            elif enemy_type == 'EnemyN':
                from enemy_n import EnemyN
                enemy_class = EnemyN
            elif enemy_type == 'EnemyO':
                from enemy_o import EnemyO
                enemy_class = EnemyO
            elif enemy_type == 'EnemyP':
                from enemy_p import EnemyP
                enemy_class = EnemyP
            
            if enemy_class:
                enemy = enemy_class(self, x, y, enemy_id)
                
                # 보스인지 일반 적인지 확인해서 추가
                if enemy_type in ['EnemyK', 'EnemyL', 'EnemyM']:
                    self.add_boss(enemy)
                else:
                    self.add_enemy(enemy)
                    
                try:
                    import js
                    js.console.log(f"✓ Enemy spawned: {enemy_type}")
                except:
                    pass
            else:
                try:
                    import js
                    js.console.error(f"✗ Unknown enemy type: {enemy_type}")
                except:
                    pass
                    
        except Exception as e:
            try:
                import js
                js.console.error(f"Failed to spawn enemy {enemy_type}: {str(e)}")
            except:
                pass
            print(f"Failed to replay enemy spawn: {e}")
    
    def _replay_enemy_shoot(self, event: dict):
        """리플레이에서 적 공격 재현"""
        from enemy_shot import EnemyShot
        
        enemy_id = event.get('enemy_id')
        x = event.get('x')
        y = event.get('y')
        vx = event.get('vx')
        vy = event.get('vy')
        delay = event.get('delay', 0)
        
        try:
            # JavaScript 콘솔에 로그 출력
            try:
                import js
                js.console.log(f"Enemy {enemy_id} shooting at ({x}, {y}), velocity=({vx}, {vy})")
            except:
                pass
            
            # 적 총알 직접 생성
            shot = EnemyShot(self, x, y, vx, vy, delay)
            self.add_enemy_shot(shot)
        except Exception as e:
            try:
                import js
                js.console.error(f"Failed to shoot: {str(e)}")
            except:
                pass
    
    def _record_frame_data(self):
        """현재 프레임의 게임 데이터를 기록"""
        try:
            frame_data = {
                "frame_number": self.game.data_collector.total_frames,
                "player_x": float(self.player.x),
                "player_y": float(self.player.y),
                "player_lives": self.game.game_vars.lives,
                "player_score": self.game.game_vars.score,
                "current_weapon": self.game.game_vars.current_weapon,
                "input_left": 1 if self.input.is_pressing(input.LEFT) else 0,
                "input_right": 1 if self.input.is_pressing(input.RIGHT) else 0,
                "input_up": 1 if self.input.is_pressing(input.UP) else 0,
                "input_down": 1 if self.input.is_pressing(input.DOWN) else 0,
                "input_button1": 1 if self.input.is_pressing(input.BUTTON_1) else 0,
                "input_button2": 1 if self.input.is_pressing(input.BUTTON_2) else 0,
                "stage_num": self.game.game_vars.stage_num,
                "timestamp": float(self.state_time) / 30.0,  # 30 FPS 기준
            }
            self.game.data_collector.record_frame(frame_data)
        except Exception as e:
            # 데이터 수집 실패해도 게임은 계속 진행
            pass

    def switch_state(self, new):
        self.state = new
        self.state_time = 0
        # print(f"Switched stage state to {self.state}")

    def update_player_dead(self):
        if len(self.explosions) == 0:
            if self.game.game_vars.lives > 0:
                self.respawn_player()
                self.switch_state(State.PLAYER_SPAWNED)
                self.game.data_collector.add_death()
            else:
                self.switch_state(State.GAME_OVER)
                self.game.data_collector.add_death()
                # 게임 오버 시 데이터 수집 종료
                import time

                self.game.data_collector.stop_recording(time.time())
                self.music = load_music(MUSIC_GAME_OVER)
                play_music(self.music, False, num_channels=3)

    def play_boss_music(self):
        self.music = load_music(MUSIC_BOSS)
        play_music(self.music, True, num_channels=3)

    def update_game_over(self):
        if (
            self.input.has_tapped(input.BUTTON_1)
            or self.input.has_tapped(input.BUTTON_2)
            or not is_music_playing()
        ):
            # 게임 오버 화면에서 데이터를 JavaScript로 전달
            self._export_game_over_data()
            self.game.go_to_titles()

    def _export_game_over_data(self):
        """게임 오버 시 게임 데이터를 JavaScript로 전달"""
        # 리플레이 모드에서는 데이터를 저장하지 않음
        if self.game.is_replay_mode:
            try:
                import js
                js.console.log("=== Replay mode: Skipping data export ===")
            except:
                pass
            return
            
        try:
            import json

            # JavaScript로 데이터 전달 (Pyxel 웹 환경)
            try:
                import js
                
                js.console.log("=== Starting game data export ===")
                
                # 데이터 수집
                game_data = self.game.data_collector.export_data(
                    score=self.game.game_vars.score,
                    final_stage=self.game.game_vars.stage_num,
                )
                
                js.console.log(f"Game data collected: score={game_data['score']}, stage={game_data['final_stage']}")
                js.console.log(f"Frames: {len(game_data['frames'])}, Enemy events: {len(game_data['enemy_events'])}")

                # JSON 문자열로 변환
                json_data = json.dumps(game_data)
                js.console.log(f"JSON data size: {len(json_data)} bytes")

                # localStorage에 게임 데이터 저장
                js.localStorage.setItem("pyxelGameData", json_data)
                js.console.log("✓ pyxelGameData saved")
                
                js.localStorage.setItem("pyxelGameCompleted", "true")
                js.console.log("✓ pyxelGameCompleted saved")
                
                js.localStorage.setItem("pyxelGameTimestamp", str(js.Date.now()))
                js.console.log("✓ pyxelGameTimestamp saved")

                js.console.log("=== Game Over - All data saved to localStorage ===")
                
            except ImportError:
                # 로컬 실행 환경 - 파일로 저장
                print("Game Over!")
                print(f"Final Score: {self.game.game_vars.score}")
                game_data = self.game.data_collector.export_data(
                    score=self.game.game_vars.score,
                    final_stage=self.game.game_vars.stage_num,
                )
                print(f"Frames: {len(game_data['frames'])}, Enemy events: {len(game_data['enemy_events'])}")
                
                # 파일로 저장 (절대 경로 사용)
                import os
                from pathlib import Path
                
                # 현재 작업 디렉토리 확인
                print(f"Current working directory: {os.getcwd()}")
                
                # 프로젝트 루트 찾기 (src.pyxapp가 있는 디렉토리)
                project_root = Path.cwd()
                if not (project_root / "models").exists():
                    # models 디렉토리가 없으면 상위로 올라가거나 생성
                    if (project_root.parent / "models").exists():
                        project_root = project_root.parent
                    else:
                        # 현재 위치에 models 생성
                        (project_root / "models").mkdir(exist_ok=True)
                
                models_dir = project_root / "models"
                models_dir.mkdir(exist_ok=True)
                
                output_file = models_dir / "enemy_pattern_template.json"
                with open(output_file, 'w', encoding='utf-8') as f:
                    json.dump(game_data['enemy_events'], f, indent=2, ensure_ascii=False)
                print(f"✓ Enemy events saved to: {output_file}")
                
                # 전체 게임 데이터도 저장
                full_output = models_dir / "game_data_local.json"
                with open(full_output, 'w', encoding='utf-8') as f:
                    json.dump(game_data, f, indent=2, ensure_ascii=False)
                print(f"✓ Full game data saved to: {full_output}")

        except Exception as e:
            try:
                import js
                js.console.error(f"Failed to export game over data: {str(e)}")
                js.console.error(f"Error type: {type(e).__name__}")
            except:
                pass
            print(f"Failed to export game over data: {e}")

    def update_player_spawned(self):
        self.player.update_spawned()
        if self.state_time == PLAYER_SPAWN_IN_FRAMES:
            self.switch_state(State.PLAY)

    def update_stage_clear(self):
        if self.state_time >= STAGE_CLEAR_FRAMES and not is_music_playing():
            self.game.go_to_next_stage()

    def update(self):
        self.state_time += 1

        if self.state == State.PLAYER_SPAWNED:
            self.update_player_spawned()
        elif self.state == State.PLAY:
            if self.input.has_tapped(input.BUTTON_2):
                self.switch_state(State.PAUSED)
                return
            self.update_play()
        elif self.state == State.PLAYER_DEAD:
            self.update_player_dead()
        elif self.state == State.PAUSED:
            if self.input.has_tapped(input.BUTTON_2):
                self.switch_state(State.PLAY)
            else:
                return
        elif self.state == State.GAME_OVER:
            self.update_game_over()
            return
        elif self.state == State.STAGE_CLEAR:
            self.update_stage_clear()

        # 리플레이 모드가 아닐 때만 배경 업데이트 (적 자동 생성 포함)
        if not self.game.is_replay_mode:
            self.background.update()

        sprites_update(self.powerups)
        sprites_update(self.player_shots)
        sprites_update(self.enemies)
        sprites_update(self.bosses)
        sprites_update(self.enemy_shots)

        if self.check_stage_clear:
            self.check_stage_clear = False
            if len(self.bosses) == 0:
                self.stage_clear_init()

        sprite_lists_collide(self.player_shots, self.enemies)
        sprite_lists_collide(self.player_shots, self.bosses)
        sprite_collide_list(self.player, self.powerups)
        sprite_collide_list(self.player, self.enemy_shots)
        sprite_collide_list(self.player, self.enemies)
        sprite_collide_list(self.player, self.bosses)

        sprites_update(self.explosions)

        if self.state == State.PLAY and self.player.remove:
            self.switch_state(State.PLAYER_DEAD)
            self.player_shots.clear()

    def draw(self):
        self.background.draw()

        if self.state != State.PLAYER_DEAD and self.state != State.GAME_OVER:
            self.player.draw()

        sprites_draw(self.powerups)
        sprites_draw(self.player_shots)
        sprites_draw(self.enemies)
        sprites_draw(self.bosses)
        sprites_draw(self.explosions)
        sprites_draw(self.enemy_shots)

        self.hud.draw()

        if self.state == State.PAUSED:
            self.font.draw_text(104, 88, "PAUSED")
        elif self.state == State.GAME_OVER:
            self.font.draw_text(96, 88, "GAME OVER")
        elif self.state == State.STAGE_CLEAR:
            if self.game.game_vars.stage_num != FINAL_STAGE:
                if self.state_time > 60:
                    if self.game.game_vars.is_vortex_stage():
                        self.font.draw_text(80, 88, "LEAVING VORTEX")
                    else:
                        self.font.draw_text(80, 88, "ENTERING VORTEX")
