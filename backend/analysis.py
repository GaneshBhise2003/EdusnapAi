# 27/04/2025 working version
# import cv2
# import numpy as np
# import pytesseract
# import pandas as pd
# import os
# import torch
# import torchvision.models as models
# import torchvision.transforms as transforms
# from PIL import Image
# from torchvision.models import ResNet50_Weights

# # Load ResNet model correctly
# print("[INFO] Loading ResNet50 model...")
# model = models.resnet50(weights=ResNet50_Weights.IMAGENET1K_V1)
# model.eval()
# print("[INFO] ResNet50 model loaded and set to evaluation mode.")

# # Define transformation for ResNet input
# resnet_transform = transforms.Compose([
#     transforms.Resize((224, 224)),
#     transforms.ToTensor(),
#     transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
# ])
# print("[INFO] Image transformation pipeline defined.")

# # Function to extract frames from video
# def extract_frames(video_path, fps=1):
#     print(f"[INFO] Extracting frames from: {video_path}")
#     cap = cv2.VideoCapture(video_path)
#     frames = []
#     frame_rate = int(cap.get(cv2.CAP_PROP_FPS))

#     if frame_rate == 0:
#         print("[ERROR] Could not read video FPS. Check video file.")
#         return []

#     interval = max(1, int(frame_rate / fps))
#     print(f"[INFO] Frame interval set to: {interval} (based on {frame_rate} FPS)")

#     frame_idx = 0
#     success, frame = cap.read()
#     while success:
#         if frame_idx % interval == 0:
#             frames.append(frame)
#         frame_idx += 1
#         success, frame = cap.read()

#     cap.release()
#     print(f"[INFO] Total frames extracted: {len(frames)}")
#     return frames

# # Function to calculate ResNet-based content density
# def calculate_resnet_features(frame):
#     frame_pil = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
#     input_tensor = resnet_transform(frame_pil).unsqueeze(0)

#     with torch.no_grad():
#         features = model(input_tensor)

#     return features.abs().sum().item()

# # Main function to process frames and save dataset
# def generate_dataset(video_path, output_folder, csv_filename, top_n=5):
#     print("[INFO] Starting dataset generation...")

#     if not os.path.exists(output_folder):
#         os.makedirs(output_folder)
#         print(f"[INFO] Created output folder: {output_folder}")

#     frames = extract_frames(video_path, fps=1)
#     if not frames:
#         print("[ERROR] No frames extracted. Terminating process.")
#         return

#     frame_data = []
#     frame_densities = []

#     print("[INFO] Calculating ResNet content densities...")
#     for idx, frame in enumerate(frames):
#         print(f"  > Processing frame {idx+1}/{len(frames)}...")
#         resnet_density = calculate_resnet_features(frame)
#         frame_densities.append((frame, resnet_density, idx))
#         frame_data.append({
#             "Frame_Index": idx,
#             "ResNet_Content_Density": resnet_density,
#             "Label": "low content"
#         })

#     print("[INFO] Identifying top high-content frames...")
#     sorted_frames = sorted(frame_densities, key=lambda x: x[1], reverse=True)
#     top_frames = sorted_frames[:top_n]

#     print("[INFO] Saving labeled frames to disk...")
#     for frame, resnet_density, idx in frame_densities:
#         label = "high content" if any(idx == top_idx for _, _, top_idx in top_frames) else "low content"
#         frame_data[idx]["Label"] = label

#         filename = f"{label}_frame_{idx}.png"
#         filepath = os.path.join(output_folder, filename)
#         cv2.imwrite(filepath, frame)
#         print(f"  > Saved: {filepath} (density={resnet_density:.2f})")

#     print("[INFO] Creating and saving CSV dataset...")
#     df = pd.DataFrame(frame_data)
#     print(df.head())  # Debug preview
#     df.to_csv(csv_filename, index=False)
#     print(f"[INFO] Dataset CSV saved to: {csv_filename}")
#     print("[SUCCESS] Dataset generation complete.")




# converted to reduce time complexity and improve performance
#  edit on 27/04/2025
import cv2
import numpy as np
import pandas as pd
import os
import torch
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
from torchvision.models import ResNet50_Weights

# Load ResNet model
print("[INFO] Loading ResNet50 model...")
model = models.resnet50(weights=ResNet50_Weights.IMAGENET1K_V1)
model.eval()
print("[INFO] ResNet50 model loaded and set to evaluation mode.")

# Define transformation for ResNet input
resnet_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])
print("[INFO] Image transformation pipeline defined.")

def extract_frames(video_path, target_frame_count=100):
    """Optimized frame extraction to get a representative sample"""
    print(f"[INFO] Extracting frames from: {video_path}")
    cap = cv2.VideoCapture(video_path)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    
    if total_frames == 0:
        print("[ERROR] Could not read video frame count. Check video file.")
        return []

    # Calculate skip interval to get approximately target_frame_count frames
    skip_interval = max(1, total_frames // target_frame_count)
    frames = []
    
    for i in range(0, total_frames, skip_interval):
        cap.set(cv2.CAP_PROP_POS_FRAMES, i)
        success, frame = cap.read()
        if success:
            frames.append(frame)
    
    cap.release()
    print(f"[INFO] Extracted {len(frames)} frames (target was {target_frame_count})")
    return frames

def calculate_resnet_features(frame):
    """Optimized ResNet feature calculation"""
    # Convert to PIL and resize in one operation
    img = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
    
    # Use faster tensor conversion
    img_tensor = resnet_transform(img).unsqueeze(0)
    
    with torch.no_grad():
        # Use only first few layers for faster feature extraction
        features = model.conv1(img_tensor)
        features = model.bn1(features)
        features = model.relu(features)
        features = model.maxpool(features)
        features = model.layer1(features)
    
    return features.abs().sum().item()

def generate_dataset(video_path, output_folder, csv_filename, top_n=5):
    """Optimized dataset generation focusing on high-content frames"""
    print("[INFO] Starting optimized dataset generation...")

    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
        print(f"[INFO] Created output folder: {output_folder}")

    # Step 1: Initial quick pass to identify candidate frames
    print("[INFO] Performing initial quick scan...")
    frames = extract_frames(video_path)
    if not frames:
        print("[ERROR] No frames extracted. Terminating process.")
        return

    # Pre-filter frames using simple OpenCV metrics
    print("[INFO] Pre-filtering frames...")
    candidate_frames = []
    for idx, frame in enumerate(frames):
        # Use blur detection to filter out bad frames
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
        
        # Use color variance as secondary metric
        color_score = np.std(frame)
        
        combined_score = blur_score * 0.7 + color_score * 0.3
        candidate_frames.append((frame, combined_score, idx))
    
    # Keep only top 30% of frames for detailed analysis
    candidate_frames.sort(key=lambda x: x[1], reverse=True)
    top_candidates = candidate_frames[:int(len(candidate_frames)*0.3)]
    
    # Step 2: Detailed analysis only on candidate frames
    print("[INFO] Performing detailed analysis on candidates...")
    frame_densities = []
    for frame, _, idx in top_candidates:
        resnet_density = calculate_resnet_features(frame)
        frame_densities.append((frame, resnet_density, idx))
    
    # Get top N frames
    top_frames = sorted(frame_densities, key=lambda x: x[1], reverse=True)[:top_n]
    
    # Step 3: Save only high-content frames and generate CSV
    print("[INFO] Saving high-content frames...")
    frame_data = []
    for frame, density, idx in top_frames:
        # filename = f"high_content_frame_{idx}.png"
        filename = f"high content_frame_{idx}.png"
        filepath = os.path.join(output_folder, filename)
        cv2.imwrite(filepath, frame)
        frame_data.append({
            "Frame_Index": idx,
            "ResNet_Content_Density": density,
            "Label": "high content"
        })
    
    # Save CSV
    df = pd.DataFrame(frame_data)
    df.to_csv(csv_filename, index=False)
    print(f"[INFO] Dataset CSV saved to: {csv_filename}")
    print("[SUCCESS] Optimized dataset generation complete.")




# 28/04/2025 code with pytesseract for frame analysis

# import cv2
# import numpy as np
# import pandas as pd
# import os
# import torch
# import pytesseract
# import torchvision.models as models
# import torchvision.transforms as transforms
# from PIL import Image
# from torchvision.models import ResNet50_Weights

# # Configure Tesseract path (update for your system)
# pytesseract.pytesseract.tesseract_cmd = r'/usr/bin/tesseract'  # Linux/Mac
# # pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'  # Windows

# # Load ResNet model
# print("[INFO] Loading ResNet50 model...")
# model = models.resnet50(weights=ResNet50_Weights.IMAGENET1K_V1)
# model.eval()
# print("[INFO] ResNet50 model loaded and set to evaluation mode.")

# # Define transformation for ResNet input
# resnet_transform = transforms.Compose([
#     transforms.Resize((224, 224)),
#     transforms.ToTensor(),
#     transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
# ])

# def extract_frames(video_path, target_frame_count=100):
#     """Optimized frame extraction with scene detection"""
#     cap = cv2.VideoCapture(video_path)
#     total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
#     frames = []
    
#     # Only analyze every nth frame for text detection
#     text_analysis_interval = max(5, total_frames // 50)
#     text_presence_threshold = 0.3  # % of frames needing text analysis
    
#     for i in range(0, total_frames, max(1, total_frames // target_frame_count)):
#         cap.set(cv2.CAP_PROP_POS_FRAMES, i)
#         success, frame = cap.read()
#         if success:
#             # Only check for text periodically
#             if i % text_analysis_interval == 0:
#                 if has_significant_text(frame):
#                     text_presence_threshold = 0.7  # Increase if text found
#             frames.append(frame)
    
#     cap.release()
#     return frames

# def has_significant_text(frame, min_text_length=15):
#     """Quick text presence check without full OCR"""
#     gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
#     _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY_INV)
#     contours, _ = cv2.findContours(thresh, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    
#     text_like_contours = 0
#     for cnt in contours:
#         x,y,w,h = cv2.boundingRect(cnt)
#         aspect_ratio = w / float(h)
#         if 0.5 < aspect_ratio < 10 and w > 20 and h > 20:  # Text-like characteristics
#             text_like_contours += 1
    
#     return text_like_contours > 5  # Empirical threshold

# def calculate_text_score(frame):
#     """Fast text content estimation using contour analysis"""
#     gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
#     _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY_INV)
#     contours, _ = cv2.findContours(thresh, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
    
#     text_area = 0
#     for cnt in contours:
#         x,y,w,h = cv2.boundingRect(cnt)
#         if w > 10 and h > 10:  # Minimum text size
#             text_area += w * h
    
#     return min(1.0, text_area / (frame.shape[0] * frame.shape[1]))  # Normalized

# def calculate_resnet_features(frame):
#     """Optimized ResNet feature calculation"""
#     img = Image.fromarray(cv2.cvtColor(frame, cv2.COLOR_BGR2RGB))
#     img_tensor = resnet_transform(img).unsqueeze(0)
    
#     with torch.no_grad():
#         features = model.conv1(img_tensor)
#         features = model.bn1(features)
#         features = model.relu(features)
#         features = model.maxpool(features)
#         features = model.layer1(features)
    
#     return features.abs().sum().item()

# def generate_dataset(video_path, output_folder, csv_filename, top_n=5):
#     """Optimized generation with smart text handling"""
#     frames = extract_frames(video_path)
#     if not frames:
#         return

#     # First pass: quick visual analysis
#     candidate_frames = []
#     for idx, frame in enumerate(frames):
#         gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
#         blur_score = cv2.Laplacian(gray, cv2.CV_64F).var()
#         color_score = np.std(frame)
#         text_score = calculate_text_score(frame)  # Fast contour-based
        
#         combined_score = (blur_score * 0.5 + 
#                          color_score * 0.2 + 
#                          text_score * 0.3)
        
#         candidate_frames.append((frame, combined_score, idx))
    
#     # Narrow down candidates
#     candidate_frames.sort(key=lambda x: x[1], reverse=True)
#     top_candidates = candidate_frames[:int(len(candidate_frames)*0.3)]
    
#     # Second pass: detailed analysis with selective OCR
#     frame_densities = []
#     text_video = any(has_significant_text(f[0]) for f in top_candidates[:5])
    
#     for frame, _, idx in top_candidates:
#         vis_score = calculate_resnet_features(frame)
        
#         # Only run full OCR if video appears text-heavy
#         text_score = 0
#         if text_video:
#             try:
#                 text = pytesseract.image_to_string(frame, timeout=2)  # Timeout safety
#                 text_score = min(1.0, len(text) / 500)  # Normalized
#             except:
#                 pass
        
#         final_score = vis_score * (0.7 if text_video else 1.0) + text_score * 0.3
#         frame_densities.append((frame, final_score, idx))
    
#     # Final selection
#     top_frames = sorted(frame_densities, key=lambda x: x[1], reverse=True)[:top_n]
    
#     # Save results
#     frame_data = []
#     for frame, density, idx in top_frames:
#         filename = f"high content_frame_{idx}.png"
#         cv2.imwrite(os.path.join(output_folder, filename), frame)
#         frame_data.append({
#             "Frame_Index": idx,
#             "ResNet_Content_Density": density,
#             "Label": "high content"
#         })
    
#     pd.DataFrame(frame_data).to_csv(csv_filename, index=False)