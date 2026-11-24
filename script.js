// ===== Дані =====
// Завантажуємо поїздки і налаштування з localStorage (пам'ять браузера).
// Якщо там нічого немає — беремо значення за замовчуванням.
let trips = JSON.parse(localStorage.getItem("trips")) || [];
let settings = JSON.parse(localStorage.getItem("settings")) || {
    consumption: 7,   // л на 100 км
    fuelPrice: 55     // грн за літр
};

// ===== Елементи сторінки =====
const form = document.getElementById("tripForm");
const dateInput = document.getElementById("date");
const platformInput = document.getElementById("platform");
const priceInput = document.getElementById("price");
const distanceInput = document.getElementById("distance");
const paymentInput = document.getElementById("payment");
const consumptionInput = document.getElementById("consumption");
const fuelPriceInput = document.getElementById("fuelPrice");
const periodSelect = document.getElementById("period");
const tripList = document.getElementById("tripList");
const emptyText = document.getElementById("emptyText");
const platformList = document.getElementById("platformList");

// ===== Допоміжні функції =====

// Повертає сьогоднішню дату у форматі РРРР-ММ-ДД
function getToday() {
    const d = new Date();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return d.getFullYear() + "-" + month + "-" + day;
}

// Зберігає дані в localStorage
function saveData() {
    localStorage.setItem("trips", JSON.stringify(trips));
    localStorage.setItem("settings", JSON.stringify(settings));
}

// Повертає поїздки за вибраний період (сьогодні або всі)
function getFilteredTrips() {
    if (periodSelect.value === "today") {
        return trips.filter(trip => trip.date === getToday());
    }
    return trips;
}

// ===== Додавання поїздки =====
form.addEventListener("submit", function (event) {
    event.preventDefault(); // щоб сторінка не перезавантажувалась

    const trip = {
        id: Date.now(), // унікальний номер поїздки
        date: dateInput.value,
        platform: platformInput.value,
        price: Number(priceInput.value),
        distance: Number(distanceInput.value),
        payment: paymentInput.value
    };

    trips.push(trip);
    saveData();
    render();

    // Очищаємо поля суми і відстані для наступної поїздки
    priceInput.value = "";
    distanceInput.value = "";
    priceInput.focus();
});

// ===== Видалення поїздки =====
function deleteTrip(id) {
    if (confirm("Видалити цю поїздку?")) {
        trips = trips.filter(trip => trip.id !== id);
        saveData();
        render();
    }
}

// ===== Зміна налаштувань авто =====
consumptionInput.addEventListener("input", function () {
    settings.consumption = Number(consumptionInput.value);
    saveData();
    render();
});

fuelPriceInput.addEventListener("input", function () {
    settings.fuelPrice = Number(fuelPriceInput.value);
    saveData();
    render();
});

periodSelect.addEventListener("change", render);

// ===== Відображення таблиці =====
function renderTable(list) {
    tripList.innerHTML = "";

    // Сортуємо: нові поїздки зверху
    const sorted = [...list].sort((a, b) => b.id - a.id);

    sorted.forEach(trip => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${trip.date}</td>
            <td>${trip.platform}</td>
            <td>${trip.price} грн</td>
            <td>${trip.distance}</td>
            <td>${trip.payment}</td>
            <td><button class="delete-btn" onclick="deleteTrip(${trip.id})">✕</button></td>
        `;
        tripList.appendChild(row);
    });

    // Якщо поїздок немає — показуємо напис
    emptyText.style.display = list.length === 0 ? "block" : "none";
}

// ===== Підрахунок статистики =====
function renderStats(list) {
    let income = 0;
    let distance = 0;

    for (const trip of list) {
        income += trip.price;
        distance += trip.distance;
    }

    // Витрати на пальне = км * (л/100км) / 100 * ціна за літр
    const fuelCost = distance * settings.consumption / 100 * settings.fuelPrice;
    const profit = income - fuelCost;
    const average = list.length > 0 ? income / list.length : 0;

    document.getElementById("statCount").textContent = list.length;
    document.getElementById("statIncome").textContent = income.toFixed(0);
    document.getElementById("statDistance").textContent = distance.toFixed(1);
    document.getElementById("statFuel").textContent = fuelCost.toFixed(0);
    document.getElementById("statProfit").textContent = profit.toFixed(0);
    document.getElementById("statAverage").textContent = average.toFixed(0);
}

// ===== Дохід за кожною платформою =====
function renderPlatforms(list) {
    const totals = {}; // наприклад { "Bolt": 500, "Uklon": 320 }

    for (const trip of list) {
        if (!totals[trip.platform]) {
            totals[trip.platform] = 0;
        }
        totals[trip.platform] += trip.price;
    }

    platformList.innerHTML = "";
    for (const platform in totals) {
        const li = document.createElement("li");
        li.textContent = platform + ": " + totals[platform] + " грн";
        platformList.appendChild(li);
    }

    if (list.length === 0) {
        platformList.innerHTML = "<li>Немає даних</li>";
    }
}

// ===== Головна функція оновлення сторінки =====
function render() {
    const list = getFilteredTrips();
    renderTable(list);
    renderStats(list);
    renderPlatforms(list);
}

// ===== Запуск при відкритті сторінки =====
dateInput.value = getToday();
consumptionInput.value = settings.consumption;
fuelPriceInput.value = settings.fuelPrice;
render();
