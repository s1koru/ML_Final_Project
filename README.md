# ML_Final_Project(финал если вы не поняли)

#Запуск бэка

  1.Убедитесь, что Docker установлен и работает
  Откройте терминал и выполните:
          docker --version

2. cd path/to/ML_final_project/backend

3. docker build -t ml-backend:latest .

4.*если есть предыдущий контейнер) docker rm -f ml-backend-container

5. docker run -d --name ml-backend-container -p 5000:5000 ml-backend:latest

6. docker ps (проверка)

7. docker logs ml-backend-container (логи)

8. Проверка эндпоинта из хоста  http://127.0.0.1:5000/api/models

#Запуск фронта
1. Новый терминал cd path/to/ML_final_project/frontend
2. python -m http.server 8000
В случае удачи перейти по адресу http://127.0.0.1:8000/index.html


