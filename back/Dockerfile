# Утягиваем официальный образ Python 3.11 (Debian-based) 
FROM python:3.11-slim

# 1) Создаём рабочую директорию внутри контейнера
WORKDIR /app

# 2) Копируем только файл зависимостей в контейнер (чтобы кешировать pip install)
COPY requirements.txt .

# 3) Обновляем pip и устанавливаем зависимости
RUN python -m pip install --upgrade pip setuptools wheel \
    && pip install --no-cache-dir -r requirements.txt

# 4) Копируем остальные файлы (приложение и модели)
COPY . .

# 5) Указываем, что у приложения есть порт 5000
EXPOSE 5000

# 6) По умолчанию запускаем Flask через Flask CLI
ENV FLASK_APP=app.py
ENV FLASK_ENV=production

# 7) Команда по-умолчанию: запуск flask run на 0.0.0.0:5000
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]
