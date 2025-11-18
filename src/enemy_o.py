from enemy import Enemy

SPEED = 2.5
BULLET_SPEED = 2

SHOT_DELAY = 120


class EnemyO(Enemy):
    def __init__(self, state, x, y, enemy_id: int = -1) -> None:
        super().__init__(state, x, y, enemy_id)
        self.colour = 7  # cyan
        self.u = 224
        self.v = 80

        self.hp = 2

        self.shot_delay = 40  # allow time to get on screen

    def update(self):
        super().update()  # hit frames

        self.x -= SPEED
        if self.x + self.w < 0:
            self.remove = True
            return

        if self.shot_delay == 0:
            self.shot_delay = SHOT_DELAY
            self.shoot_at_player(BULLET_SPEED)
        else:
            self.shot_delay -= 1
