   
try:
    import ffmpeg
    # More specific check for ffmpeg-python
    if not hasattr(ffmpeg, 'input') or not hasattr(ffmpeg, 'output'):
        raise ImportError("Incorrect ffmpeg module found. Please install 'ffmpeg-python' not 'ffmpeg'")
except ImportError as e:
    print(f"Error: {str(e)}")
    print("Install with: pip install ffmpeg-python")
    exit(1)

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from analysis import generate_dataset
import os
import yt_dlp
import glob
import uuid
import shutil
from flask import send_from_directory
import pandas as pd
# Add these new imports
import base64
import requests
import whisper
from pathlib import Path

# Add with your other configurations
# GEMINI_API_KEY = "AIzaSyCpe6Sh2PC1aoCo8bHasHqnVkKh8n-ChyA"  # Consider using environment variables
# GEMINI_API_KEY="AIzaSyA4SJ0PR9zHtyLbjNVCfgzRtod58KnrUKg"
GEMINI_API_KEY="AIzaSyD3fJt0W25oQKbclBxrzHZvFCyHSM1ve3s"




# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://your-react-app-domain.com"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"]
    }
})

# Configuration
UPLOAD_FOLDER = 'uploads'
OUTPUT_FOLDER = 'output'
ALLOWED_EXTENSIONS = {'mp4', 'avi', 'mov', 'mkv'}

# Ensure folders exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)
# REACT_FRAMES_FOLDER = '../my-app/public/frames'
# os.makedirs(REACT_FRAMES_FOLDER, exist_ok=True)
import os
from pathlib import Path


# Get absolute paths
# Get absolute paths
from pathlib import Path

# Get the correct path to React's public folder
BASE_DIR = Path(__file__).resolve().parent
# REACT_FRAMES_FOLDER = BASE_DIR.parent / 'my-app' / 'public' / 'frames'
REACT_FRAMES_FOLDER = Path(__file__).resolve().parent.parent / 'public' / 'frames'

# Ensure directory exists
REACT_FRAMES_FOLDER.mkdir(parents=True, exist_ok=True)

print(f"✅ Frames will be saved to: {REACT_FRAMES_FOLDER}")



def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def download_video_yt_dlp(url, save_path='./downloads'):
    try:
        print(f"[INFO] Starting YouTube download from: {url}")
        if not os.path.exists(save_path):
            os.makedirs(save_path)
            print(f"[INFO] Created download directory at: {save_path}")

        ydl_opts = {
            'outtmpl': f'{save_path}/video.%(ext)s',
            'format': 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]/best',
            'quiet': False  # Show yt_dlp logs too
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=True)
            filename = ydl.prepare_filename(info)
            print(f"[INFO] Video downloaded and saved as: {filename}")

        return filename
    except Exception as e:
        print(f"[ERROR] YouTube download failed: {e}")
        raise Exception(f"YouTube download failed: {str(e)}")
    
def clean_temp_files(folder='uploads'):
    for filename in os.listdir(folder):
        if '.part' in filename:
            try:
                os.remove(os.path.join(folder, filename))
                print(f"[CLEANED] {filename}")
            except Exception as e:
                print(f"[ERROR] Could not remove {filename}: {e}")  

   
             

def copy_high_content_frames(output_dir_name):
    output_dir = os.path.join(OUTPUT_FOLDER, output_dir_name)
    csv_path = os.path.join(output_dir, 'analysis.csv')

    if not os.path.exists(csv_path):
        print(f"[WARNING] CSV not found at {csv_path}")
        return []

    try:
        # Create React frames subfolder
        react_folder = os.path.join(REACT_FRAMES_FOLDER, output_dir_name)
        os.makedirs(react_folder, exist_ok=True)
        
        # Clear existing frames first
        for old_file in glob.glob(os.path.join(react_folder, '*.png')):
            try:
                os.remove(old_file)
            except Exception as e:
                print(f"[WARNING] Could not remove old file {old_file}: {e}")

        # Get all PNG files in output directory that contain 'high content_frame_'
        all_frames = glob.glob(os.path.join(output_dir, '*high content_frame_*.png'))
        print(f"[DEBUG] Found {len(all_frames)} high-content frames to copy")
        
        copied_files = []
        for src in all_frames:
            frame_name = os.path.basename(src)
            # Extract just the frame number (e.g., "27" from "high content_frame_27.png")
            frame_num = frame_name.split('high content_frame_')[-1].split('.')[0]
            dst = os.path.join(react_folder, f"frame_{frame_num}.png")
            shutil.copy2(src, dst)
            copied_files.append(dst)
            print(f"[DEBUG] Copied high-content frame: {src} to {dst}")

        print(f"[SUCCESS] Copied {len(copied_files)} high-content frames to {react_folder}")
        return copied_files

    except Exception as e:
        print(f"[ERROR] Frame copy failed: {str(e)}")
        return []

def extract_audio(video_path, audio_path):
    """Extract audio from video using ffmpeg"""
    try:
        print("Extracting audio from video...")
        ffmpeg.input(video_path).output(audio_path).run(overwrite_output=True)
        print("Audio extracted successfully.")
        return True
    except Exception as e:
        print(f"Error extracting audio: {str(e)}")
        return False

def transcribe_with_gemini(audio_path, api_key):
    """Transcribe audio using Gemini API"""
    try:
        print("Converting audio to base64...")
        with open(audio_path, "rb") as f:
            audio_base64 = base64.b64encode(f.read()).decode("utf-8")

        headers = {"Content-Type": "application/json"}
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key={api_key}"

        payload = {
            "contents": [{
                "parts": [
                    {"text": "Transcribe this audio verbatim with timestamps every 30 seconds."},
                    {
                        "inline_data": {
                            "mime_type": "audio/wav",
                            "data": audio_base64
                        }
                    }
                ]
            }],
            "generationConfig": {
                "temperature": 0.1,
                "maxOutputTokens": 4000
            }
        }

        print("Sending request to Gemini API...")
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        result = response.json()
        
        return result["candidates"][0]["content"]["parts"][0]["text"]
        
    except Exception as e:
        print(f"Gemini API failed: {str(e)}")
        return None

def transcribe_with_whisper(audio_path):
    """Fallback transcription using Whisper"""
    try:
        print("Falling back to Whisper...")
        model = whisper.load_model("base")
        result = model.transcribe(audio_path)
        return result["text"]
    except Exception as e:
        print(f"Whisper failed: {str(e)}")
        return None

def save_transcript(text, output_path):
    """Save transcription to file"""
    try:
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(text)
        return True
    except Exception as e:
        print(f"Error saving transcript: {str(e)}")
        return False

def process_transcription(video_path, output_dir):
    """Handle the entire transcription process with summarization"""
    try:
        audio_path = os.path.join(output_dir, "audio.wav")
        transcript_path = os.path.join(output_dir, "transcript.txt")
        summary_path = os.path.join(output_dir, "summary.txt")
        
        if not extract_audio(video_path, audio_path):
            return None, None
            
        # Get transcription
        transcript = transcribe_with_gemini(audio_path, GEMINI_API_KEY) or transcribe_with_whisper(audio_path)
        
        if not transcript:
            return None, None
            
        # Save transcript
        if not save_transcript(transcript, transcript_path):
            return None, None
            
        # Generate summary
        summary = summarize_with_gemini(transcript_path, GEMINI_API_KEY, summary_path)
        
        return transcript, summary
        
    except Exception as e:
        print(f"Transcription process failed: {str(e)}")
        return None, None

def summarize_with_gemini(transcript_path, api_key, summary_path="summary.txt"):
    """Summarize transcript using Gemini API"""
    try:
        print(f"Reading transcript from {transcript_path}...")
        with open(transcript_path, "r", encoding="utf-8") as f:
            transcript = f.read()
        
        if not transcript.strip():
            print("Transcript is empty, nothing to summarize")
            return None
            
        headers = {"Content-Type": "application/json"}
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key={api_key}"

        # Customize your summary prompt as needed
        summary_prompt = """
        Please summarize the following transcript in a clear and concise manner. 
        Focus on the key points and main ideas. Organize the summary into 
        logical sections if appropriate. Aim for about 20% of the original length.
        
        Transcript:
        {transcript}
        """
        
        payload = {
            "contents": [{
                "parts": [
                    {"text": summary_prompt.format(transcript=transcript)}
                ]
            }],
            "generationConfig": {
                "temperature": 0.3,  # Slightly higher for more creative summarization
                "maxOutputTokens": 2000
            }
        }

        print("Sending summarization request to Gemini API...")
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        result = response.json()
        
        summary = result["candidates"][0]["content"]["parts"][0]["text"]
        
        # Save the summary
        try:
            with open(summary_path, "w", encoding="utf-8") as f:
                f.write(summary)
            print(f"✅ Summary saved to {summary_path}")
            return summary
        except Exception as e:
            print(f"Error saving summary: {str(e)}")
            return summary
            
    except Exception as e:
        print(f"Error during summarization: {str(e)}")
        return None

# @app.route('/api/analyze', methods=['POST'])
# def analyze_video():
#     try:
#         print("[INFO] Received analyze request...")
#         clean_temp_files('uploads')
        
#         # File upload handling
#         if 'file' in request.files:
#             file = request.files['file']
#             print("[INFO] File upload detected.")

#             if file and allowed_file(file.filename):
#                 filename = f"{uuid.uuid4()}{os.path.splitext(file.filename)[1]}"
#                 filepath = os.path.join(UPLOAD_FOLDER, filename)
#                 file.save(filepath)
#                 print(f"[INFO] File saved at: {filepath}")
                
#                 output_dir_name = os.path.splitext(filename)[0]
#                 output_dir = os.path.join(OUTPUT_FOLDER, output_dir_name)
#                 csv_path = os.path.join(output_dir, 'analysis.csv')
#                 print(f"[INFO] Starting video analysis...")
#                 generate_dataset(filepath, output_dir, csv_path)
#                 print(f"[INFO] Video analysis completed. Output saved to {output_dir}")

#                 copied_frames = copy_high_content_frames(output_dir_name)
#                 print(f"[INFO] Copied {len(copied_frames)} frames to React public folder")

#                 # Process transcription and summary
#                 transcript, summary = process_transcription(filepath, output_dir)

#                 # Get the list of actual frame filenames that were copied
#                 react_folder = os.path.join(REACT_FRAMES_FOLDER, output_dir_name)
#                 frame_files = [f for f in os.listdir(react_folder) if f.startswith('frame_') and f.endswith('.png')]

#                 return jsonify({
#                     'status': 'success',
#                     'output_dir': output_dir_name,
#                     'frame_files': frame_files,
#                     'copied_frames': len(copied_frames),
#                     'transcript': transcript if transcript else None,
#                     'summary': summary if summary else None
#                 })

#         # URL handling
#         elif 'url' in request.json:
#             url = request.json['url']
#             print(f"[INFO] URL received: {url}")
#             filepath = download_video_yt_dlp(url, UPLOAD_FOLDER)

#             filename = os.path.basename(filepath)
#             output_dir_name = os.path.splitext(filename)[0]

#             output_dir = os.path.join(OUTPUT_FOLDER, output_dir_name)
#             csv_path = os.path.join(output_dir, 'analysis.csv')
#             print(f"[INFO] Starting video analysis on downloaded file...")
#             generate_dataset(filepath, output_dir, csv_path)
#             print(f"[INFO] Video analysis completed. Output saved to {output_dir}")

#             copied_frames = copy_high_content_frames(output_dir_name)
#             print(f"[INFO] Copied {len(copied_frames)} frames to React public folder")

#             # Process transcription and summary
#             transcript, summary = process_transcription(filepath, output_dir)

#             # Get the list of actual frame filenames that were copied
#             react_folder = os.path.join(REACT_FRAMES_FOLDER, output_dir_name)
#             frame_files = [f for f in os.listdir(react_folder) if f.startswith('frame_') and f.endswith('.png')]

#             return jsonify({
#                 'status': 'success',
#                 'output_dir': output_dir_name,
#                 'frame_files': frame_files,
#                 'copied_frames': len(copied_frames),
#                 'transcript': transcript if transcript else None,
#                 'summary': summary if summary else None
#             })

#         print("[ERROR] Invalid request: No file or URL found.")
#         return jsonify({'status': 'error', 'message': 'Invalid request'}), 400

#     except Exception as e:
#         print(f"[ERROR] Analysis failed: {str(e)}")
#         return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/analyze', methods=['POST'])
def analyze_video():
    try:
        print("[INFO] Received analyze request...")
        clean_temp_files('uploads')
        
        # File upload handling
        if 'file' in request.files:
            file = request.files['file']
            print("[INFO] File upload detected.")

            if file and allowed_file(file.filename):
                filename = f"{uuid.uuid4()}{os.path.splitext(file.filename)[1]}"
                filepath = os.path.join(UPLOAD_FOLDER, filename)
                file.save(filepath)
                print(f"[INFO] File saved at: {filepath}")
                
                output_dir_name = os.path.splitext(filename)[0]
                output_dir = os.path.join(OUTPUT_FOLDER, output_dir_name)
                csv_path = os.path.join(output_dir, 'analysis.csv')
                print(f"[INFO] Starting video analysis...")
                generate_dataset(filepath, output_dir, csv_path)
                print(f"[INFO] Video analysis completed. Output saved to {output_dir}")

                copied_frames = copy_high_content_frames(output_dir_name)
                print(f"[INFO] Copied {len(copied_frames)} frames to React public folder")

                # Get the list of actual frame filenames that were copied
                react_folder = os.path.join(REACT_FRAMES_FOLDER, output_dir_name)
                frame_files = [f for f in os.listdir(react_folder) if f.startswith('frame_') and f.endswith('.png')]

                # Return just the frames first
                return jsonify({
                    'status': 'frames_ready',
                    'output_dir': output_dir_name,
                    'frame_files': frame_files,
                    'copied_frames': len(copied_frames),
                    'transcription_ready': False
                })

        # URL handling
        elif 'url' in request.json:
            url = request.json['url']
            print(f"[INFO] URL received: {url}")
            filepath = download_video_yt_dlp(url, UPLOAD_FOLDER)

            filename = os.path.basename(filepath)
            output_dir_name = os.path.splitext(filename)[0]

            output_dir = os.path.join(OUTPUT_FOLDER, output_dir_name)
            csv_path = os.path.join(output_dir, 'analysis.csv')
            print(f"[INFO] Starting video analysis on downloaded file...")
            generate_dataset(filepath, output_dir, csv_path)
            print(f"[INFO] Video analysis completed. Output saved to {output_dir}")

            copied_frames = copy_high_content_frames(output_dir_name)
            print(f"[INFO] Copied {len(copied_frames)} frames to React public folder")

            # Get the list of actual frame filenames that were copied
            react_folder = os.path.join(REACT_FRAMES_FOLDER, output_dir_name)
            frame_files = [f for f in os.listdir(react_folder) if f.startswith('frame_') and f.endswith('.png')]

            # Return just the frames first
            return jsonify({
                'status': 'frames_ready',
                'output_dir': output_dir_name,
                'frame_files': frame_files,
                'copied_frames': len(copied_frames),
                'transcription_ready': False
            })

        print("[ERROR] Invalid request: No file or URL found.")
        return jsonify({'status': 'error', 'message': 'Invalid request'}), 400

    except Exception as e:
        print(f"[ERROR] Analysis failed: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500
    
@app.route('/api/process_transcription/<output_dir>', methods=['POST'])
def process_transcription_route(output_dir):
    try:
        print(f"[INFO] Starting transcription processing for {output_dir}")
        
        # Construct paths using Path for better cross-platform compatibility
        output_dir_path = Path(OUTPUT_FOLDER) / output_dir
        upload_dir_path = Path(UPLOAD_FOLDER)
        
        # Debug logging
        print(f"[DEBUG] Looking in output dir: {output_dir_path}")
        print(f"[DEBUG] Looking in upload dir: {upload_dir_path}")
        
        # Find video file - check both output and upload directories
        video_path = None
        for search_path in [output_dir_path, upload_dir_path]:
            if not search_path.exists():
                continue
                
            for ext in ALLOWED_EXTENSIONS:
                video_files = list(search_path.glob(f'*.{ext}'))
                if video_files:
                    video_path = video_files[0]
                    print(f"[DEBUG] Found video at: {video_path}")
                    break
            if video_path:
                break

        if not video_path:
            print("[ERROR] No video file found in either directory")
            return jsonify({
                'status': 'error',
                'message': 'Video file not found in output or upload directories'
            }), 404

        # Ensure output directory exists
        output_dir_path.mkdir(parents=True, exist_ok=True)
        
        # Process transcription
        print("[INFO] Starting transcription process...")
        transcript, summary = process_transcription(str(video_path), str(output_dir_path))
        
        if not transcript:
            print("[ERROR] Transcription failed to generate")
            return jsonify({
                'status': 'error',
                'message': 'Transcription process failed'
            }), 500
            
        return jsonify({
            'status': 'success',
            'output_dir': output_dir,
            'transcript': transcript,
            'summary': summary if summary else None
        })
        
    except Exception as e:
        print(f"[ERROR] Transcription processing failed: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e),
            'stacktrace': traceback.format_exc() if app.debug else None
        }), 500

def process_transcription(video_path, output_dir):
    """Improved transcription handler with better error handling"""
    try:
        output_dir = Path(output_dir)
        audio_path = output_dir / "audio.wav"
        transcript_path = output_dir / "transcript.txt"
        summary_path = output_dir / "summary.txt"
        
        # Check if we already have processed files
        if transcript_path.exists() and summary_path.exists():
            print("[INFO] Loading existing transcript and summary")
            with open(transcript_path, 'r', encoding='utf-8') as f:
                transcript = f.read()
            with open(summary_path, 'r', encoding='utf-8') as f:
                summary = f.read()
            return transcript, summary
        
        # Extract audio if needed
        if not audio_path.exists():
            print("[INFO] Extracting audio...")
            if not extract_audio(video_path, str(audio_path)):
                raise Exception("Audio extraction failed")
        
        # Try Gemini first, then Whisper
        transcript = None
        if GEMINI_API_KEY:
            print("[INFO] Trying Gemini transcription...")
            transcript = transcribe_with_gemini(str(audio_path), GEMINI_API_KEY)
        
        if not transcript:
            print("[INFO] Falling back to Whisper...")
            transcript = transcribe_with_whisper(str(audio_path))
            if not transcript:
                raise Exception("All transcription methods failed")
        
        # Save transcript
        print("[INFO] Saving transcript...")
        with open(transcript_path, 'w', encoding='utf-8') as f:
            f.write(transcript)
        
        # Generate and save summary
        print("[INFO] Generating summary...")
        summary = summarize_with_gemini(str(transcript_path), GEMINI_API_KEY, str(summary_path))
        
        return transcript, summary
        
    except Exception as e:
        print(f"[ERROR] Transcription process failed: {str(e)}")
        # Clean up potentially corrupted files
        for f in [audio_path, transcript_path, summary_path]:
            try:
                if f.exists():
                    f.unlink()
            except:
                pass
        raise  # Re-raise the exception for the route handler
    
@app.route('/api/results/<path:subpath>')
def get_results(subpath):
    try:
        print(f"[INFO] Sending result file: {subpath}")
        return send_from_directory(OUTPUT_FOLDER, subpath)
    except FileNotFoundError:
        print(f"[ERROR] File not found: {subpath}")
        return jsonify({'status': 'error', 'message': 'File not found'}), 404

@app.route('/api/frames/<output_dir>/<filename>')
def get_react_frame(output_dir, filename):
    try:
        # Security check
        if '..' in output_dir or '..' in filename:
            raise FileNotFoundError
            
        directory = os.path.join(REACT_FRAMES_FOLDER, output_dir)
        return send_from_directory(directory, filename)
    except FileNotFoundError:
        print(f"[ERROR] React frame not found: {output_dir}/{filename}")
        return jsonify({'status': 'error', 'message': 'Frame not found'}), 404
    
@app.route('/api/transcript/<output_dir>')
def get_transcript(output_dir):
    try:
        transcript_path = os.path.join(OUTPUT_FOLDER, output_dir, "transcript.txt")
        return send_from_directory(os.path.dirname(transcript_path), os.path.basename(transcript_path))
    except FileNotFoundError:
        return jsonify({'status': 'error', 'message': 'Transcript not found'}), 404

@app.route('/api/summary/<output_dir>')
def get_summary(output_dir):
    try:
        summary_path = os.path.join(OUTPUT_FOLDER, output_dir, "summary.txt")
        return send_from_directory(os.path.dirname(summary_path), os.path.basename(summary_path))
    except FileNotFoundError:
        return jsonify({'status': 'error', 'message': 'Summary not found'}), 404  

@app.route('/api/query', methods=['POST', 'OPTIONS'])
def handle_query():
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
        
    try:
        data = request.get_json()
        if not data:
            return _corsify_actual_response(jsonify({'status': 'error', 'message': 'No data provided'}), 400)
            
        query = data.get('query')
        if not query:
            return _corsify_actual_response(jsonify({'status': 'error', 'message': 'No query provided'}), 400)
        
        # Prepare the prompt
        prompt = f"""You are an educational video assistant. The user asked:
        {query}
        
        Provide a helpful response about video content, analysis, or related educational topics."""
        
        # Call Gemini API - USING THE SAME ENDPOINT AS OTHER FUNCTIONS
        headers = {"Content-Type": "application/json"}
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key={GEMINI_API_KEY}"
        
        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }],
            "generationConfig": {
                "temperature": 0.3,
                "maxOutputTokens": 2000
            }
        }
        
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        result = response.json()
        
        # More robust response handling
        if not result.get('candidates'):
            raise ValueError("No candidates in response")
        
        if not result["candidates"][0].get('content'):
            raise ValueError("No content in candidate")
            
        return _corsify_actual_response(jsonify({
            'status': 'success',
            'response': result["candidates"][0]["content"]["parts"][0]["text"]
        }))
        
    except requests.exceptions.RequestException as e:
        print(f"API Request failed: {str(e)}")
        print(f"Response content: {e.response.text if hasattr(e, 'response') else 'No response'}")
        return _corsify_actual_response(jsonify({
            'status': 'error', 
            'message': 'Failed to connect to AI service',
            'details': str(e)
        }), 502)
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return _corsify_actual_response(jsonify({
            'status': 'error',
            'message': 'An unexpected error occurred',
            'details': str(e)
        }), 500)
def _build_cors_preflight_response():
    response = jsonify({'status': 'success'})
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "*")
    response.headers.add("Access-Control-Allow-Methods", "*")
    return response

def _corsify_actual_response(response, status_code=200):
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response, status_code     


# Add this new route
@app.route('/api/generate_notes/<output_dir>', methods=['POST'])
def generate_notes(output_dir):
    try:
        print(f"[INFO] Generating smart notes for {output_dir}")
        
        # Path to transcript
        transcript_path = os.path.join(OUTPUT_FOLDER, output_dir, "transcript.txt")
        
        if not os.path.exists(transcript_path):
            return jsonify({
                'status': 'error',
                'message': 'Transcript not found'
            }), 404

        # Read transcript
        with open(transcript_path, 'r', encoding='utf-8') as f:
            transcript = f.read()

        # Generate notes using Gemini
        notes = generate_notes_with_gemini(transcript)
        
        # Save notes
        notes_path = os.path.join(OUTPUT_FOLDER, output_dir, "smart_notes.md")
        with open(notes_path, 'w', encoding='utf-8') as f:
            f.write(notes)
            
        return jsonify({
            'status': 'success',
            'notes': notes,
            'notes_path': f"api/results/{output_dir}/smart_notes.md"
        })
        
    except Exception as e:
        print(f"[ERROR] Notes generation failed: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

# Add this new helper function
def generate_notes_with_gemini(transcript):
    """Generate structured notes from transcript using Gemini"""
    try:
        headers = {"Content-Type": "application/json"}
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key={GEMINI_API_KEY}"

        prompt = """**Instruction**: Convert this video transcript into well-organized Markdown notes with bullet points. Follow these rules:

1. Identify natural sections/topics based on content
2. For each section:
   - Add a ### heading
   - Include 3-5 key bullet points
   - Use concise, clear language
3. Highlight important terms in **bold**
4. Add timestamps in parentheses where topics change
5. Keep technical concepts accurate

**Transcript**:
{transcript}

**Output ONLY the Markdown notes, no additional commentary**:"""
        
        payload = {
            "contents": [{
                "parts": [{"text": prompt.format(transcript=transcript)}]
            }],
            "generationConfig": {
                "temperature": 0.2,  # Lower for more factual output
                "maxOutputTokens": 4000
            }
        }

        print("[INFO] Sending request to Gemini for notes generation...")
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        result = response.json()
        
        notes = result["candidates"][0]["content"]["parts"][0]["text"]
        print("[INFO] Successfully generated smart notes")
        return notes
        
    except Exception as e:
        print(f"[ERROR] Gemini notes generation failed: {str(e)}")
        raise Exception("AI notes generation failed")

if __name__ == '__main__':
    print("[INFO] Starting Flask server on http://0.0.0.0:5000 ...")
    app.run(host='0.0.0.0', port=5000, debug=True)
    

