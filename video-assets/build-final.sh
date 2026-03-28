#!/bin/bash
# Build final PAMlab demo video with text overlays
FRAME_DIR="/home/benedikt/.openclaw/workspace/PAMlab/video-assets/frames"
CONCAT="/home/benedikt/.openclaw/workspace/PAMlab/video-assets/concat.txt"
OUTPUT="/home/benedikt/.openclaw/workspace/PAMlab/video-assets/pamlab-demo.mp4"

echo "=== Building PAMlab Demo Video ==="

# Use the concat file from the capture script
ffmpeg -y -f concat -safe 0 -i "$CONCAT" \
  -vf "
    scale=1920:1080,
    format=yuv420p
  " \
  -r 30 \
  -c:v libx264 -preset slow -crf 18 \
  -movflags +faststart \
  -pix_fmt yuv420p \
  "$OUTPUT" 2>&1 | tail -10

echo ""
echo "=== Duration ==="
ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$OUTPUT" 2>/dev/null | xargs printf "%.1f seconds\n"

echo ""
echo "=== Result ==="
ls -lh "$OUTPUT"
