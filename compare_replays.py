#!/usr/bin/env python3
"""리플레이 파일 비교 스크립트"""
import json

# 파일 로드
with open('frontend/public/models/my_replay.json', 'r', encoding='utf-8') as f:
    original = json.load(f)

with open('replay_executed_beginner_2025-11-24T07-23-22.json', 'r', encoding='utf-8') as f:
    executed = json.load(f)

print("=" * 80)
print("리플레이 파일 비교")
print("=" * 80)

print("\n📊 전체 통계 비교:")
print(f"{'항목':<25} {'원본 (my_replay)':<25} {'실행 결과':<25} {'차이':<15}")
print("-" * 90)
print(f"{'총 프레임':<25} {len(original['frames']):<25} {len(executed['frames']):<25} {len(executed['frames']) - len(original['frames']):<15}")
print(f"{'최종 점수':<25} {original['score']:<25} {executed['score']:<25} {executed['score'] - original['score']:<15}")
print(f"{'적 이벤트':<25} {len(original['enemy_events']):<25} {len(executed['enemy_events']):<25} {len(executed['enemy_events']) - len(original['enemy_events']):<15}")
print(f"{'사망 횟수':<25} {original['statistics']['deaths']:<25} {executed['statistics']['deaths']:<25} {executed['statistics']['deaths'] - original['statistics']['deaths']:<15}")

print("\n🎯 프레임별 위치 비교 (처음 20 프레임):")
print(f"{'Frame':<8} {'원본 X':<12} {'실행 X':<12} {'차이':<12} {'원본 Y':<12} {'실행 Y':<12} {'차이':<12}")
print("-" * 80)
for i in range(min(20, len(original['frames']), len(executed['frames']))):
    orig_frame = original['frames'][i]
    exec_frame = executed['frames'][i]
    
    orig_x = orig_frame['player_x']
    exec_x = exec_frame['player_x']
    orig_y = orig_frame['player_y']
    exec_y = exec_frame['player_y']
    
    diff_x = exec_x - orig_x
    diff_y = exec_y - orig_y
    
    print(f"{i:<8} {orig_x:<12.2f} {exec_x:<12.2f} {diff_x:<12.2f} {orig_y:<12.2f} {exec_y:<12.2f} {diff_y:<12.2f}")

# 입력 비교
print("\n🕹️  입력 비교 (처음 20 프레임):")
print(f"{'Frame':<8} {'원본 입력':<30} {'실행 입력':<30} {'동일?':<10}")
print("-" * 80)
for i in range(min(20, len(original['frames']), len(executed['frames']))):
    orig_frame = original['frames'][i]
    exec_frame = executed['frames'][i]
    
    orig_input = f"U:{orig_frame['input_up']} D:{orig_frame['input_down']} L:{orig_frame['input_left']} R:{orig_frame['input_right']}"
    exec_input = f"U:{exec_frame['input_up']} D:{exec_frame['input_down']} L:{exec_frame['input_left']} R:{exec_frame['input_right']}"
    
    same = orig_input == exec_input
    print(f"{i:<8} {orig_input:<30} {exec_input:<30} {'✓' if same else '✗':<10}")

# 마지막 몇 프레임 비교
if len(executed['frames']) < len(original['frames']):
    print(f"\n⚠️  실행 결과가 {len(original['frames']) - len(executed['frames'])} 프레임 일찍 종료됨!")
    print(f"\n마지막 프레임 정보:")
    last_exec = executed['frames'][-1]
    corresponding_orig = original['frames'][last_exec['frame_number']] if last_exec['frame_number'] < len(original['frames']) else None
    
    print(f"\n실행 결과 마지막 프레임 (#{last_exec['frame_number']}):")
    print(f"  위치: ({last_exec['player_x']}, {last_exec['player_y']})")
    print(f"  생명: {last_exec['player_lives']}")
    print(f"  점수: {last_exec['player_score']}")
    
    if corresponding_orig:
        print(f"\n원본 동일 프레임 번호 (#{corresponding_orig['frame_number']}):")
        print(f"  위치: ({corresponding_orig['player_x']}, {corresponding_orig['player_y']})")
        print(f"  생명: {corresponding_orig['player_lives']}")
        print(f"  HP: {corresponding_orig.get('player_hp', 'N/A')}")
        print(f"  점수: {corresponding_orig['player_score']}")

# 적 이벤트 비교
print(f"\n👾 적 스폰 이벤트 비교:")
print(f"원본 적 이벤트: {len(original['enemy_events'])}개")
print(f"실행 적 이벤트: {len(executed['enemy_events'])}개")

orig_spawn_frames = sorted([e['frame'] for e in original['enemy_events'] if e['event_type'] == 'enemy_spawn'])
exec_spawn_frames = sorted([e['frame'] for e in executed['enemy_events'] if e['event_type'] == 'enemy_spawn'])

print(f"\n원본 적 스폰 프레임: {orig_spawn_frames[:10]}...")
print(f"실행 적 스폰 프레임: {exec_spawn_frames[:10]}...")

print("\n" + "=" * 80)


