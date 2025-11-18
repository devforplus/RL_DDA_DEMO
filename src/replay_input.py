"""리플레이용 입력 클래스"""
from typing import Dict, List, Any


class ReplayInput:
    """녹화된 입력을 재생하는 클래스"""
    
    def __init__(self, frames_data: List[Dict[str, Any]]):
        """
        Args:
            frames_data: 프레임별 입력 데이터
        """
        self.frames_data = frames_data
        self.current_frame = 0
        self.total_frames = len(frames_data)
        
    def is_pressing(self, key: int) -> bool:
        """특정 키가 눌려있는지 확인"""
        if self.current_frame >= self.total_frames:
            return False
            
        frame_data = self.frames_data[self.current_frame]
        
        # key 값에 따라 해당 입력 상태 반환
        key_map = {
            0: 'input_left',    # LEFT
            1: 'input_right',   # RIGHT
            2: 'input_up',      # UP
            3: 'input_down',    # DOWN
            4: 'input_button1', # BUTTON_1
            5: 'input_button2', # BUTTON_2
        }
        
        key_name = key_map.get(key)
        if key_name:
            return frame_data.get(key_name, 0) == 1
        return False
    
    def has_tapped(self, key: int) -> bool:
        """키가 눌렸는지 확인 (한 프레임만)"""
        # 리플레이에서는 간단하게 현재 프레임에서 눌려있으면 True
        # 더 정교한 구현이 필요하면 이전 프레임과 비교
        return self.is_pressing(key)
    
    def next_frame(self):
        """다음 프레임으로 이동"""
        self.current_frame += 1
    
    def is_finished(self) -> bool:
        """리플레이가 끝났는지 확인"""
        return self.current_frame >= self.total_frames

