#!/bin/bash
SLIDES=9
SLIDE_DURATION=6
FRAME_DIR="/home/benedikt/.openclaw/workspace/PAMlab/video-assets/frames"
HTML_FILE="/home/benedikt/.openclaw/workspace/PAMlab/video-assets/demo-presentation.html"
OUTPUT="/home/benedikt/.openclaw/workspace/PAMlab/video-assets/pamlab-demo.mp4"
# Snap chromium can only access ~/snap/chromium/common/ and ~/
TEMP_DIR="/home/benedikt/snap/chromium/common/pamlab-temp"

rm -rf "$FRAME_DIR"
mkdir -p "$FRAME_DIR"
mkdir -p "$TEMP_DIR"

echo "=== Capturing $SLIDES slides ==="

for i in $(seq 0 $((SLIDES - 1))); do
  echo -n "Slide $i... "
  TEMP_HTML="${TEMP_DIR}/slide_${i}.html"
  FNAME="pamlab_frame_${i}.png"
  
  # Create per-slide HTML with the right slide active and embedded fonts
  sed "s/let current = 0;/let current = ${i};/" "$HTML_FILE" | \
  sed "s/<div class=\"slide active\" data-slide=\"0\">/<div class=\"slide\" data-slide=\"0\">/g" | \
  sed "s/<div class=\"slide\" data-slide=\"${i}\">/<div class=\"slide active\" data-slide=\"${i}\">/g" | \
  sed "s|@import url('https://fonts.googleapis.com/css2?family=Inter.*display=swap');|/* fonts disabled for offline rendering */ |" > "$TEMP_HTML"
  
  cd /home/benedikt
  rm -f "$FNAME"
  chromium-browser --headless=new --no-sandbox --disable-gpu \
    --screenshot="$FNAME" \
    --window-size=1920,1080 \
    "file://${TEMP_HTML}" 2>/dev/null
  
  if [ -f "/home/benedikt/$FNAME" ]; then
    mv "/home/benedikt/$FNAME" "$FRAME_DIR/slide_$(printf '%02d' $i).png"
    SIZE=$(du -h "$FRAME_DIR/slide_$(printf '%02d' $i).png" | cut -f1)
    echo "✓ $SIZE"
  else
    echo "✗ FAILED"
  fi
done

rm -rf "$TEMP_DIR"

echo ""
echo "=== Building MP4 ==="

CONCAT="/home/benedikt/.openclaw/workspace/PAMlab/video-assets/concat.txt"
> "$CONCAT"
for i in $(seq 0 $((SLIDES - 1))); do
  echo "file '${FRAME_DIR}/slide_$(printf '%02d' $i).png'" >> "$CONCAT"
  echo "duration ${SLIDE_DURATION}" >> "$CONCAT"
done
echo "file '${FRAME_DIR}/slide_$(printf '%02d' $((SLIDES - 1))).png'" >> "$CONCAT"

ffmpeg -y -f concat -safe 0 -i "$CONCAT" \
  -vf "scale=1920:1080,format=yuv420p" \
  -r 30 \
  -c:v libx264 -preset medium -crf 20 \
  -movflags +faststart \
  "$OUTPUT" 2>&1 | tail -5

rm -f "$CONCAT"

echo ""
echo "=== RESULT ==="
ls -lh "$OUTPUT" 2>/dev/null || echo "FAILED"
