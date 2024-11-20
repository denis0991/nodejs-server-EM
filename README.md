# Задание №1 Ветка first-task
В репозитории есть sql файл с командами для создания структуры БД. Для запуска сервиса необходимо ввести данные для входа в БД, при необходимости загрузить ssl файл для postgres.
* Для запуска сервиса добавления остатка, нужно запустить файл server.js, запускается на порту 3000
* Для запуска сервиса сохранения истории изменениий, так же вводим данные для входа в БД и запускаем файл historyService.ts. Если не удастся запустить, можно скомпилировать его в js, командой "npx tsc" и затем запустить "node historyService.js". Запускается на порту 4000.
* Теперь можем использовать наши эндпоинты: Для первого сервиса(post/products, post/stocks, patch/stocks/:id/increase, patch/stocks/:id/decrease, get/stocks, get/products') Для второго (get('/history')

# Задание №2 Ветка second-task
* Перед запуском, ввести данные входа в БД, затем запустить миграции "npx typeorm migration:run -d dist/data-source.js"
* После завершения миграции уже можно выполнить запрос на установку флага false и количество пользователей с флагом true "http://localhost:3000/users/reset-problem-flag"
