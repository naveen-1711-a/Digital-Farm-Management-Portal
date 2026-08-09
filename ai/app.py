import os
import json
import uuid

import numpy as np
import tensorflow as tf

from PIL import Image
from flask import Flask, request, jsonify
from flask_cors import CORS


# ============================================================
# Flask Configuration
# ============================================================

app = Flask(__name__)

# Allow requests from React / Node.js
CORS(app)

# Maximum upload size: 10 MB
app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024


# ============================================================
# Paths
# ============================================================

MODEL_PATH = "saved_model/poultry_disease_model.keras"
CLASS_FILE = "saved_model/class_names.json"
UPLOAD_FOLDER = "uploads"

IMAGE_SIZE = (224, 224)

ALLOWED_EXTENSIONS = {
    "jpg",
    "jpeg",
    "png",
    "bmp",
    "webp"
}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


# ============================================================
# Load Class Names
# ============================================================

EXPECTED_CLASSES = [
    "Coccidiosis",
    "Healthy",
    "Newcastle_Disease",
    "Salmonella"
]

try:

    if os.path.exists(CLASS_FILE):

        with open(CLASS_FILE, "r") as file:
            CLASS_NAMES = json.load(file)

    else:

        CLASS_NAMES = EXPECTED_CLASSES

    print("Classes loaded:")
    print(CLASS_NAMES)

except Exception as e:

    print("Error loading class names:", e)

    CLASS_NAMES = EXPECTED_CLASSES


# ============================================================
# Disease Information
# ============================================================

DISEASE_INFO = {

    "Healthy": {

        "status": "Healthy",

        "severity": "Low",

        "recommendation": [
            "Continue normal feeding.",
            "Maintain good farm hygiene.",
            "Follow the recommended vaccination schedule.",
            "Regularly monitor bird health."
        ]
    },

    "Coccidiosis": {

        "status": "Infected",

        "severity": "Medium",

        "recommendation": [
            "Separate the suspected affected bird.",
            "Consult a veterinarian for confirmation.",
            "Check litter moisture and cleanliness.",
            "Follow veterinary advice for treatment."
        ]
    },

    "Newcastle_Disease": {

        "status": "Critical",

        "severity": "High",

        "recommendation": [
            "Immediately isolate suspected infected birds.",
            "Contact a veterinarian.",
            "Improve poultry shed biosecurity.",
            "Disinfect contaminated areas and equipment.",
            "Follow veterinary guidance regarding vaccination."
        ]
    },

    "Salmonella": {

        "status": "Infected",

        "severity": "High",

        "recommendation": [
            "Separate suspected infected birds.",
            "Consult a veterinarian.",
            "Improve farm sanitation.",
            "Clean and disinfect contaminated areas.",
            "Monitor other birds for symptoms."
        ]
    }
}


# ============================================================
# Load AI Model
# ============================================================

print("=" * 70)
print("Loading Poultry Disease AI Model...")
print("=" * 70)

try:

    model = tf.keras.models.load_model(MODEL_PATH)

    print("[SUCCESS] AI Model Loaded Successfully")

except Exception as e:

    model = None

    print("[ERROR] Model loading failed")
    print(e)


# ============================================================
# Helper Functions
# ============================================================

def allowed_file(filename):

    if "." not in filename:
        return False

    extension = filename.rsplit(".", 1)[1].lower()

    return extension in ALLOWED_EXTENSIONS


def preprocess_image(image):

    # Convert to RGB
    image = image.convert("RGB")

    # Resize exactly like training
    image = image.resize(IMAGE_SIZE)

    # Convert to NumPy
    image_array = np.array(image)

    # Add batch dimension
    image_array = np.expand_dims(
        image_array,
        axis=0
    )

    # Same preprocessing used during training
    image_array = tf.keras.applications.efficientnet.preprocess_input(
        image_array
    )

    return image_array


# ============================================================
# Home API
# ============================================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({

        "success": True,

        "message": "Poultry Disease Detection API is running.",

        "model": "EfficientNetB0",

        "classes": CLASS_NAMES,

        "endpoint": "/predict"

    })


# ============================================================
# Health Check
# ============================================================

@app.route("/health", methods=["GET"])
def health():

    return jsonify({

        "success": True,

        "model_loaded": model is not None,

        "classes": CLASS_NAMES

    })


# ============================================================
# Prediction API
# ============================================================

@app.route("/predict", methods=["POST"])
def predict():

    # --------------------------------------------------------
    # Check Model
    # --------------------------------------------------------

    if model is None:

        return jsonify({

            "success": False,

            "message": "AI model is not loaded."

        }), 500


    # --------------------------------------------------------
    # Check Image
    # --------------------------------------------------------

    if "image" not in request.files:

        return jsonify({

            "success": False,

            "message": "No image uploaded. Use field name 'image'."

        }), 400


    file = request.files["image"]


    if file.filename == "":

        return jsonify({

            "success": False,

            "message": "No image selected."

        }), 400


    if not allowed_file(file.filename):

        return jsonify({

            "success": False,

            "message": "Unsupported image format."

        }), 400


    # --------------------------------------------------------
    # Save Temporary Image
    # --------------------------------------------------------

    unique_name = (
        str(uuid.uuid4())
        + "_"
        + file.filename
    )

    image_path = os.path.join(
        UPLOAD_FOLDER,
        unique_name
    )

    try:

        file.save(image_path)

        # ----------------------------------------------------
        # Open Image
        # ----------------------------------------------------

        image = Image.open(image_path)

        # ----------------------------------------------------
        # Preprocess
        # ----------------------------------------------------

        processed_image = preprocess_image(image)

        # ----------------------------------------------------
        # Predict
        # ----------------------------------------------------

        prediction = model.predict(
            processed_image,
            verbose=0
        )

        probabilities = prediction[0]

        predicted_index = int(
            np.argmax(probabilities)
        )

        predicted_class = CLASS_NAMES[
            predicted_index
        ]

        confidence = float(
            probabilities[predicted_index] * 100
        )


        # ----------------------------------------------------
        # All Probabilities
        # ----------------------------------------------------

        probabilities_result = {}

        for i, class_name in enumerate(CLASS_NAMES):

            probabilities_result[class_name] = round(
                float(probabilities[i] * 100),
                2
            )


        # ----------------------------------------------------
        # Disease Information
        # ----------------------------------------------------

        info = DISEASE_INFO.get(

            predicted_class,

            {
                "status": "Unknown",
                "severity": "Unknown",
                "recommendation": [
                    "Consult a veterinarian."
                ]
            }
        )


        # ----------------------------------------------------
        # Result
        # ----------------------------------------------------

        result = {

            "success": True,

            "disease": predicted_class,

            "confidence": round(
                confidence,
                2
            ),

            "status": info["status"],

            "severity": info["severity"],

            "recommendation": info["recommendation"],

            "probabilities": probabilities_result

        }


        return jsonify(result), 200


    except Exception as e:

        print("Prediction error:", e)

        return jsonify({

            "success": False,

            "message": "Prediction failed.",

            "error": str(e)

        }), 500


    finally:

        # ----------------------------------------------------
        # Delete temporary uploaded image
        # ----------------------------------------------------

        if os.path.exists(image_path):

            try:
                os.remove(image_path)

            except Exception:
                pass


# ============================================================
# File Size Error
# ============================================================

@app.errorhandler(413)
def file_too_large(error):

    return jsonify({

        "success": False,

        "message": "Image is too large. Maximum size is 10 MB."

    }), 413


# ============================================================
# Start Server
# ============================================================

if __name__ == "__main__":

    print("\n" + "=" * 70)
    print("[*] POULTRY DISEASE DETECTION AI API")
    print("=" * 70)

    print("Server : http://127.0.0.1:5000")
    print("Predict: POST http://127.0.0.1:5000/predict")
    print("Health : GET  http://127.0.0.1:5000/health")

    print("=" * 70)

    app.run(

        host="0.0.0.0",

        port=5000,

        debug=True

    )