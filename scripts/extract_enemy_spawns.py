"""
타일맵에서 실제 적 스폰 위치를 추출하는 스크립트
"""
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'src'))

try:
    import pyxel as px
    
    # Pyxel 초기화 (최소 크기)
    px.init(256, 160, title="Extract Enemy Spawns")
    
    # 타일맵 로드 (프로젝트 루트 기준)
    project_root = os.path.dirname(os.path.dirname(__file__))
    tilemap_path = os.path.join(project_root, 'src', 'assets', 'stage_1.tmx')
    px.tilemaps[1] = px.Tilemap.from_tmx(tilemap_path, 1)
    
    ENEMY_SPAWN_TILE_INDEX_Y = 10
    MAP_HEIGHT_TILES = 20
    
    # 적 스폰 위치 추출
    spawns = []
    for col in range(300):  # 충분히 큰 범위
        for row in range(MAP_HEIGHT_TILES):
            tile = px.tilemaps[1].pget(col, row)
            if tile[1] == ENEMY_SPAWN_TILE_INDEX_Y:
                tile_x = tile[0] << 3  # 타일 X 인덱스 * 8
                spawns.append({
                    'col': col,
                    'row': row,
                    'tile_x': tile_x,
                })
    
    print("Enemy spawns found in tilemap:")
    for spawn in spawns:
        print(f"  Col {spawn['col']}, Row {spawn['row']}, Tile X: {spawn['tile_x']}")
    
    print(f"\nTotal spawns: {len(spawns)}")
    
    # JSON으로 저장
    import json
    scripts_dir = os.path.dirname(__file__)
    output_path = os.path.join(scripts_dir, 'stage_1_enemy_spawns.json')
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(spawns, f, indent=2, ensure_ascii=False)
    
    print(f"\nSaved to: {output_path}")
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

