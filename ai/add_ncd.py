import os
import shutil
import hashlib

# ============================================================
# Configuration
# ============================================================

NCD_SOURCE = "dataset/ncd"
NCD_DESTINATION = "dataset/merged/Newcastle_Disease"

IMAGE_EXTENSIONS = (
    ".jpg",
    ".jpeg",
    ".png",
    ".bmp",
    ".webp"
)


# ============================================================
# File Hash
# ============================================================

def file_hash(file_path):

    sha256 = hashlib.sha256()

    with open(file_path, "rb") as file:

        for chunk in iter(
            lambda: file.read(1024 * 1024),
            b""
        ):

            sha256.update(chunk)

    return sha256.hexdigest()


# ============================================================
# Check Folders
# ============================================================

if not os.path.exists(NCD_SOURCE):

    raise SystemExit(
        f"❌ Source folder not found: {NCD_SOURCE}"
    )

if not os.path.exists(NCD_DESTINATION):

    os.makedirs(
        NCD_DESTINATION,
        exist_ok=True
    )


# ============================================================
# Get Existing Image Hashes
# ============================================================

print("=" * 70)
print("ADDING NEWCASTLE DISEASE IMAGES")
print("=" * 70)

print("\nChecking existing NCD images...")

existing_hashes = set()

for root, _, files in os.walk(NCD_DESTINATION):

    for filename in files:

        if filename.lower().endswith(IMAGE_EXTENSIONS):

            path = os.path.join(
                root,
                filename
            )

            existing_hashes.add(
                file_hash(path)
            )

print(
    f"Existing unique images : {len(existing_hashes)}"
)


# ============================================================
# Find New NCD Images
# ============================================================

new_images = []

for root, _, files in os.walk(NCD_SOURCE):

    for filename in files:

        if filename.lower().endswith(IMAGE_EXTENSIONS):

            new_images.append(
                os.path.join(
                    root,
                    filename
                )
            )


print(
    f"Images in ncd folder   : {len(new_images)}"
)


# ============================================================
# Copy New Images
# ============================================================

added = 0
duplicates = 0

for index, source in enumerate(
    new_images,
    start=1
):

    image_hash = file_hash(source)

    # --------------------------------------------------------
    # Skip duplicate
    # --------------------------------------------------------

    if image_hash in existing_hashes:

        duplicates += 1

        continue

    # --------------------------------------------------------
    # Create unique filename
    # --------------------------------------------------------

    original_name = os.path.basename(source)

    destination_name = (
        f"ncd_zenodo_{index}_{original_name}"
    )

    destination = os.path.join(
        NCD_DESTINATION,
        destination_name
    )

    # --------------------------------------------------------
    # Copy
    # --------------------------------------------------------

    shutil.copy2(
        source,
        destination
    )

    existing_hashes.add(image_hash)

    added += 1


# ============================================================
# Final Count
# ============================================================

final_count = 0

for root, _, files in os.walk(NCD_DESTINATION):

    for filename in files:

        if filename.lower().endswith(IMAGE_EXTENSIONS):

            final_count += 1


# ============================================================
# Result
# ============================================================

print("\n" + "=" * 70)
print("NCD MERGE COMPLETED")
print("=" * 70)

print(
    f"New NCD images found : {len(new_images)}"
)

print(
    f"New images added     : {added}"
)

print(
    f"Duplicates skipped   : {duplicates}"
)

print(
    f"Final NCD images     : {final_count}"
)

print("=" * 70)

print("\n✅ Newcastle Disease images successfully added!")