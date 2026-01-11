import os
from PIL import Image
import pytesseract
from sentence_transformers import SentenceTransformer

# Initialize the CLIP model globally to ensure it's loaded only once.
# 'clip-ViT-B-32' is a popular choice for balancing performance and speed.
try:
    _model = SentenceTransformer('clip-ViT-B-32')
except Exception as e:
    print(f"Warning: FLailed to load CLIP model: {e}")
    _model = None

def load_image(path: str) -> Image.Image:
    """
    Loads an image from the specified file path.
    """
    try:
        if not os.path.exists(path):
            raise FileNotFoundError(f"Image not found at path: {path}")
        return Image.open(path).convert("RGB")
    except Exception as e:
        print(f"Error loading image {path}: {e}")
        raise

def run_ocr(image: Image.Image) -> str:
    """
    Extracts text from the given PIL Image using Tesseract OCR.
    Assumes Tesseract is installed and in the system PATH.
    """
    try:
        # custom_config = r'--oem 3 --psm 6' # Optional: Add configuration flags if needed
        text = pytesseract.image_to_string(image)
        return text.strip()
    except Exception as e:
        print(f"Error running OCR: {e}")
        return ""

def get_clip_embedding(image: Image.Image) -> list:
    """
    Generates a CLIP embedding (ViT-B/32) for the given PIL Image.
    Returns a list of floats.
    """
    if _model is None:
        raise RuntimeError("CLIP model is not initialized.")
    
    try:
        # sentence-transformers handles the preprocessing internally
        embedding = _model.encode(image)
        return embedding.tolist()
    except Exception as e:
        print(f"Error generating embedding: {e}")
        return []

def get_text_embedding(text: str) -> list:
    """
    Generates a CLIP embedding for the given text query.
    """
    if _model is None:
        raise RuntimeError("CLIP model is not initialized.")
    
    try:
        embedding = _model.encode(text)
        return embedding.tolist()
    except Exception as e:
        print(f"Error generating text embedding: {e}")
        return []
