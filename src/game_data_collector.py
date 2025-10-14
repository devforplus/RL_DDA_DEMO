"""게임 플레이 데이터 수집기"""
import json
from typing import List, Dict, Any


class GameDataCollector:
    """게임 플레이 데이터를 수집하고 저장하는 클래스"""
    
    def __init__(self):
        self.frames_data: List[Dict[str, Any]] = []
        self.start_time = 0.0
        self.end_time = 0.0
        self.is_recording = False
        
        # 게임 통계
        self.total_frames = 0
        self.enemies_destroyed = 0
        self.shots_fired = 0
        self.hits = 0
        self.deaths = 0
        
    def start_recording(self, start_time: float):
        """녹화 시작"""
        self.is_recording = True
        self.start_time = start_time
        self.frames_data = []
        self.total_frames = 0
        self.enemies_destroyed = 0
        self.shots_fired = 0
        self.hits = 0
        self.deaths = 0
        
    def stop_recording(self, end_time: float):
        """녹화 종료"""
        self.is_recording = False
        self.end_time = end_time
        
    def record_frame(self, frame_data: Dict[str, Any]):
        """프레임 데이터 기록"""
        if not self.is_recording:
            return
            
        self.frames_data.append(frame_data)
        self.total_frames += 1
        
    def add_enemy_destroyed(self):
        """적 파괴 카운트 증가"""
        self.enemies_destroyed += 1
        
    def add_shot_fired(self):
        """발사 카운트 증가"""
        self.shots_fired += 1
        
    def add_hit(self):
        """명중 카운트 증가"""
        self.hits += 1
        
    def add_death(self):
        """사망 카운트 증가"""
        self.deaths += 1
        
    def get_play_duration(self) -> float:
        """플레이 시간(초) 반환"""
        return self.end_time - self.start_time
        
    def get_statistics(self) -> Dict[str, Any]:
        """게임 통계 반환"""
        return {
            "total_frames": self.total_frames,
            "play_duration": self.get_play_duration(),
            "enemies_destroyed": self.enemies_destroyed,
            "shots_fired": self.shots_fired,
            "hits": self.hits,
            "deaths": self.deaths,
        }
        
    def export_data(self, score: int, final_stage: int) -> Dict[str, Any]:
        """전체 게임 데이터를 내보내기"""
        return {
            "score": score,
            "final_stage": final_stage,
            "statistics": self.get_statistics(),
            "frames": self.frames_data,
        }
        
    def export_json(self, score: int, final_stage: int) -> str:
        """JSON 형식으로 내보내기"""
        data = self.export_data(score, final_stage)
        return json.dumps(data)
        
    def clear(self):
        """데이터 초기화"""
        self.frames_data = []
        self.total_frames = 0
        self.enemies_destroyed = 0
        self.shots_fired = 0
        self.hits = 0
        self.deaths = 0
        self.is_recording = False

