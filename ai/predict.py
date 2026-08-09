import os
import json
from datetime import datetime

import numpy as np
import tensorflow as tf
from PIL import Image


# ==========================================================
# Configuration
# ==========================================================

MODEL_PATH = "saved_model/poultry_disease_model.keras"

CLASS_FILE = "saved_model/class_names.json"

IMAGE_SIZE = (224, 224)

# Minimum confidence required for disease prediction
CONFIDENCE_THRESHOLD = 0.60


# ==========================================================
# Disease Information
# ==========================================================

DISEASE_INFO = {

    "Healthy": {
        "status": "Healthy",
        "severity": "Low",
        "recommendation": [
            "Continue normal feeding.",
            "Maintain farm hygiene.",
            "Follow vaccination schedule.",
            "Regularly monitor bird health."
        ]
    },

    "Coccidiosis": {
        "status": "Infected",
        "severity": "Medium",
        "recommendation": [
            "Isolate the affected bird.",
            "Consult a veterinarian.",
            "Follow veterinary advice for treatment.",
            "Replace contaminated litter and improve sanitation."
        ]
    },

    "Newcastle_Disease": {
        "status": "Critical",
        "severity": "High",
        "recommendation": [
            "Immediately isolate suspected infected birds.",
            "Contact a veterinarian immediately.",
            "Disinfect the poultry shed and equipment.",
            "Follow veterinary/public-health guidance for control and vaccination."
        ]
    },

    "Salmonella": {
        "status": "Infected",
        "severity": "High",
        "recommendation": [
            "Separate suspected infected birds.",
            "Consult a veterinarian.",
            "Improve farm sanitation and biosecurity.",
            "Monitor other birds for signs of illness."
        ]
    }
}


# ==========================================================
# Load Class Names
# ==========================================================

print("=" * 70)
print("Loading Class Names...")
print("=" * 70)

if not os.path.exists(CLASS_FILE):

    print("❌ class_names.json not found.")

    print(
        "Please train the model first using train.py."
    )

    exit()

try:

    with open(CLASS_FILE, "r") as file:

        CLASS_NAMES = json.load(file)

    print("✅ Class Names Loaded")

    print(
        "Classes:",
        CLASS_NAMES
    )

except Exception as e:

    print("❌ Unable to load class names.")

    print(e)

    exit()


# ==========================================================
# Validate Class Names
# ==========================================================

if len(CLASS_NAMES) != 4:

    print("\n❌ Unexpected number of classes.")

    print(
        "Expected 4 classes."
    )

    print(
        "Found:",
        CLASS_NAMES
    )

    exit()


# ==========================================================
# Load Model
# ==========================================================

print("\n" + "=" * 70)
print("Loading AI Model...")
print("=" * 70)

if not os.path.exists(MODEL_PATH):

    print("❌ Model file not found.")

    print(
        "Expected:",
        MODEL_PATH
    )

    print(
        "\nTrain the model first using:"
    )

    print(
        "python train.py"
    )

    exit()


try:

    model = tf.keras.models.load_model(
        MODEL_PATH
    )

    print("✅ Model Loaded Successfully")

except Exception as e:

    print("❌ Unable to load model.")

    print(e)

    exit()


# ==========================================================
# Check Model Output
# ==========================================================

try:

    output_classes = model.output_shape[-1]

    if output_classes != len(CLASS_NAMES):

        print("\n❌ Model/Class mismatch!")

        print(
            "Model outputs:",
            output_classes
        )

        print(
            "Class names:",
            len(CLASS_NAMES)
        )

        exit()

except Exception as e:

    print(
        "⚠️ Could not verify model output:"
    )

    print(e)


# ==========================================================
# Read Image Path
# ==========================================================

print("\n" + "=" * 70)
print("IMAGE INPUT")
print("=" * 70)

image_path = input(
    "\nEnter Image Path : "
).strip().strip('"')


# ==========================================================
# Check Image Exists
# ==========================================================

if not os.path.exists(image_path):

    print("\n❌ Image not found.")

    print(
        "Path checked:",
        image_path
    )

    exit()


# ==========================================================
# Load Image
# ==========================================================

try:

    image = Image.open(
        image_path
    ).convert("RGB")

    print(
        "✅ Image Loaded Successfully"
    )

except Exception as e:

    print("\n❌ Invalid image.")

    print(e)

    exit()


# ==========================================================
# Preprocess Image
# ==========================================================

try:

    image = image.resize(
        IMAGE_SIZE
    )

    image_array = np.array(
        image,
        dtype=np.float32
    )

    image_array = np.expand_dims(
        image_array,
        axis=0
    )

    image_array = (
        tf.keras.applications.efficientnet.preprocess_input(
            image_array
        )
    )

except Exception as e:

    print(
        "\n❌ Image preprocessing failed."
    )

    print(e)

    exit()


# ==========================================================
# Prediction
# ==========================================================

print("\nAnalyzing image...")

try:

    prediction = model.predict(
        image_array,
        verbose=0
    )

except Exception as e:

    print(
        "\n❌ Prediction failed."
    )

    print(e)

    exit()


# ==========================================================
# Get Probabilities
# ==========================================================

probabilities = prediction[0]

predicted_index = int(
    np.argmax(probabilities)
)

predicted_class = (
    CLASS_NAMES[predicted_index]
)

confidence = float(
    probabilities[predicted_index]
)


# ==========================================================
# Confidence Check
# ==========================================================

if confidence < CONFIDENCE_THRESHOLD:

    prediction_status = (
        "Low Confidence - Manual Verification Required"
    )

else:

    prediction_status = (
        "Prediction Available"
    )


# ==========================================================
# Create Probability Dictionary
# ==========================================================

all_probabilities = {}

for i, disease in enumerate(CLASS_NAMES):

    all_probabilities[disease] = round(
        float(probabilities[i] * 100),
        2
    )


# ==========================================================
# Disease Information
# ==========================================================

if predicted_class in DISEASE_INFO:

    info = DISEASE_INFO[
        predicted_class
    ]

else:

    info = {

        "status": "Unknown",

        "severity": "Unknown",

        "recommendation": [
            "Consult a veterinarian.",
            "Do not make treatment decisions from the image prediction alone."
        ]
    }


# ==========================================================
# Result JSON
# ==========================================================

result = {

    "prediction_time":
        datetime.now().strftime(
            "%d-%m-%Y %H:%M:%S"
        ),

    "image":
        os.path.basename(
            image_path
        ),

    "disease":
        predicted_class,

    "confidence":
        round(
            confidence * 100,
            2
        ),

    "prediction_status":
        prediction_status,

    "status":
        info["status"],

    "severity":
        info["severity"],

    "recommendation":
        info["recommendation"],

    "probabilities":
        all_probabilities
}


# ==========================================================
# Display Result
# ==========================================================

print("\n")

print("=" * 75)

print(
    "        AI POULTRY DISEASE DETECTION RESULT"
)

print("=" * 75)

print(
    f"Prediction Time : {result['prediction_time']}"
)

print(
    f"Image           : {result['image']}"
)

print(
    f"Disease         : {result['disease']}"
)

print(
    f"Confidence      : {result['confidence']} %"
)

print(
    f"Status          : {result['status']}"
)

print(
    f"Severity        : {result['severity']}"
)

print(
    f"Prediction      : {result['prediction_status']}"
)


# ==========================================================
# Disease Probabilities
# ==========================================================

print("\nDisease Probabilities")

print("-" * 75)

sorted_probabilities = sorted(
    all_probabilities.items(),
    key=lambda x: x[1],
    reverse=True
)

for disease, value in sorted_probabilities:

    print(
        f"{disease:<25} : {value:>6.2f}%"
    )


# ==========================================================
# Recommendation
# ==========================================================

print("\nRecommendation")

print("-" * 75)

for step in result["recommendation"]:

    print(
        f"• {step}"
    )


# ==========================================================
# Warning
# ==========================================================

print("\n⚠️ Important")

print("-" * 75)

print(
    "This AI result is an image-based screening prediction."
)

print(
    "It should not replace professional veterinary diagnosis."
)

print("=" * 75)


# ==========================================================
# Save Prediction Result
# ==========================================================

RESULT_FILE = "prediction_result.json"

try:

    with open(
        RESULT_FILE,
        "w"
    ) as file:

        json.dump(
            result,
            file,
            indent=4
        )

    print(
        f"\n✅ Prediction saved as {RESULT_FILE}"
    )

except Exception as e:

    print(
        "\n⚠️ Could not save prediction result."
    )

    print(e)