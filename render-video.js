const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const ffmpegPath = require('ffmpeg-static');

const PROJECT_DIR = __dirname;
const ASSETS_DIR = path.join(PROJECT_DIR, 'assets');
const OUTPUT_DIR = path.join(PROJECT_DIR, 'public');
const FRAMES_DIR = path.join(OUTPUT_DIR, 'frames');
const VIDEO_DIR = path.join(OUTPUT_DIR, 'video');

// Clean frames directory
if (fs.existsSync(FRAMES_DIR)) {
  fs.rmSync(FRAMES_DIR, { recursive: true, force: true });
}
fs.mkdirSync(FRAMES_DIR, { recursive: true });

const img1 = path.join(ASSETS_DIR, 'take1_apresentacao.jpg');
const img2 = path.join(ASSETS_DIR, 'take2_zoom.jpg');
const img3 = path.join(ASSETS_DIR, 'take3_traseira.jpg');

const take1Out = path.join(OUTPUT_DIR, 'take1.mp4');
const take2Out = path.join(OUTPUT_DIR, 'take2.mp4');
const take3Out = path.join(OUTPUT_DIR, 'take3.mp4');
const concatList = path.join(OUTPUT_DIR, 'concat.txt');
const finalVideo = path.join(VIDEO_DIR, 'corsa_maxx_commercial.mp4');

console.log('Rendering Take 1 (Hero shot - 2.0s, 60 frames @ 30fps)...');
// Single image input (no -loop 1), zoompan d=60 generates exactly 60 frames = 2.0s
execSync(`"${ffmpegPath}" -y -i "${img1}" -vf "zoompan=z='min(zoom+0.0012,1.07)':d=60:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080:fps=30,format=yuv420p" -c:v libx264 -preset fast -crf 18 -t 2.0 "${take1Out}"`, { stdio: 'inherit' });

console.log('Rendering Take 2 (Zoom shot - 1.5s, 45 frames @ 30fps)...');
// Single image input, d=45 generates exactly 45 frames = 1.5s
execSync(`"${ffmpegPath}" -y -i "${img2}" -vf "zoompan=z='min(zoom+0.0018,1.08)':d=45:x='iw/2-(iw/zoom/2)+on*0.5':y='ih/2-(ih/zoom/2)':s=1920x1080:fps=30,format=yuv420p" -c:v libx264 -preset fast -crf 18 -t 1.5 "${take2Out}"`, { stdio: 'inherit' });

console.log('Rendering Take 3 (Traseira shot - 2.0s, 60 frames @ 30fps)...');
// Single image input, d=60 generates exactly 60 frames = 2.0s
execSync(`"${ffmpegPath}" -y -i "${img3}" -vf "zoompan=z='max(1.06-0.001,1.0)':d=60:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1920x1080:fps=30,format=yuv420p" -c:v libx264 -preset fast -crf 18 -t 2.0 "${take3Out}"`, { stdio: 'inherit' });

console.log('Merging into single 5.5s video...');
fs.writeFileSync(concatList, `file '${take1Out.replace(/\\/g, '/')}'\nfile '${take2Out.replace(/\\/g, '/')}'\nfile '${take3Out.replace(/\\/g, '/')}'`);

const tempMerged = path.join(OUTPUT_DIR, 'merged_video.mp4');
execSync(`"${ffmpegPath}" -y -f concat -safe 0 -i "${concatList}" -c copy "${tempMerged}"`, { stdio: 'inherit' });

// Add audio bed
console.log('Adding sound design...');
execSync(`"${ffmpegPath}" -y -i "${tempMerged}" -f lavfi -i "aevalsrc=sin(2*PI*55*t)*0.35 + sin(2*PI*110*t)*0.15:d=5.5" -filter_complex "[1:a]afade=t=in:ss=0:d=0.4,afade=t=out:st=4.9:d=0.6[aout]" -map 0:v -map "[aout]" -c:v copy -c:a aac -b:a 192k "${finalVideo}"`, { stdio: 'inherit' });

// Extract frames
console.log('Extracting exact 165 web frames...');
execSync(`"${ffmpegPath}" -y -i "${finalVideo}" -vf "scale=1280:720" -q:v 3 "${path.join(FRAMES_DIR, 'frame_%03d.jpg')}"`, { stdio: 'inherit' });

const totalFrames = fs.readdirSync(FRAMES_DIR).filter(f => f.endsWith('.jpg')).length;
console.log(`Successfully generated ${totalFrames} frames! Target was 165 frames (5.5s @ 30fps).`);

// Cleanup
[take1Out, take2Out, take3Out, concatList, tempMerged].forEach(f => {
  if (fs.existsSync(f)) fs.unlinkSync(f);
});

console.log('All done!');
