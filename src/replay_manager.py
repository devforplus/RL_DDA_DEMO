"""리플레이 매니저"""
from typing import Dict, List, Any, Optional
import json


class ReplayManager:
    """리플레이 데이터를 관리하고 재생하는 클래스"""
    
    def __init__(self):
        self.replay_data: Optional[Dict[str, Any]] = None
        self.enemy_events: List[Dict[str, Any]] = []
        self.frames_data: List[Dict[str, Any]] = []
        self.current_frame = 0
        self.is_replaying = False
        
    def load_from_json(self, json_str: str) -> bool:
        """JSON 문자열에서 리플레이 데이터 로드"""
        try:
            self.replay_data = json.loads(json_str)
            self.enemy_events = self.replay_data.get('enemy_events', [])
            self.frames_data = self.replay_data.get('frames', [])
            self.current_frame = 0
            self.is_replaying = True
            return True
        except Exception as e:
            print(f"Failed to load replay data: {e}")
            return False
    
    def get_enemy_events_for_frame(self, frame: int) -> List[Dict[str, Any]]:
        """특정 프레임의 적 이벤트 반환"""
        events = []
        for event in self.enemy_events:
            if event.get('frame') == frame:
                events.append(event)
        return events
    
    def get_frame_data(self, frame: int) -> Optional[Dict[str, Any]]:
        """특정 프레임의 입력 데이터 반환"""
        if 0 <= frame < len(self.frames_data):
            return self.frames_data[frame]
        return None
    
    def next_frame(self):
        """다음 프레임으로 이동"""
        self.current_frame += 1
    
    def is_finished(self) -> bool:
        """리플레이가 끝났는지 확인"""
        return self.current_frame >= len(self.frames_data)
    
    def get_statistics(self) -> Dict[str, Any]:
        """리플레이 통계 반환"""
        if not self.replay_data:
            return {}
        return self.replay_data.get('statistics', {})
    
    def get_score(self) -> int:
        """최종 점수 반환"""
        if not self.replay_data:
            return 0
        return self.replay_data.get('score', 0)
    
    def get_final_stage(self) -> int:
        """최종 스테이지 반환"""
        if not self.replay_data:
            return 1
        return self.replay_data.get('final_stage', 1)

