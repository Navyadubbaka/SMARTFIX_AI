from flask import Flask, request, jsonify
from PIL import Image
import numpy as np
from tensorflow.keras.models import load_model

app = Flask(__name__)

model = load_model("model.h5")

# IMPORTANT: match folder order
classes = ["carpentry", "electrical", "plumbing"]

@app.route("/predict", methods=["POST"])
def predict():
    file = request.files['image']

    image = Image.open(file)
    image = image.resize((224,224))
    image = np.array(image) / 255.0
    image = np.expand_dims(image, axis=0)

    prediction = model.predict(image)[0]
    max_confidence = float(np.max(prediction))
    category_index = int(np.argmax(prediction))
    category = classes[category_index]

    print("Prediction:", prediction)
    print("Max Confidence:", max_confidence)
    print("Predicted Category:", category)

    if max_confidence < 0.70:
        return jsonify({
            "category": "Unclear",
            "confidence": max_confidence,
            "message": "We couldn't clearly identify the issue. Please upload a clearer image or provide more description."
        })

    return jsonify({
        "category": category,
        "confidence": max_confidence
    })

if __name__ == "__main__":
    app.run(port=8000)