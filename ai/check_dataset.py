import os

dataset_path = "dataset"

print("=" * 50)
print("Checking Dataset Structure")
print("=" * 50)

for root, dirs, files in os.walk(dataset_path):
    level = root.replace(dataset_path, "").count(os.sep)
    indent = " " * 4 * level
    print(f"{indent}{os.path.basename(root)}/")
    subindent = " " * 4 * (level + 1)

    image_count = 0
    for file in files:
        if file.lower().endswith((".jpg", ".jpeg", ".png")):
            image_count += 1

    if image_count > 0:
        print(f"{subindent}Images: {image_count}")