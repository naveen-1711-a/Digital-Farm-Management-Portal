import os
import shutil
import hashlib

# ============================================================
# Configuration
# ============================================================

DATASET1_DIR = "dataset/organized"
DATASET2_DIR = "dataset/poultry_diseases"

MERGED_DIR = "dataset/merged"

IMAGE_EXTENSIONS = (
    ".jpg",
    ".jpeg",
    ".png",
    ".bmp",
    ".webp"
)

# New dataset folder -> final class name
DATASET2_CLASS_MAP = {
    "cocci": "Coccidiosis",
    "healthy": "Healthy",
    "ncd": "Newcastle_Disease",
    "salmo": "Salmonella"
}

CLASS_NAMES = [
    "Coccidiosis",
    "Healthy",
    "Newcastle_Disease",
    "Salmonella"
]


# ============================================================
# Functions
# ============================================================

def file_hash(file_path):

    sha256 = hashlib.sha256()

    with open(file_path, "rb") as f:

        for chunk in iter(
            lambda: f.read(1024 * 1024),
            b""
        ):
            sha256.update(chunk)

    return sha256.hexdigest()


def collect_images(folder):

    images = []

    if not os.path.exists(folder):
        return images

    for root, _, files in os.walk(folder):

        for file in files:

            if file.lower().endswith(IMAGE_EXTENSIONS):

                images.append(
                    os.path.join(root, file)
                )

    return images


# ============================================================
# Start
# ============================================================

print("=" * 70)
print("MERGING POULTRY DATASETS")
print("=" * 70)


# ============================================================
# Check Dataset 1
# ============================================================

if not os.path.exists(DATASET1_DIR):

    raise SystemExit(
        f"❌ Dataset 1 not found: {DATASET1_DIR}"
    )


# ============================================================
# Check Dataset 2
# ============================================================

if not os.path.exists(DATASET2_DIR):

    raise SystemExit(
        f"❌ Dataset 2 not found: {DATASET2_DIR}"
    )


# ============================================================
# Create merged folders
# ============================================================

for class_name in CLASS_NAMES:

    os.makedirs(
        os.path.join(
            MERGED_DIR,
            class_name
        ),
        exist_ok=True
    )


# ============================================================
# Existing image hashes
# ============================================================

existing_hashes = set()


# ============================================================
# Merge Dataset 1
# ============================================================

print("\n" + "=" * 70)
print("COPYING EXISTING DATASET")
print("=" * 70)

dataset1_total = 0

for class_name in CLASS_NAMES:

    source_dir = os.path.join(
        DATASET1_DIR,
        class_name
    )

    if not os.path.exists(source_dir):

        print(
            f"⚠️ Missing: {class_name}"
        )

        continue

    destination_dir = os.path.join(
        MERGED_DIR,
        class_name
    )

    images = collect_images(source_dir)

    class_count = 0

    for index, image_path in enumerate(images):

        image_hash = file_hash(
            image_path
        )

        if image_hash in existing_hashes:
            continue

        existing_hashes.add(
            image_hash
        )

        filename = os.path.basename(
            image_path
        )

        destination = os.path.join(
            destination_dir,
            f"old_{index}_{filename}"
        )

        shutil.copy2(
            image_path,
            destination
        )

        class_count += 1
        dataset1_total += 1

    print(
        f"{class_name:<25} : {class_count} images"
    )


# ============================================================
# Merge Dataset 2
# ============================================================

print("\n" + "=" * 70)
print("COPYING NEW POULTRY DISEASES DATASET")
print("=" * 70)

dataset2_total = 0
duplicates = 0


for source_folder, class_name in DATASET2_CLASS_MAP.items():

    source_dir = os.path.join(
        DATASET2_DIR,
        source_folder
    )

    destination_dir = os.path.join(
        MERGED_DIR,
        class_name
    )

    if not os.path.exists(source_dir):

        print(
            f"⚠️ Missing new folder: {source_folder}"
        )

        continue

    images = collect_images(
        source_dir
    )

    class_count = 0

    for index, image_path in enumerate(images):

        image_hash = file_hash(
            image_path
        )

        # Exact duplicate check
        if image_hash in existing_hashes:

            duplicates += 1

            continue

        existing_hashes.add(
            image_hash
        )

        filename = os.path.basename(
            image_path
        )

        destination = os.path.join(
            destination_dir,
            f"new_{index}_{filename}"
        )

        shutil.copy2(
            image_path,
            destination
        )

        class_count += 1
        dataset2_total += 1

    print(
        f"{class_name:<25} : {class_count} images added"
    )


# ============================================================
# Final Summary
# ============================================================

print("\n" + "=" * 70)
print("MERGE COMPLETED")
print("=" * 70)

print(
    f"Dataset 1 images    : {dataset1_total}"
)

print(
    f"Dataset 2 new images: {dataset2_total}"
)

print(
    f"Duplicates skipped  : {duplicates}"
)

print("\nFinal Class Distribution:")
print("-" * 70)

total = 0

for class_name in CLASS_NAMES:

    class_dir = os.path.join(
        MERGED_DIR,
        class_name
    )

    count = len(
        collect_images(class_dir)
    )

    total += count

    print(
        f"{class_name:<25} : {count}"
    )

print("-" * 70)

print(
    f"TOTAL IMAGES          : {total}"
)

print("=" * 70)

print("\n✅ Dataset merging completed successfully!")