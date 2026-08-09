import os
import shutil

SOURCE_DIR = "dataset/Train"
DEST_DIR = "dataset/organized"

# Map filename prefixes to final class names
CLASS_MAP = {
    "cocci": "Coccidiosis",
    "pcrcocci": "Coccidiosis",

    "healthy": "Healthy",
    "pcrhealthy": "Healthy",

    "ncd": "Newcastle_Disease",
    "pcrncd": "Newcastle_Disease",

    "salmo": "Salmonella",
    "pcrsalmo": "Salmonella"
}

# Create destination folders
for class_name in set(CLASS_MAP.values()):
    os.makedirs(os.path.join(DEST_DIR, class_name), exist_ok=True)

count = 0
skipped = []

# Organize images
for filename in os.listdir(SOURCE_DIR):

    if not filename.lower().endswith((".jpg", ".jpeg", ".png")):
        continue

    prefix = filename.split(".")[0].lower()

    if prefix in CLASS_MAP:

        destination = os.path.join(
            DEST_DIR,
            CLASS_MAP[prefix],
            filename
        )

        shutil.copy2(
            os.path.join(SOURCE_DIR, filename),
            destination
        )

        count += 1

    else:
        skipped.append(filename)

print("=" * 50)
print(f"✅ Organized {count} images successfully.")
print(f"⚠️ Skipped {len(skipped)} images.")
print("=" * 50)

if skipped:
    print("\nSkipped Files:")
    for file in skipped[:20]:
        print(file)