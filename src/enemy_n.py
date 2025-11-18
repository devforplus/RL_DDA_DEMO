from enemy import Enemy

SPEED_X = 4
SPEED_Y = 0.5


class EnemyN(Enemy):
    def __init__(self, state, x, y, enemy_id: int = -1) -> None:
        super().__init__(state, x, y, enemy_id)
        self.colour = 14  # grey
        self.u = 208
        self.v = 80

        self.hp = 2

        if self.y < 96:
            self.speed_y = SPEED_Y
        else:
            self.speed_y = -SPEED_Y

    def update(self):
        super().update()  # hit frames

        self.x -= SPEED_X
        if self.x + self.w < 0:
            self.remove = True
            return

        self.y += self.speed_y
