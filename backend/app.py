   
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
from threading import Lock
import json
import re
import logging
from datetime import datetime
from functools import wraps


# Session storage
chat_sessions = {}
session_lock = Lock()
# Add with your other configurations
# GEMINI_API_KEY = "AIzaSyCpe6Sh2PC1aoCo8bHasHqnVkKh8n-ChyA"  # Consider using environment variables
# GEMINI_API_KEY="AIzaSyA4SJ0PR9zHtyLbjNVCfgzRtod58KnrUKg"
GEMINI_API_KEY="AIzaSyD3fJt0W25oQKbclBxrzHZvFCyHSM1ve3s"

SUPPORTED_LANGUAGES = {
    'en': 'English',
    'hi': 'Hindi (हिन्दी)',
    'bn': 'Bengali (বাংলা)',
    'ta': 'Tamil (தமிழ்)',
    'te': 'Telugu (తెలుగు)',
    'mr': 'Marathi (मराठी)',
    'gu': 'Gujarati (ગુજરાતી)',
    'kn': 'Kannada (ಕನ್ನಡ)',
    'ml': 'Malayalam (മലയാളം)',
    'pa': 'Punjabi (ਪੰਜਾਬੀ)',
    'or': 'Odia (ଓଡ଼ିଆ)',
    'as': 'Assamese (অসমীয়া)',
    'sa': 'Sanskrit (संस्कृतम्)',
    'ur': 'Urdu (اردو)'
}


# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS
CORS(app, resources={
    r"/api/*": {
        "origins": ["http://localhost:3000", "http://your-react-app-domain.com"],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type"],
        "supports_credentials": True
    }
})
def _build_cors_preflight_response():
    response = jsonify({'status': 'success'})
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Access-Control-Allow-Headers", "*")
    response.headers.add("Access-Control-Allow-Methods", "*")
    return response

def _corsify_actual_response(response, status_code=200):
    response.headers.add("Access-Control-Allow-Origin", "*")
    return response, status_code

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

            output_dir = os.path.join(OUTPUT_FOLDER, output_dir_name)

            copied_frames = copy_high_content_frames(output_dir_name)
            print(f"[INFO] Copied {len(copied_frames)} frames to React public folder")

            # 1. Extract audio immediately after frame extraction
            audio_path = os.path.join(output_dir, 'audio.wav')
            if not extract_audio(filepath, audio_path):
                raise Exception("Audio extraction failed")

            # 2. Generate initial transcript and summary
            transcript, summary = process_transcription(filepath, output_dir)
            if not transcript:
                raise Exception("Initial transcription failed")

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
# @app.route('/api/generate_notes/<output_dir>', methods=['POST'])
# def generate_notes(output_dir):
#     try:
#         print(f"[INFO] Generating smart notes for {output_dir}")
        
#         # Path to transcript
#         transcript_path = os.path.join(OUTPUT_FOLDER, output_dir, "transcript.txt")
        
#         if not os.path.exists(transcript_path):
#             return jsonify({
#                 'status': 'error',
#                 'message': 'Transcript not found'
#             }), 404

#         # Read transcript
#         with open(transcript_path, 'r', encoding='utf-8') as f:
#             transcript = f.read()

#         # Generate notes using Gemini
#         notes = generate_notes_with_gemini(transcript)
        
#         # Save notes
#         notes_path = os.path.join(OUTPUT_FOLDER, output_dir, "smart_notes.md")
#         with open(notes_path, 'w', encoding='utf-8') as f:
#             f.write(notes)
            
#         return jsonify({
#             'status': 'success',
#             'notes': notes,
#             'notes_path': f"api/results/{output_dir}/smart_notes.md"
#         })
        
#     except Exception as e:
#         print(f"[ERROR] Notes generation failed: {str(e)}")
#         return jsonify({
#             'status': 'error',
#             'message': str(e)
#         }), 500

@app.route('/api/generate_notes/<output_dir>', methods=['POST'])
def generate_notes(output_dir):
    """Generate notes in specified language"""
    try:
        data = request.get_json()
        language = data.get('language', 'en')  # Default to English
        
        if language not in SUPPORTED_LANGUAGES:
            return jsonify({
                'status': 'error',
                'message': f'Unsupported language. Supported languages: {", ".join(SUPPORTED_LANGUAGES.values())}'
            }), 400
        
        output_path = os.path.join(OUTPUT_FOLDER, output_dir)
        transcript_path = os.path.join(output_path, 'transcript.txt')
        
        # First try to get language-specific transcript
        lang_transcript_path = os.path.join(output_path, f'transcript_{language}.txt')
        if os.path.exists(lang_transcript_path):
            transcript_path = lang_transcript_path
        
        if not os.path.exists(transcript_path):
            return jsonify({
                'status': 'error',
                'message': 'Transcript not found'
            }), 404

        with open(transcript_path, 'r', encoding='utf-8') as f:
            transcript = f.read()

        # Generate notes in specified language
        prompt = f"""**Instruction**: Convert this video transcript into well-organized Markdown notes in {SUPPORTED_LANGUAGES[language]}. Follow these rules:

1. Use {SUPPORTED_LANGUAGES[language]} language only
2. Identify natural sections/topics based on content
3. For each section:
   - Add a ### heading
   - Include 3-5 key bullet points
   - Use concise, clear language
4. Highlight important terms in **bold**
5. Add timestamps where topics change
6. Keep technical concepts accurate

**Transcript**:
{transcript}

**Output ONLY the Markdown notes in {SUPPORTED_LANGUAGES[language]}, no additional commentary**:"""
        
        headers = {"Content-Type": "application/json"}
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key={GEMINI_API_KEY}"

        payload = {
            "contents": [{
                "parts": [{"text": prompt}]
            }],
            "generationConfig": {
                "temperature": 0.2,
                "maxOutputTokens": 4000
            }
        }

        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        result = response.json()
        
        notes = result["candidates"][0]["content"]["parts"][0]["text"]
        
        # Save language-specific notes
        notes_filename = f'smart_notes_{language}.md'
        notes_path = os.path.join(output_path, notes_filename)
        with open(notes_path, 'w', encoding='utf-8') as f:
            f.write(notes)
            
        return jsonify({
            'status': 'success',
            'notes': notes,
            'language': SUPPORTED_LANGUAGES[language],
            'notes_path': notes_filename
        })
        
    except Exception as e:
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
    

# Update the ChatSession class to handle multiple languages
class ChatSession:
    def __init__(self, output_dir):
        self.output_dir = output_dir
        self.language = 'en'  # Default language
        self.transcript = None
        self.summary = None
        self.notes = None
        self.messages = []
        self.load_resources()
        
    def set_language(self, language):
        if language in SUPPORTED_LANGUAGES:
            self.language = language
            self.load_resources()
            return True
        return False
        
    def load_resources(self):
        """Load language-specific resources"""
        output_path = os.path.join(OUTPUT_FOLDER, self.output_dir)
        
        # Try to load language-specific files first
        lang_specific_summary = os.path.join(output_path, f'summary_{self.language}.txt')
        if os.path.exists(lang_specific_summary):
            with open(lang_specific_summary, 'r', encoding='utf-8') as f:
                self.summary = f.read()
        else:
            default_summary = os.path.join(output_path, 'summary.txt')
            if os.path.exists(default_summary):
                with open(default_summary, 'r', encoding='utf-8') as f:
                    self.summary = f.read()
        
        lang_specific_transcript = os.path.join(output_path, f'transcript_{self.language}.txt')
        if os.path.exists(lang_specific_transcript):
            with open(lang_specific_transcript, 'r', encoding='utf-8') as f:
                self.transcript = f.read()
        else:
            default_transcript = os.path.join(output_path, 'transcript.txt')
            if os.path.exists(default_transcript):
                with open(default_transcript, 'r', encoding='utf-8') as f:
                    self.transcript = f.read()
        
        lang_specific_notes = os.path.join(output_path, f'smart_notes_{self.language}.md')
        if os.path.exists(lang_specific_notes):
            with open(lang_specific_notes, 'r', encoding='utf-8') as f:
                self.notes = f.read()
        else:
            default_notes = os.path.join(output_path, 'smart_notes.md')
            if os.path.exists(default_notes):
                with open(default_notes, 'r', encoding='utf-8') as f:
                    self.notes = f.read()

    def add_message(self, role, content):
        self.messages.append({'role': role, 'content': content})
        
    def get_context(self):
        return {
            'language': SUPPORTED_LANGUAGES[self.language],
            'transcript': self.transcript,
            'summary': self.summary,
            'notes': self.notes,
            'conversation': self.messages[-10:]  # Last 10 messages
        }

# Update the chat endpoints to support language
@app.route('/api/chat/set_language', methods=['POST'])
def set_chat_language():
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        language = data.get('language')
        
        if not session_id or not language:
            return jsonify({'status': 'error', 'message': 'Missing parameters'}), 400
        
        if language not in SUPPORTED_LANGUAGES:
            return jsonify({
                'status': 'error',
                'message': f'Unsupported language. Supported languages: {", ".join(SUPPORTED_LANGUAGES.values())}'
            }), 400
        
        with session_lock:
            session = chat_sessions.get(session_id)
            if not session:
                return jsonify({'status': 'error', 'message': 'Invalid session ID'}), 404
            
            if session.set_language(language):
                return jsonify({
                    'status': 'success',
                    'message': f'Language changed to {SUPPORTED_LANGUAGES[language]}',
                    'language': language
                })
            else:
                return jsonify({
                    'status': 'error',
                    'message': 'Failed to change language'
                }), 400
                
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500
    

@app.route('/api/chat/start_session/<output_dir>', methods=['POST', 'OPTIONS'])
def start_chat_session(output_dir):
    """Initialize a new chat session with enhanced features"""
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    
    try:
        # Input validation
        if not output_dir or not re.match(r'^[a-zA-Z0-9_-]+$', output_dir):
            return _corsify_actual_response(jsonify({
                'status': 'error',
                'message': 'Invalid output directory format'
            }), 400)

        logging.info(f"Starting chat session for {output_dir}")

        # Verify resources exist
        output_path = os.path.join(OUTPUT_FOLDER, output_dir)
        required_files = {
            'summary': 'summary.txt',
            'transcript': 'transcript.txt'
        }

        missing_files = []
        for name, filename in required_files.items():
            if not os.path.exists(os.path.join(output_path, filename)):
                missing_files.append(name)

        if missing_files:
            message = f"Missing required files: {', '.join(missing_files)}"
            logging.error(message)
            return _corsify_actual_response(jsonify({
                'status': 'error',
                'message': message,
                'missing_files': missing_files
            }), 404)

        # Create new session
        session_id = str(uuid.uuid4())
        with session_lock:
            chat_sessions[session_id] = ChatSession(output_dir)
            logging.info(f"Created new chat session {session_id}")

        # Load initial context
        session = chat_sessions[session_id]
        summary_preview = (session.summary[:200] + '...') if session.summary else 'No summary available'

        return _corsify_actual_response(jsonify({
            'status': 'success',
            'session_id': session_id,
            'summary_preview': summary_preview,
            'message': 'Chat session initialized',
            'timestamp': datetime.now().isoformat(),
            'language': session.language,
            'supported_languages': list(SUPPORTED_LANGUAGES.keys())
        }))

    except Exception as e:
        logging.error(f"Failed to start chat session: {str(e)}", exc_info=True)
        return _corsify_actual_response(jsonify({
            'status': 'error',
            'message': 'Failed to initialize chat session',
            'details': str(e)
        }), 500)

# Update the send_message endpoint to use language context
@app.route('/api/chat/send_message', methods=['POST'])
def handle_chat_message():
    try:
        data = request.get_json()
        session_id = data.get('session_id')
        message = data.get('message')
        
        if not session_id or not message:
            return jsonify({'status': 'error', 'message': 'Missing parameters'}), 400
        
        with session_lock:
            session = chat_sessions.get(session_id)
            if not session:
                return jsonify({'status': 'error', 'message': 'Invalid session ID'}), 404
            
            try:
                # Add user message to history
                session.add_message('user', message)
                
                # Get context including language
                context = session.get_context()
                
                prompt = f"""You are an educational video assistant. Current language: {context['language']}
                
                Video Summary: {context['summary'] or 'No summary available'}
                Key Notes: {context['notes'] or 'No notes available'}
                
                Conversation History:
                {json.dumps(context['conversation'], indent=2)}
                
                Current Question: {message}
                
                Provide a helpful response in {context['language']} based on the video content.
                If the question isn't answerable from the video, politely explain that.
                """
                
                headers = {"Content-Type": "application/json"}
                url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key={GEMINI_API_KEY}"
                
                payload = {
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {
                        "temperature": 0.3,
                        "maxOutputTokens": 2000
                    }
                }
                
                response = requests.post(url, headers=headers, json=payload, timeout=30)
                response.raise_for_status()
                result = response.json()
                
                if not result.get('candidates'):
                    raise ValueError("No candidates in response")
                
                bot_response = result["candidates"][0]["content"]["parts"][0]["text"]
                session.add_message('assistant', bot_response)
                
                return jsonify({
                    'status': 'success',
                    'response': bot_response,
                    'session_id': session_id,
                    'language': session.language
                })
                
            except requests.exceptions.RequestException as e:
                return jsonify({
                    'status': 'error',
                    'message': f"API request failed: {str(e)}"
                }), 502
            except Exception as e:
                return jsonify({
                    'status': 'error',
                    'message': f"Processing failed: {str(e)}"
                }), 500
                
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f"Server error: {str(e)}"
        }), 500
    
@app.route('/api/get_supported_languages', methods=['GET'])
def get_supported_languages():
    """Endpoint to get list of supported languages"""
    return jsonify({
        'status': 'success',
        'languages': SUPPORTED_LANGUAGES
    })  


@app.route('/api/generate_summary/<output_dir>', methods=['POST'])
def generate_summary(output_dir):
    """Generate summary in specified language"""
    try:
        data = request.get_json()
        language = data.get('language', 'en')  # Default to English
        
        if language not in SUPPORTED_LANGUAGES:
            return jsonify({
                'status': 'error',
                'message': f'Unsupported language. Supported languages: {", ".join(SUPPORTED_LANGUAGES.values())}'
            }), 400
        
        output_path = os.path.join(OUTPUT_FOLDER, output_dir)
        transcript_path = os.path.join(output_path, 'transcript.txt')
        
        if not os.path.exists(transcript_path):
            return jsonify({'status': 'error', 'message': 'Transcript not found'}), 404
            
        with open(transcript_path, 'r', encoding='utf-8') as f:
            transcript = f.read()
        
        # Customize prompt based on language
        prompt = f"""
        Please summarize the following video transcript in {SUPPORTED_LANGUAGES[language]}.
        Focus on the key points and main ideas. Organize the summary into 
        logical sections if appropriate. Aim for about 20% of the original length.
        
        Provide the summary in {SUPPORTED_LANGUAGES[language]} only.
        
        Transcript:
        {transcript}
        """
        
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
        
        summary = result["candidates"][0]["content"]["parts"][0]["text"]
        
        # Save language-specific summary
        summary_filename = f'summary_{language}.txt'
        summary_path = os.path.join(output_path, summary_filename)
        with open(summary_path, 'w', encoding='utf-8') as f:
            f.write(summary)
            
        return jsonify({
            'status': 'success',
            'summary': summary,
            'language': SUPPORTED_LANGUAGES[language],
            'summary_path': summary_filename
        })
        
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500  
    
@app.route('/api/generate_transcript/<output_dir>', methods=['POST', 'OPTIONS'])
def generate_transcript(output_dir):
    """Generate transcript in specified language with enhanced features"""
    if request.method == 'OPTIONS':
        return _build_cors_preflight_response()
    
    try:
        # Input validation
        if not output_dir or not re.match(r'^[a-zA-Z0-9_-]+$', output_dir):
            return _corsify_actual_response(jsonify({
                'status': 'error',
                'message': 'Invalid output directory format'
            }), 400)

        data = request.get_json()
        if not data:
            return _corsify_actual_response(jsonify({
                'status': 'error',
                'message': 'No data provided'
            }), 400)

        language = data.get('language', 'en')
        logging.info(f"Transcript generation requested for {output_dir} in {language}")

        # Language validation
        if language not in SUPPORTED_LANGUAGES:
            return _corsify_actual_response(jsonify({
                'status': 'error',
                'message': f'Unsupported language. Supported: {", ".join(SUPPORTED_LANGUAGES.values())}'
            }), 400)

        output_path = os.path.join(OUTPUT_FOLDER, output_dir)
        os.makedirs(output_path, exist_ok=True)

        # Check for existing transcript
        transcript_filename = f'transcript_{language}.txt'
        transcript_path = os.path.join(output_path, transcript_filename)
        
        if os.path.exists(transcript_path):
            logging.info(f"Found existing transcript at {transcript_path}")
            with open(transcript_path, 'r', encoding='utf-8') as f:
                transcript = f.read()
            return _corsify_actual_response(jsonify({
                'status': 'success',
                'transcript': transcript,
                'language': SUPPORTED_LANGUAGES[language],
                'transcript_path': transcript_filename,
                'from_cache': True
            }))

        # Audio extraction
        audio_path = os.path.join(output_path, 'audio.wav')
        video_path = next((f for ext in ALLOWED_EXTENSIONS 
                          for f in glob.glob(os.path.join(output_path, f'*.{ext}'))), None)

        if not video_path and not os.path.exists(audio_path):
            logging.error("No audio or video file found")
            return _corsify_actual_response(jsonify({
                'status': 'error',
                'message': 'No audio or video file found'
            }), 404)

        if not os.path.exists(audio_path):
            logging.info("Extracting audio from video...")
            if not extract_audio(video_path, audio_path):
                raise Exception("Audio extraction failed")

        # Gemini API request
        prompt = f"""
        Transcribe this audio verbatim in {SUPPORTED_LANGUAGES[language]}.
        Include timestamps every 30 seconds.
        Maintain original meaning and context.
        """

        with open(audio_path, "rb") as f:
            audio_base64 = base64.b64encode(f.read()).decode("utf-8")

        headers = {"Content-Type": "application/json"}
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-latest:generateContent?key={GEMINI_API_KEY}"

        payload = {
            "contents": [{
                "parts": [
                    {"text": prompt},
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

        logging.info("Sending request to Gemini API...")
        response = requests.post(url, headers=headers, json=payload, timeout=60)
        response.raise_for_status()
        result = response.json()
        
        transcript = result["candidates"][0]["content"]["parts"][0]["text"]
        
        # Save transcript
        with open(transcript_path, 'w', encoding='utf-8') as f:
            f.write(transcript)
        logging.info(f"Transcript saved to {transcript_path}")

        return _corsify_actual_response(jsonify({
            'status': 'success',
            'transcript': transcript,
            'language': SUPPORTED_LANGUAGES[language],
            'transcript_path': transcript_filename,
            'from_cache': False
        }))

    except requests.exceptions.RequestException as e:
        logging.error(f"API request failed: {str(e)}")
        return _corsify_actual_response(jsonify({
            'status': 'error',
            'message': 'Failed to connect to transcription service',
            'details': str(e)
        }), 502)
    except Exception as e:
        logging.error(f"Unexpected error: {str(e)}", exc_info=True)
        return _corsify_actual_response(jsonify({
            'status': 'error',
            'message': 'Transcript generation failed',
            'details': str(e)
        }), 500)

if __name__ == '__main__':
    print("[INFO] Starting Flask server on http://0.0.0.0:5000 ...")
    app.run(host='0.0.0.0', port=5000, debug=True)
    

