
import pyxel as px

from sprite import Sprite
from const import EntityType, ENEMY_SCORE_NORMAL, BOMB_DAMAGE, \
    PLAYER_SHOT_DAMAGE
from enemy_shot import EnemyShot
import powerup
from audio import play_sound, SoundType

HIT_FRAMES = 5
INVINCIBLE_START_FRAMES = 15

class Enemy(Sprite):
    def __init__(self, game_state, x, y, enemy_id: int = -1) -> None:
        super().__init__(game_state)
        self.type = EntityType.ENEMY
        self.x = x
        self.y = y
        self.hp = 2
        self.hit_frames = 0
        self.score = ENEMY_SCORE_NORMAL
        self.lifetime = 0
        self.enemy_id = enemy_id  # 리플레이를 위한 고유 ID

    def explode(self):
        self.game_state.add_explosion(self.x, self.y, 0)

    def destroy(self):
        if self.remove:
            return
        self.remove = True
        self.game_state.add_score(self.score)
        self.explode()
        powerup.check_create_next(self.game_state, self.x, self.y)

    def hit(self, dmg):
        self.hp = max(0, self.hp - dmg)
        if self.hp == 0:
            self.destroy()
        else:
            self.hit_frames = HIT_FRAMES
            play_sound(SoundType.BLIP)

    def hit_with_bomb(self):
        self.hit(BOMB_DAMAGE)

    def collided_with(self, other):
        if self.lifetime < INVINCIBLE_START_FRAMES:
            return
        
        if other.type == EntityType.PLAYER_SHOT:
            self.hit(other.damage)

    # Offsets are from centre x and y of enemy
    def shoot_at_angle(self, speed, degrees, delay=0, offset_x=0, offset_y=0):
        shot_x = self.x + (self.w/2) + offset_x
        shot_y = self.y + (self.h/2) + offset_y
        vx = px.cos(degrees) * speed
        vy = px.sin(degrees) * speed
        
        s = EnemyShot(self.game_state, shot_x, shot_y, vx, vy, delay)
        self.game_state.add_enemy_shot(s)
        
        # 적 공격 이벤트 기록
        if hasattr(self.game_state, 'game') and hasattr(self.game_state.game, 'data_collector'):
            self.game_state.game.data_collector.record_enemy_shoot(
                self.enemy_id, shot_x, shot_y, vx, vy, delay
            )
            
    def shoot_at_player(self, speed, delay=0):
        target_x = self.game_state.player.x + 8
        target_y = self.game_state.player.y + 4
        a = px.atan2(target_y - (self.y + self.h/2),
                     target_x - (self.x + self.w/2))
        self.shoot_at_angle(speed, a, delay)

    def update(self):
        self.lifetime += 1
        if self.hit_frames > 0:
            self.hit_frames -= 1
    
    def draw(self):
        if self.hit_frames > 0:
            px.pal(self.colour, 15)
            super().draw()
            px.pal()
        else:
            super().draw()
    