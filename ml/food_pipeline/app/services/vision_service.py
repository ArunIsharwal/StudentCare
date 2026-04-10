from transformers import pipeline
from PIL import Image
import io
from app.services.nutrition_data import FOOD_NUTRITION

# Load model once
classifier = pipeline("image-classification", model="nateraw/food")

def process_food_image(image_bytes: bytes):
    try:
        image = Image.open(io.BytesIO(image_bytes))

        results = classifier(image)

        # Get top 3 predictions
        labels = [res['label'] for res in results[:3]]

        print("Detected:", labels)

        return labels

    except Exception as e:
        print("Error:", e)
        return []

def clean_food_name(labels: list):
    if not labels:
        return "", False
        
    keywords = ["curry", "biryani", "paneer", "dal", "rice", "roti", "dosa"]
    cleaned_labels = [label.replace("_", " ").lower() for label in labels]
    
    for label in cleaned_labels:
        if any(keyword in label for keyword in keywords):
            return label.title(), True
            
    return cleaned_labels[0].title(), False

def get_nutrition(food_name: str):
    food_key = food_name.lower()
    
    for key, nutrition in FOOD_NUTRITION.items():
        if key in food_key:
            return nutrition
            
    if "rice" in food_key:
        return FOOD_NUTRITION.get("rice")
    if "curry" in food_key:
        return FOOD_NUTRITION.get("chicken curry")
    if "bread" in food_key:
        return FOOD_NUTRITION.get("roti")
        
    return {
        "calories": 250,
        "protein": 10,
        "fat": 8
    }