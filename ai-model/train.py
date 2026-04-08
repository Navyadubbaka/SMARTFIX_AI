import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras import layers, models

# Load dataset
datagen = ImageDataGenerator(rescale=1./255, validation_split=0.2)

train = datagen.flow_from_directory(
    "dataset",
    target_size=(224,224),
    batch_size=16,
    class_mode="categorical",
    subset="training"
)

val = datagen.flow_from_directory(
    "dataset",
    target_size=(224,224),
    batch_size=16,
    class_mode="categorical",
    subset="validation"
)

# Pretrained model
base = MobileNetV2(weights="imagenet", include_top=False, input_shape=(224,224,3))
base.trainable = False

# Add layers
model = models.Sequential([
    base,
    layers.GlobalAveragePooling2D(),
    layers.Dense(128, activation="relu"),
    layers.Dense(3, activation="softmax")
])

model.compile(optimizer="adam", loss="categorical_crossentropy", metrics=["accuracy"])

# Train
model.fit(train, validation_data=val, epochs=5)

# Save
model.save("model.h5")

print("✅ Model Trained Successfully")