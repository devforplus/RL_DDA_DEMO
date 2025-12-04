import os
import imageio
from pathlib import Path

def convert_videos():
    # 대상 디렉토리
    models_dir = Path("frontend/public/models")
    
    # mp4 파일 찾기
    mp4_files = list(models_dir.glob("*.mp4"))
    
    if not mp4_files:
        print("변환할 MP4 파일을 찾지 못했습니다.")
        return

    print(f"총 {len(mp4_files)}개의 파일을 발견했습니다.")
    
    for file_path in mp4_files:
        # 백업 파일 및 임시 파일은 건너뛰기
        if "_backup" in file_path.stem or "_temp" in file_path.stem:
            continue

        # 이미 백업이 있으면 변환된 것으로 간주하고 건너뛰기
        backup_path = file_path.with_name(f"{file_path.stem}_backup.mp4")
        if backup_path.exists():
            print(f"이미 변환됨 (백업 존재): {file_path.name}")
            continue
            
        print(f"\n처리 중: {file_path.name}")
        
        try:
            # 임시 출력 파일명
            temp_output = file_path.with_name(f"{file_path.stem}_temp.mp4")
            
            # 비디오 읽기
            reader = imageio.get_reader(file_path)
            meta = reader.get_meta_data()
            fps = meta['fps']
            
            print(f"  - FPS: {fps}")
            
            # 비디오 쓰기 (H.264 코덱 사용)
            # quality=None으로 설정하고 ffmpeg_params를 사용하여 직접 제어
            writer = imageio.get_writer(
                temp_output, 
                fps=fps, 
                codec='libx264', 
                quality=None,
                pixelformat='yuv420p',
                ffmpeg_params=['-crf', '23', '-preset', 'fast']
            )
            
            count = 0
            for frame in reader:
                writer.append_data(frame)
                count += 1
                if count % 100 == 0:
                    print(f"\r  - {count} 프레임 변환 중...", end="")
            
            writer.close()
            reader.close()
            print(f"\r  - 변환 완료 ({count} 프레임)")
            
            # 원본 파일을 백업하고 임시 파일을 원본 이름으로 변경
            backup_path = file_path.with_name(f"{file_path.stem}_backup.mp4")
            
            # 이미 백업이 있으면 건너뛰거나 덮어쓰기 정책 결정 (여기서는 백업 유지)
            if not backup_path.exists():
                os.rename(file_path, backup_path)
                print(f"  - 원본 백업됨: {backup_path.name}")
            else:
                os.remove(file_path) # 원본 삭제
                print(f"  - 기존 원본 삭제됨 (백업 이미 존재)")
                
            os.rename(temp_output, file_path)
            print(f"  - 파일 교체 완료: {file_path.name}")
            
        except Exception as e:
            print(f"\n[ERROR] 변환 실패 ({file_path.name}): {e}")
            if temp_output.exists():
                try:
                    os.remove(temp_output)
                except:
                    pass

if __name__ == "__main__":
    convert_videos()

