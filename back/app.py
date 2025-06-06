from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)  # Разрешаем CORS-запросы от фронтенда

# 1) Загружаем три переобученные модели (каждая уже обучена строго на 10 своих признаках).
#
#    Перед запуском убедитесь, что в папке лежат именно эти файлы:
#      - model_rf_top.pkl
#      - model_lr_top.pkl
#      - model_gb_top.pkl
#
models = {
    'random_forest': joblib.load('model_rf_top10.pkl'),
    'logistic_regression': joblib.load('model_lr_top10.pkl'),
    'gradient_boosting': joblib.load('model_gb_top10.pkl')
}

print("Загруженные модели:", list(models.keys()))


@app.route('/api/models', methods=['GET'])
def list_models():
    """
    Возвращает JSON-список ключей доступных моделей, например:
    { "models": ["random_forest", "logistic_regression", "gradient_boosting"] }
    """
    return jsonify({'models': list(models.keys())})


@app.route('/api/predict', methods=['POST'])
def predict():
    """
    Ожидает JSON вида:
      {
        "model": "<ключ_модели>",
        "features": [f0, f1, ..., f9]   # ровно 10 числовых признаков
      }
    Возвращает JSON вида:
      {
        "prediction": 0 или 1,
        "probability": [p_class_0, p_class_1]   # если модель умеет predict_proba()
      }
    """
    data = request.get_json()
    if data is None:
        return jsonify({'error': 'Некорректный запрос: нет JSON'}), 400

    model_key = data.get('model')
    features = data.get('features')

    # 2) Проверяем, что модель есть в словаре, и что features — список из 10 чисел
    if model_key not in models:
        return jsonify({'error': f'Модель "{model_key}" не найдена'}), 400
    if not isinstance(features, list) or len(features) != 10:
        return jsonify({'error': 'Поле "features" должно быть списком из 10 чисел'}), 400

    try:
        # Преобразуем список в numpy array размера (1, 10)
        X_input = np.array(features, dtype=float).reshape(1, -1)

        clf = models[model_key]
        pred = clf.predict(X_input)[0]
        result = {'prediction': int(pred)}

        # Если у модели есть predict_proba — возвращаем вероятности
        if hasattr(clf, 'predict_proba'):
            probs = clf.predict_proba(X_input)[0]
            result['probability'] = [float(probs[0]), float(probs[1])]

        return jsonify(result)

    except Exception as e:
        # Любая непредвиденная ошибка — возвращаем 500 и текст ошибки
        return jsonify({'error': str(e)}), 500


if __name__ == '__main__':
    # Запускаем Flask на порту 5000. В продакшен-режиме debug=False
    app.run(host='0.0.0.0', port=5000, debug=True)
