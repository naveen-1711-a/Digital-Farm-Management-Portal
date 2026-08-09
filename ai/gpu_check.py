import tensorflow as tf

print("=" * 50)
print("TensorFlow Version:", tf.__version__)
print("=" * 50)

gpus = tf.config.list_physical_devices("GPU")

if gpus:
    print("✅ GPU Detected")
    print(gpus)
else:
    print("❌ GPU Not Detected")