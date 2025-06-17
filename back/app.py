from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)  

models = {
    'random_forest': joblib.load('model_rf_top10.pkl'),
    'logistic_regression': joblib.load('model_lr_top10.pkl'),
    'gradient_boosting': joblib.load('model_gb_top10.pkl')
}

print("Загруженные модели:", list(models.keys()))


@app.route('/api/models', methods=['GET'])
def list_models():
    return jsonify({'models': list(models.keys())})


@app.route('/api/predict', methods=['POST'])
def predict():
    data = request.get_json()
    if data is None:
        return jsonify({'error': 'Некорректный запрос: нет JSON'}), 400

    model_key = data.get('model')
    features = data.get('features')

    if model_key not in models:
        return jsonify({'error': f'Модель "{model_key}" не найдена'}), 400
    if not isinstance(features, list) or len(features) != 10:
        return jsonify({'error': 'Поле "features" должно быть списком из 10 чисел'}), 400

    try:
        X_input = np.array(features, dtype=float).reshape(1, -1)

        clf = models[model_key]
        pred = clf.predict(X_input)[0]
        result = {'prediction': int(pred)}

        if hasattr(clf, 'predict_proba'):
            probs = clf.predict_proba(X_input)[0]
            result['probability'] = [float(probs[0]), float(probs[1])]

        return jsonify(result)

    except Exception as e:
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    # Запускаем Flask на порту 5000. В продакшен-режиме debug=False
    app.run(host='0.0.0.0', port=5000, debug=True)
