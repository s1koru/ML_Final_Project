document.addEventListener('DOMContentLoaded', () => {
  const modelSelect = document.getElementById('modelSelect');
  const featuresCard = document.getElementById('featuresCard');
  const featuresContainer = document.getElementById('featuresContainer');
  const featuresForm = document.getElementById('featuresForm');
  const predictBtn = document.getElementById('predictBtn');
  const resultCard = document.getElementById('resultCard');
  const predictionText = document.getElementById('predictionText');
  const probText = document.getElementById('probText');
  const resetBtn = document.getElementById('resetBtn');
  const modelFeatures = {
    'random_forest': [
      "ROA(B) до вычета процентов и амортизации после налогообложения",
      "Валовая прибыль / Продажи",
      "Рентабельность операционной прибыли",
      "Обязательства / Собственный капитал",
      "Коэффициент покрытия процентов (Процентные расходы / EBIT)",
      "Ставка непрерывного дохода (после налогообложения)",
      "Чистая прибыль / Собственный капитал",
      "Чистая ставка процента до налогообложения",
      "Коэффициент операционных расходов",
      "Период без привлечения кредита"
    ],
    'logistic_regression': [
      "ROA(A) до вычета процентов и % после налогообложения",
      "Коэффициент денежного потока",
      "Флаг чистой прибыли",
      "Чистая прибыль / Общие активы",
      "Ставка непрерывного дохода (после налогообложения)",
      "Рентабельность операционной прибыли",
      "Коэффициент расходов на НИОКР",
      "Обязательства / Собственный капитал",
      "Валовая маржа от реализованных продаж",
      "Собственный капитал / Обязательства"
    ],
    'gradient_boosting': [
      "ROA(C) до вычета процентов и амортизации",
      "Операционная валовая маржа",
      "Чистая ставка процента после налогообложения",
      "Коэффициент покрытия процентов (Процентные расходы / EBIT)",
      "Флаг чистой прибыли",
      "Рентабельность операционной прибыли",
      "Ставка непрерывного дохода (после налогообложения)",
      "Коэффициент операционных расходов",
      "Чистая прибыль / Общие активы",
      "Валовая прибыль / Продажи"
    ]
  };

  fetch('http://127.0.0.1:5000/api/models')
    .then(response => response.json())
    .then(data => {
      modelSelect.innerHTML = '<option value="" disabled selected>Выберите модель</option>';
      data.models.forEach(key => {
        const opt = document.createElement('option');
        opt.value = key;
        opt.textContent = key;
        modelSelect.appendChild(opt);
      });
      modelSelect.disabled = false;
    })
    .catch(err => {
      console.error('Не удалось получить модели:', err);
      modelSelect.innerHTML = '<option value="" disabled>Ошибка загрузки</option>';
    });

  modelSelect.addEventListener('change', () => {
    const chosen = modelSelect.value;
    if (!chosen) {
      featuresCard.style.display = 'none';
      featuresContainer.innerHTML = '';
      predictBtn.disabled = true;
      return;
    }

    featuresContainer.innerHTML = '';
    const featNames = modelFeatures[chosen] || [];
    if (featNames.length !== 10) {
      console.warn(`Для модели ${chosen} список признаков не длины 10!`);
    }

    featNames.forEach((name, idx) => {
      const wrapper = document.createElement('div');
      wrapper.classList.add('feature-item');

      const lbl = document.createElement('label');
      lbl.setAttribute('for', `feat${idx}`);
      lbl.classList.add('label');
      lbl.textContent = name;

      const inp = document.createElement('input');
      inp.type = 'number';
      inp.step = 'any';
      inp.id = `feat${idx}`;
      inp.classList.add('input');
      inp.required = true;

      inp.addEventListener('input', checkFormValidity);

      wrapper.appendChild(lbl);
      wrapper.appendChild(inp);
      featuresContainer.appendChild(wrapper);
    });

    featuresCard.style.display = 'block';
    predictBtn.disabled = true;
  });

  function checkFormValidity() {
    const inputs = Array.from(featuresContainer.querySelectorAll('input'));
    const allFilled = inputs.every(i => i.value.trim() !== '');
    predictBtn.disabled = !allFilled;
  }

  featuresForm.addEventListener('submit', e => {
    e.preventDefault();
    const chosen = modelSelect.value;
    if (!chosen) return;

    const inputs = Array.from(featuresContainer.querySelectorAll('input'));
    const featuresArr = inputs.map(i => parseFloat(i.value));

    const payload = {
      model: chosen,
      features: featuresArr
    };

    predictBtn.textContent = 'Проверяем…';
    predictBtn.disabled = true;

    fetch('http://127.0.0.1:5000/api/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(resp => resp.json())
      .then(data => {
        if (data.error) {
          predictionText.textContent = `Ошибка сервера: ${data.error}`;
          probText.textContent = '';
        } else {
          const p = data.prediction;
          if (p === 1) {
            predictionText.textContent = 'Модель прогнозирует: компания БАНКРОТ';
          } else {
            predictionText.textContent = 'Модель прогнозирует: компания НЕ банкрот';
          }
          if (data.probability) {
            const [p0, p1] = data.probability;
            probText.textContent = `Вероятности: [0]=${p0.toFixed(3)}, [1]=${p1.toFixed(3)}`;
          } else {
            probText.textContent = '';
          }
        }
        featuresCard.style.display = 'none';
        resultCard.style.display = 'block';
      })
      .catch(err => {
        console.error('Ошибка при запросе /api/predict:', err);
        predictionText.textContent = 'Сетевая или серверная ошибка при получении прогноза';
        probText.textContent = '';
        featuresCard.style.display = 'none';
        resultCard.style.display = 'block';
      })
      .finally(() => {
        predictBtn.textContent = 'Получить прогноз';
      });
  });

  resetBtn.addEventListener('click', () => {
    modelSelect.value = '';
    featuresContainer.innerHTML = '';
    featuresCard.style.display = 'none';
    resultCard.style.display = 'none';
    predictBtn.disabled = true;
  });
});
