import os
import shutil
import random

# ============================================================
# CONFIGURATION
# ============================================================

SOURCE_DIR = "dataset/merged"
OUTPUT_DIR = "dataset"

TRAIN_RATIO = 0.80
VALIDATION_RATIO = 0.10
TEST_RATIO = 0.10

SEED = 42

CLASS_NAMES = [
    "Coccidiosis",
    "Healthy",
    "Newcastle_Disease",
    "Salmonella"
]

IMAGE_EXTENSIONS = (
    ".jpg",
    ".jpeg",
    ".png",
    ".bmp",
    ".webp"
)

random.seed(SEED)


# ============================================================
# VALIDATE RATIOS
# ============================================================

ratio_total = (
    TRAIN_RATIO +
    VALIDATION_RATIO +
    TEST_RATIO
)

if abs(ratio_total - 1.0) > 0.0001:
    raise ValueError(
        "❌ Train + Validation + Test ratios must equal 1.0"
    )


# ============================================================
# FUNCTION: FIND IMAGES
# ============================================================

def get_images(folder):

    images = []

    for root, _, files in os.walk(folder):

        for filename in files:

            if filename.lower().endswith(IMAGE_EXTENSIONS):

                images.append(
                    os.path.join(root, filename)
                )

    return images


# ============================================================
# CHECK SOURCE DATASET
# ============================================================

print("=" * 70)
print("CHECKING MERGED DATASET")
print("=" * 70)

if not os.path.exists(SOURCE_DIR):

    raise SystemExit(
        f"❌ Dataset not found: {SOURCE_DIR}"
    )

for class_name in CLASS_NAMES:

    class_path = os.path.join(
        SOURCE_DIR,
        class_name
    )

    if not os.path.isdir(class_path):

        raise SystemExit(
            f"❌ Missing class folder: {class_path}"
        )

print("✅ All 4 class folders found.")


# ============================================================
# REMOVE OLD SPLITS
# ============================================================

print("\n" + "=" * 70)
print("REMOVING OLD TRAIN / VALIDATION / TEST DATA")
print("=" * 70)

for folder in [
    "train",
    "validation",
    "test"
]:

    folder_path = os.path.join(
        OUTPUT_DIR,
        folder
    )

    if os.path.exists(folder_path):

        shutil.rmtree(folder_path)

        print(
            f"✅ Removed: {folder_path}"
        )

    else:

        print(
            f"ℹ️ Not found: {folder_path}"
        )


# ============================================================
# SPLIT DATASET
# ============================================================

print("\n" + "=" * 70)
print("SPLITTING MERGED DATASET")
print("=" * 70)

grand_total = 0
grand_train = 0
grand_validation = 0
grand_test = 0


for class_name in CLASS_NAMES:

    class_path = os.path.join(
        SOURCE_DIR,
        class_name
    )

    # --------------------------------------------------------
    # Get all images recursively
    # --------------------------------------------------------

    images = get_images(class_path)

    # --------------------------------------------------------
    # Shuffle
    # --------------------------------------------------------

    random.shuffle(images)

    total = len(images)

    if total == 0:

        raise SystemExit(
            f"❌ No images found in {class_name}"
        )

    # --------------------------------------------------------
    # Calculate split
    # --------------------------------------------------------

    train_count = int(
        total * TRAIN_RATIO
    )

    validation_count = int(
        total * VALIDATION_RATIO
    )

    train_images = images[
        :train_count
    ]

    validation_images = images[
        train_count:
        train_count + validation_count
    ]

    test_images = images[
        train_count + validation_count:
    ]

    # --------------------------------------------------------
    # Display statistics
    # --------------------------------------------------------

    print("\n" + "-" * 65)

    print(
        f"Class       : {class_name}"
    )

    print(
        f"Total       : {total}"
    )

    print(
        f"Train       : {len(train_images)}"
    )

    print(
        f"Validation  : {len(validation_images)}"
    )

    print(
        f"Test        : {len(test_images)}"
    )

    # --------------------------------------------------------
    # Update totals
    # --------------------------------------------------------

    grand_total += total
    grand_train += len(train_images)
    grand_validation += len(validation_images)
    grand_test += len(test_images)

    # --------------------------------------------------------
    # Create split folders
    # --------------------------------------------------------

    splits = {

        "train": train_images,

        "validation": validation_images,

        "test": test_images

    }

    # --------------------------------------------------------
    # Copy images
    # --------------------------------------------------------

    for split_name, image_list in splits.items():

        destination_folder = os.path.join(
            OUTPUT_DIR,
            split_name,
            class_name
        )

        os.makedirs(
            destination_folder,
            exist_ok=True
        )

        for index, source in enumerate(
            image_list
        ):

            original_filename = os.path.basename(
                source
            )

            # Add index to prevent filename collisions
            destination_filename = (
                f"{class_name}_{index}_"
                f"{original_filename}"
            )

            destination = os.path.join(
                destination_folder,
                destination_filename
            )

            shutil.copy2(
                source,
                destination
            )


# ============================================================
# FINAL SUMMARY
# ============================================================

print("\n" + "=" * 70)
print("DATASET SPLIT COMPLETED")
print("=" * 70)

print(
    f"Original Total : {grand_total}"
)

print(
    f"Train          : {grand_train}"
)

print(
    f"Validation     : {grand_validation}"
)

print(
    f"Test           : {grand_test}"
)

split_total = (
    grand_train +
    grand_validation +
    grand_test
)

print(
    f"Split Total    : {split_total}"
)

print("=" * 70)

# ============================================================
# FINAL CLASS DISTRIBUTION
# ============================================================

print("\nFINAL CLASS DISTRIBUTION")

print("-" * 70)

for class_name in CLASS_NAMES:

    train_path = os.path.join(
        OUTPUT_DIR,
        "train",
        class_name
    )

    validation_path = os.path.join(
        OUTPUT_DIR,
        "validation",
        class_name
    )

    test_path = os.path.join(
        OUTPUT_DIR,
        "test",
        class_name
    )

    train_count = len(
        get_images(train_path)
    )

    validation_count = len(
        get_images(validation_path)
    )

    test_count = len(
        get_images(test_path)
    )

    print(
        f"{class_name:<22} "
        f"Train: {train_count:<5} "
        f"Val: {validation_count:<5} "
        f"Test: {test_count:<5}"
    )

print("-" * 70)

print(
    "\n80% Train / 10% Validation / 10% Test"
)

print(
    "\n✅ Dataset is ready for AI model training!"
)