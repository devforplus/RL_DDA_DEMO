from enum import Enum, auto
import time

from game_state_titles import GameStateTitles
from game_state_stage import GameStateStage
from game_state_complete import GameStateComplete
from game_vars import GameVars
from game_data_collector import GameDataCollector


class GameState(Enum):
    NONE = 0
    TITLES = auto()
    STAGE = auto()
    GAME_COMPLETE = auto()


class Game:
    def __init__(self, app) -> None:
        self.app = app
        self.next_state = None
        self.game_vars = GameVars(self)
        self.data_collector = GameDataCollector()

        self.state = GameStateTitles(self)
        # self.state = GameStateStage(self)
        # self.state = GameStateComplete(self)

    def go_to_titles(self):
        self.next_state = GameState.TITLES

    def go_to_new_game(self):
        self.game_vars.new_game()
        self.data_collector.clear()
        self.data_collector.start_recording(time.time())
        self.next_state = GameState.STAGE

    def go_to_continue(self):
        self.game_vars.continue_game()
        self.data_collector.start_recording(time.time())
        self.next_state = GameState.STAGE

    def go_to_game_complete(self):
        self.data_collector.stop_recording(time.time())
        self.next_state = GameState.GAME_COMPLETE

    def go_to_next_stage(self):
        if self.game_vars.go_to_next_stage():
            self.next_state = GameState.STAGE
        else:
            self.go_to_game_complete()

    def switch_state(self):
        new_state = None
        if self.next_state == GameState.TITLES:
            new_state = GameStateTitles
        elif self.next_state == GameState.STAGE:
            new_state = GameStateStage
        elif self.next_state == GameState.GAME_COMPLETE:
            new_state = GameStateComplete
        else:
            return
        self.state.on_exit()
        self.state = new_state(self)
        self.next_state = None

    def update(self):
        if self.next_state is not None:
            self.switch_state()
        self.state.update()

    def draw(self):
        self.state.draw()
