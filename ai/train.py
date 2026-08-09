import os
import json

import tensorflow as tf
import matplotlib.pyplot as plt

from tensorflow.keras import layers, models
from tensorflow.keras.applications import EfficientNetB0

from tensorflow.keras.callbacks import (
    EarlyStopping,
    ModelCheckpoint,
    ReduceLROnPlateau
)

# ============================================================
# Configuration
# ============================================================

IMAGE_SIZE = (224, 224)

BATCH_SIZE = 16

EPOCHS = 40

TRAIN_DIR = "dataset/train"

VALID_DIR = "dataset/validation"

TEST_DIR = "dataset/test"

MODEL_PATH = "saved_model/poultry_disease_model.keras"

BEST_MODEL = "models/best_model.keras"

CLASS_FILE = "saved_model/class_names.json"

# ============================================================
# Create directories
# ============================================================

os.makedirs(
    "saved_model",
    exist_ok=True
)

os.makedirs(
    "models",
    exist_ok=True
)

os.makedirs(
    "plots",
    exist_ok=True
)

# ============================================================
# Load Dataset
# ============================================================

print("=" * 70)
print("Loading Training Dataset")
print("=" * 70)

train_dataset = tf.keras.preprocessing.image_dataset_from_directory(

    TRAIN_DIR,

    image_size=IMAGE_SIZE,

    batch_size=BATCH_SIZE,

    label_mode="categorical",

    shuffle=True,

    seed=42
)

validation_dataset = tf.keras.preprocessing.image_dataset_from_directory(

    VALID_DIR,

    image_size=IMAGE_SIZE,

    batch_size=BATCH_SIZE,

    label_mode="categorical",

    shuffle=False
)

test_dataset = tf.keras.preprocessing.image_dataset_from_directory(

    TEST_DIR,

    image_size=IMAGE_SIZE,

    batch_size=BATCH_SIZE,

    label_mode="categorical",

    shuffle=False
)

# ============================================================
# Classes
# ============================================================

CLASS_NAMES = train_dataset.class_names

print("\nClasses:")

for index, name in enumerate(CLASS_NAMES):

    print(
        f"{index} -> {name}"
    )

# ============================================================
# Validate Classes
# ============================================================

EXPECTED_CLASSES = [
    "Coccidiosis",
    "Healthy",
    "Newcastle_Disease",
    "Salmonella"
]

if CLASS_NAMES != EXPECTED_CLASSES:

    print("\n⚠️ Warning!")
    print(
        "Expected classes:",
        EXPECTED_CLASSES
    )

    print(
        "Found classes:",
        CLASS_NAMES
    )

# ============================================================
# Save Class Names
# ============================================================

with open(
    CLASS_FILE,
    "w"
) as file:

    json.dump(
        CLASS_NAMES,
        file,
        indent=4
    )

print(
    f"\n✅ Class names saved to {CLASS_FILE}"
)

# ============================================================
# Performance
# ============================================================

AUTOTUNE = tf.data.AUTOTUNE

train_dataset = train_dataset.prefetch(
    AUTOTUNE
)

validation_dataset = validation_dataset.prefetch(
    AUTOTUNE
)

test_dataset = test_dataset.prefetch(
    AUTOTUNE
)

# ============================================================
# Data Augmentation
# ============================================================

data_augmentation = tf.keras.Sequential([

    layers.RandomFlip(
        "horizontal"
    ),

    layers.RandomRotation(
        0.15
    ),

    layers.RandomZoom(
        0.15
    ),

], name="data_augmentation")

# ============================================================
# EfficientNetB0
# ============================================================

print("\n" + "=" * 70)
print("Loading EfficientNetB0")
print("=" * 70)

base_model = EfficientNetB0(

    weights="imagenet",

    include_top=False,

    input_shape=(
        224,
        224,
        3
    )
)

# Freeze pretrained layers

base_model.trainable = False

# ============================================================
# Build Model
# ============================================================

inputs = layers.Input(
    shape=(
        224,
        224,
        3
    )
)

x = data_augmentation(
    inputs
)

x = tf.keras.applications.efficientnet.preprocess_input(
    x
)

x = base_model(
    x,
    training=False
)

x = layers.GlobalAveragePooling2D()(
    x
)

x = layers.Dropout(
    0.3
)(
    x
)

outputs = layers.Dense(

    len(CLASS_NAMES),

    activation="softmax"

)(x)

model = models.Model(
    inputs,
    outputs
)

# ============================================================
# Compile
# ============================================================

model.compile(

    optimizer=tf.keras.optimizers.Adam(
        learning_rate=1e-4
    ),

    loss="categorical_crossentropy",

    metrics=[
        "accuracy"
    ]
)

model.summary()

# ============================================================
# Callbacks
# ============================================================

early_stop = EarlyStopping(

    monitor="val_loss",

    patience=6,

    restore_best_weights=True,

    verbose=1
)

checkpoint = ModelCheckpoint(

    BEST_MODEL,

    monitor="val_accuracy",

    save_best_only=True,

    mode="max",

    verbose=1
)

reduce_lr = ReduceLROnPlateau(

    monitor="val_loss",

    factor=0.2,

    patience=3,

    min_lr=1e-6,

    verbose=1
)

# ============================================================
# Train
# ============================================================

print("\n" + "=" * 70)
print("Starting Training")
print("=" * 70)

history = model.fit(

    train_dataset,

    validation_data=validation_dataset,

    epochs=EPOCHS,

    callbacks=[
        early_stop,
        checkpoint,
        reduce_lr
    ]
)

# ============================================================
# Load BEST MODEL
# ============================================================

print("\nLoading best validation model...")

best_model = tf.keras.models.load_model(
    BEST_MODEL
)

# ============================================================
# Save Best Model
# ============================================================

best_model.save(
    MODEL_PATH
)

print(
    "\n✅ Best Model Saved Successfully!"
)

print(
    f"Model: {MODEL_PATH}"
)

# ============================================================
# Evaluate Test Dataset
# ============================================================

print("\n" + "=" * 70)
print("Testing Model")
print("=" * 70)

test_loss, test_accuracy = best_model.evaluate(
    test_dataset,
    verbose=1
)

print(
    f"\nTest Loss     : {test_loss:.4f}"
)

print(
    f"Test Accuracy : {test_accuracy * 100:.2f}%"
)

# ============================================================
# Accuracy Plot
# ============================================================

plt.figure(
    figsize=(8, 5)
)

plt.plot(
    history.history["accuracy"],
    label="Training Accuracy"
)

plt.plot(
    history.history["val_accuracy"],
    label="Validation Accuracy"
)

plt.title(
    "Training and Validation Accuracy"
)

plt.xlabel(
    "Epoch"
)

plt.ylabel(
    "Accuracy"
)

plt.legend()

plt.grid(True)

plt.tight_layout()

plt.savefig(
    "plots/accuracy.png",
    dpi=150
)

plt.close()

# ============================================================
# Loss Plot
# ============================================================

plt.figure(
    figsize=(8, 5)
)

plt.plot(
    history.history["loss"],
    label="Training Loss"
)

plt.plot(
    history.history["val_loss"],
    label="Validation Loss"
)

plt.title(
    "Training and Validation Loss"
)

plt.xlabel(
    "Epoch"
)

plt.ylabel(
    "Loss"
)

plt.legend()

plt.grid(True)

plt.tight_layout()

plt.savefig(
    "plots/loss.png",
    dpi=150
)

plt.close()

print(
    "\n✅ Accuracy graph saved:"
    " plots/accuracy.png"
)

print(
    "✅ Loss graph saved:"
    " plots/loss.png"
)

print("\n" + "=" * 70)
print("🎉 TRAINING COMPLETED SUCCESSFULLY!")
print("=" * 70)