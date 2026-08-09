import os

SOURCE_DIR = "dataset/Train"

prefixes = set()

for filename in os.listdir(SOURCE_DIR):
    if filename.lower().endswith((".jpg", ".jpeg", ".png")):
        prefix = filename.split(".")[0].lower()
        prefixes.add(prefix)

print("Prefixes found:")
for p in sorted(prefixes):
    print(p)