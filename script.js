const modal = document.getElementById('operationModal');
const closeModal = document.getElementById('closeModal');

const incomeType = document.getElementById('incomeType');
const expenseType = document.getElementById('expenseType');

const form = document.getElementById('operationForm');

let currentType = 'income';
let editIndex = null;

// Загружаем сохранённые операции
let transactions = JSON.parse(
    localStorage.getItem('mybusiness_transactions') || '[]'
);
// Каталог товаров
let products = JSON.parse(
    localStorage.getItem('mybusiness_products') || '[]'
);

// Каталог услуг
let services = JSON.parse(
    localStorage.getItem('mybusiness_services') || '[]'
);

// История закупок и продаж
let stockHistory = JSON.parse(
    localStorage.getItem('mybusiness_stock_history') || '[]'
);

// Сохранение новых данных
function saveBusinessData() {
    localStorage.setItem('mybusiness_products', JSON.stringify(products));
    localStorage.setItem('mybusiness_services', JSON.stringify(services));
    localStorage.setItem('mybusiness_stock_history', JSON.stringify(stockHistory));
}
// Добавление нового товара
function addProduct(name, category, quantity, purchasePrice, sellingPrice) {
    const product = {
        id: Date.now(),
        name: name,
        category: category,
        quantity: Number(quantity),
        purchasePrice: Number(purchasePrice),
        sellingPrice: Number(sellingPrice)
    };

    products.push(product);
    saveBusinessData();

    return product;
}

// Отображение товаров
function renderProducts() {
    const list = document.getElementById('productsList');

    if (!products.length) {
        list.innerHTML = `
            <p style="color: var(--muted); text-align: center;">
                Товаров пока нет
            </p>
        `;
        return;
    }

    list.innerHTML = '';

    products.forEach(product => {
        const item = document.createElement('div');

        item.style.padding = '14px';
        item.style.marginBottom = '10px';
        item.style.background = 'var(--card2)';
        item.style.borderRadius = '12px';

        item.innerHTML = `
    <strong>${product.name}</strong>
    <p style="color: var(--muted); margin: 6px 0;">
        ${product.category}
    </p>
    <p>Количество: ${product.quantity}</p>
    <p>Закупка: ${money(product.purchasePrice)}</p>
    <p>Продажа: ${money(product.sellingPrice)}</p>
<button
    onclick="editProduct(${product.id})"
    style="
        margin-top: 10px;
        margin-right: 8px;
        padding: 9px 14px;
        background: var(--purple-dark);
        color: white;
        border: 1px solid var(--purple);
        border-radius: 8px;
        cursor: pointer;
    "
>
    Изменить
</button>
    <button
        onclick="deleteProduct(${product.id})"
        style="
            margin-top: 10px;
            padding: 9px 14px;
            background: var(--red);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
        "
    >
        Удалить товар
    </button>
`;

        list.appendChild(item);
    });
}
function renderStockHistory() {
    const container = document.getElementById('stockHistoryList');

    if (!container) return;

    if (stockHistory.length === 0) {
        container.innerHTML = '<p>Поступлений пока нет</p>';
        return;
    }

    container.innerHTML = [...stockHistory]
        .reverse()
        .map(item => `
            <div class="history-item">
                <strong>${item.productName}</strong>
                <p>Дата: ${item.date}</p>
                <p>Количество: +${item.quantity}</p>
                <p>Цена за единицу: ${money(item.purchasePrice)}</p>
                <p>Итого: ${money(item.totalCost)}</p>
            </div>
        `)
        .join('');
}
// Закрытие окна
closeModal.addEventListener('click', () => {
    modal.classList.remove('show');
});

// Переключение на доход
incomeType.addEventListener('click', () => {
    currentType = 'income';

    incomeType.classList.add('selected');
    expenseType.classList.remove('selected');
});

// Переключение на расход
expenseType.addEventListener('click', () => {
    currentType = 'expense';

    expenseType.classList.add('selected');
    incomeType.classList.remove('selected');
});

// Форматирование суммы
function money(value) {
    return value.toLocaleString('ru-RU', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
}

// Цвета категорий расходов
const categoryColors = [
    '#7650B8',
    '#D65A70',
    '#4C9DAB',
    '#D49B45',
    '#6685C5',
    '#A66B9B'
];

// Обновление круговой диаграммы
function updateExpenseChart() {
    const period = document.getElementById('expensePeriod').value;
    const periodTitles = {
    week: 'Эта неделя',
    month: 'Этот месяц',
    year: 'Этот год'
};

document.getElementById('expenseChartTitle').textContent =
    'Расходы по категориям · ' + periodTitles[period];
const now = new Date();

function parseDate(value) {
    const parts = value.split('.');
    if (parts.length !== 3) return null;

    return new Date(
        Number(parts[2]),
        Number(parts[1]) - 1,
        Number(parts[0])
    );
}

const expenses = transactions.filter(item => {
    if (item.type !== 'expense') return false;

    const date = parseDate(item.date);
    if (!date) return false;

    if (period === 'week') {
        const monday = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );

        const day = (monday.getDay() + 6) % 7;
        monday.setDate(monday.getDate() - day);

        return date >= monday && date <= now;
    }

    if (period === 'month') {
        return date.getMonth() === now.getMonth() &&
               date.getFullYear() === now.getFullYear();
    }

    if (period === 'year') {
        return date.getFullYear() === now.getFullYear();
    }

    return true;
});
    const totals = {};

    expenses.forEach(item => {
        const category = item.category || 'Прочее';
        totals[category] = (totals[category] || 0) + item.amount;
    });

    const categories = Object.entries(totals);
    const total = expenses.reduce(
        (sum, item) => sum + item.amount, 0
    );

    const donut = document.getElementById('expenseDonut');
    const percent = document.getElementById('donutPercent');
    const legend = document.getElementById('expenseLegend');
    const categoryStats = document.getElementById('categoryStats');

    legend.innerHTML = '';
    categoryStats.innerHTML = '';

    if (total === 0) {
        donut.style.background =
            'conic-gradient(var(--purple) 0% 100%)';

        percent.textContent = '0%';
        legend.textContent = 'Пока нет расходов';
        categoryStats.textContent = 'Пока нет расходов';
        return;
    }

    let current = 0;
    const gradients = [];

    categories.forEach(([name, amount], index) => {
        const color = categoryColors[
            index % categoryColors.length
        ];

        const share = amount / total * 100;
        const end = current + share;

        gradients.push(`${color} ${current}% ${end}%`);
        current = end;

        // Элемент легенды
        const item = document.createElement('div');
        item.className = 'legend-item';

        const dot = document.createElement('div');
        dot.className = 'dot';
        dot.style.backgroundColor = color;

        const info = document.createElement('div');
        info.textContent = name + ' ';

        const value = document.createElement('strong');
        value.textContent = money(amount) + ' BYN';

        info.appendChild(value);
        item.append(dot, info);
        legend.appendChild(item);

        // Полоска категории
        const row = document.createElement('div');
        row.className = 'category-row';

        const categoryInfo = document.createElement('div');
        categoryInfo.className = 'category-info';

        const categoryName = document.createElement('span');
        categoryName.textContent = name;

        const categoryAmount = document.createElement('span');
        categoryAmount.textContent = money(amount) + ' BYN';

        categoryInfo.append(categoryName, categoryAmount);

        const progress = document.createElement('div');
        progress.className = 'progress';

        const fill = document.createElement('div');
        fill.className = 'progress-fill';
        fill.style.width = share + '%';
        fill.style.backgroundColor = color;

        progress.appendChild(fill);
        row.append(categoryInfo, progress);
        categoryStats.appendChild(row);
    });

    donut.style.background =
        `conic-gradient(${gradients.join(', ')})`;

    const biggest = Math.max(...Object.values(totals));

    percent.textContent =
        Math.round(biggest / total * 100) + '%';
}
// Обновление финансов

function updateIncomeExpenseChart() {
    const chart = document.getElementById('incomeExpenseChart');
    const selector = document.getElementById('chartPeriod');
    const title = document.getElementById('chartTitle');

    if (!chart || !selector || !title) return;

    const period = selector.value;
    const now = new Date();

    let buckets = [];

    function dateKey(date) {
        return [
            date.getFullYear(),
            String(date.getMonth() + 1).padStart(2, '0'),
            String(date.getDate()).padStart(2, '0')
        ].join('-');
    }

    function parseDate(value) {
        const parts = value.split('.');
        if (parts.length !== 3) return null;

        const date = new Date(
            Number(parts[2]),
            Number(parts[1]) - 1,
            Number(parts[0])
        );

        if (isNaN(date.getTime())) return null;
        return date;
    }

    if (period === 'week') {
        const monday = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
        );

        const day = (monday.getDay() + 6) % 7;
        monday.setDate(monday.getDate() - day);

        const names = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

        for (let i = 0; i < 7; i++) {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);

            buckets.push({
                key: dateKey(date),
                label: names[i]
            });
        }

        title.textContent = 'Статистика за неделю';
    }

    if (period === 'month') {
        const year = now.getFullYear();
        const month = now.getMonth();
        const days = new Date(year, month + 1, 0).getDate();

        for (let i = 1; i <= days; i++) {
            const date = new Date(year, month, i);

            buckets.push({
                key: dateKey(date),
                label: i === 1 || i % 5 === 0 || i === days
                    ? String(i)
                    : ''
            });
        }

        title.textContent = 'Статистика за месяц';
    }

    if (period === 'year') {
        const names = [
            'Янв', 'Фев', 'Мар', 'Апр',
            'Май', 'Июн', 'Июл', 'Авг',
            'Сен', 'Окт', 'Ноя', 'Дек'
        ];

        for (let i = 0; i < 12; i++) {
            buckets.push({
                key: i,
                label: names[i]
            });
        }

        title.textContent = 'Статистика за год';
    }

    const values = buckets.map(() => ({
        income: 0,
        expense: 0
    }));

    transactions.forEach(item => {
        const date = parseDate(item.date);
        if (!date) return;

        let index = -1;

        if (period === 'week' || period === 'month') {
            index = buckets.findIndex(
                bucket => bucket.key === dateKey(date)
            );
        } else {
            if (date.getFullYear() !== now.getFullYear()) return;
            index = date.getMonth();
        }

        if (index === -1) return;

        if (item.type === 'income') {
            values[index].income += Number(item.amount) || 0;
        } else if (item.type === 'expense') {
            values[index].expense += Number(item.amount) || 0;
        }
    });

    const maxValue = Math.max(
        0,
        ...values.flatMap(v => [v.income, v.expense])
    );

    chart.innerHTML = '';

    buckets.forEach((bucket, index) => {
        const column = document.createElement('div');
        column.className = 'chart-column';

        const group = document.createElement('div');
        group.className = 'bar-group';

        const incomeBar = document.createElement('div');
        incomeBar.className = 'bar income-bar';

        const expenseBar = document.createElement('div');
        expenseBar.className = 'bar expense-bar';

        const chartMaxHeight = 115;

const incomeHeight = maxValue
    ? values[index].income / maxValue * chartMaxHeight
    : 0;

const expenseHeight = maxValue
    ? values[index].expense / maxValue * chartMaxHeight
    : 0;
       incomeBar.style.height = incomeHeight + 'px';
       expenseBar.style.height = expenseHeight + 'px';

        incomeBar.title = 'Доходы: ' + money(values[index].income);
        expenseBar.title = 'Расходы: ' + money(values[index].expense);

        group.append(incomeBar, expenseBar);

        const label = document.createElement('span');
        label.className = 'chart-label';
        label.textContent = bucket.label;

        column.append(group, label);
        chart.appendChild(column);
    });
}
function getPeriodTransactions() {
    const period = document.getElementById('chartPeriod').value;

    const now = new Date();

    const today = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7));

    return transactions.filter(item => {
        const parts = item.date.split('.');

        const date = new Date(
            Number(parts[2]),
            Number(parts[1]) - 1,
            Number(parts[0])
        );

        if (period === 'week') {
            return date >= weekStart && date <= today;
        }

        if (period === 'month') {
            return date.getMonth() === now.getMonth() &&
                   date.getFullYear() === now.getFullYear();
        }

        if (period === 'year') {
            return date.getFullYear() === now.getFullYear();
        }

        return true;
    });
}
function calculateIncomeChange() {
    const period = document.getElementById('chartPeriod').value;
    const now = new Date();

    let start;
    let previousStart;
    let previousEnd;

    if (period === 'week') {
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
        start.setDate(start.getDate() - ((start.getDay() + 6) % 7));

        previousStart = new Date(start);
        previousStart.setDate(start.getDate() - 7);

        previousEnd = new Date(start);
        previousEnd.setMilliseconds(-1);
    } else if (period === 'month') {
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        previousEnd = new Date(start.getTime() - 1);
    } else {
        start = new Date(now.getFullYear(), 0, 1);
        previousStart = new Date(now.getFullYear() - 1, 0, 1);
        previousEnd = new Date(start.getTime() - 1);
    }

    function getIncome(from, to) {
        return transactions
            .filter(item => {
                const parts = item.date.split('.');
                const date = new Date(
                    Number(parts[2]),
                    Number(parts[1]) - 1,
                    Number(parts[0])
                );

                return item.type === 'income' &&
                    date >= from &&
                    date <= to;
            })
            .reduce((sum, item) => sum + Number(item.amount), 0);
    }

    const currentIncome = getIncome(start, now);
    const previousIncome = getIncome(previousStart, previousEnd);

    if (previousIncome === 0) {
        return currentIncome > 0 ? 100 : 0;
    }

    return ((currentIncome - previousIncome) / previousIncome) * 100;
}
function updateDashboard() {
    const periodTransactions = getPeriodTransactions();

    const income = periodTransactions
        .filter(item => item.type === 'income')
        .reduce((sum, item) => sum + Number(item.amount), 0);

    const expenses = periodTransactions
        .filter(item => item.type === 'expense')
        .reduce((sum, item) => sum + Number(item.amount), 0);

    const balance = income - expenses;
    const change = calculateIncomeChange();

const changeElement = document.getElementById('balanceChange');
changeElement.textContent =
    (change >= 0 ? '↗ +' : '↘ ') +
    change.toFixed(1) + '%';
changeElement.style.color =
    change >= 0 ? '#35c98a' : '#ff6262';
    document.getElementById('balanceValue').innerHTML =
        `${money(balance)} <small>BYN</small>`;

    document.getElementById('incomeValue').textContent =
        '+' + money(income);

    document.getElementById('expenseValue').textContent =
        '−' + money(expenses);

    updateExpenseChart();
    updateIncomeExpenseChart();
    renderTransactions();
}
// Отображение истории


function createTransactionRow(item) {
    const row = document.createElement('div');
    row.className = 'transaction';

    const icon = document.createElement('div');
    icon.className = 'transaction-icon';
    icon.textContent = item.type === 'income' ? '💰' : '🧾';

    const info = document.createElement('div');
    info.className = 'transaction-info';

    const name = document.createElement('strong');
    name.textContent = item.name;

    const details = document.createElement('span');
    details.textContent = item.date + ' · ' + item.category;

    info.append(name, details);

    const amount = document.createElement('div');
    amount.className = 'transaction-amount ' +
        (item.type === 'income' ? 'income-value' : 'expense-value');

    amount.textContent =
        (item.type === 'income' ? '+' : '−') +
        money(Number(item.amount)) + ' BYN';

    const editButton = document.createElement('button');
    editButton.className = 'edit-button';
    editButton.type = 'button';
    editButton.textContent = '✎';

    editButton.addEventListener('click', () => {
        editIndex = item.originalIndex;

        document.getElementById('operationName').value = item.name;
        document.getElementById('operationAmount').value = item.amount;
        document.getElementById('operationCategory').value = item.category;

        currentType = item.type;

        incomeType.classList.toggle('selected', currentType === 'income');
        expenseType.classList.toggle('selected', currentType === 'expense');

        document.querySelector('.modal-header h2').textContent =
            'Редактировать операцию';

        modal.classList.add('show');
    });

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button';
    deleteButton.type = 'button';
    deleteButton.textContent = '×';

    deleteButton.addEventListener('click', () => {
        if (!confirm('Удалить эту операцию?')) return;

        transactions.splice(item.originalIndex, 1);

        localStorage.setItem(
            'mybusiness_transactions',
            JSON.stringify(transactions)
        );

        updateDashboard();
    });

    row.append(icon, info, amount, editButton, deleteButton);

    return row;
}

function getDateGroup(dateString) {
    const parts = dateString.split('.');

    const date = new Date(
        Number(parts[2]),
        Number(parts[1]) - 1,
        Number(parts[0])
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.getTime() === today.getTime()) {
        return 'Сегодня';
    }

    if (date.getTime() === yesterday.getTime()) {
        return 'Вчера';
    }

    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long'
    });
}
function renderTransactions() {
    const mainList = document.getElementById('transactionsList');
    const historyList = document.getElementById('historyTransactionsList');

    const sorted = transactions
        .map((item, index) => ({
            ...item,
            originalIndex: index
        }))
        .reverse();

    mainList.innerHTML = '';

    sorted.slice(0, 3).forEach(item => {
        mainList.appendChild(createTransactionRow(item));
    });

    if (!historyList) return;

    historyList.innerHTML = '';

    const search = document.getElementById('historySearch');
    const typeFilter = document.getElementById('historyType');
    const periodFilter = document.getElementById('historyPeriod');

    const searchValue = search.value.toLowerCase().trim();
    const selectedType = typeFilter.value;
    const selectedPeriod = periodFilter.value;

    const now = new Date();
    const today = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    );

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7));

    const filtered = sorted.filter(item => {
        const matchesSearch = (item.name || '')
            .toLowerCase()
            .includes(searchValue);

        const matchesType =
            selectedType === 'all' || item.type === selectedType;

        const parts = item.date.split('.');
        const itemDate = new Date(
            Number(parts[2]),
            Number(parts[1]) - 1,
            Number(parts[0])
        );

        let matchesPeriod = true;

        if (selectedPeriod === 'today') {
            matchesPeriod = itemDate.getTime() === today.getTime();
        }

        if (selectedPeriod === 'week') {
            matchesPeriod = itemDate >= weekStart && itemDate <= today;
        }

        if (selectedPeriod === 'month') {
            matchesPeriod =
                itemDate.getMonth() === now.getMonth() &&
                itemDate.getFullYear() === now.getFullYear();
        }

        return matchesSearch && matchesType && matchesPeriod;
    });

    if (filtered.length === 0) {
        const empty = document.createElement('div');
        empty.style.color = 'var(--muted)';
        empty.style.textAlign = 'center';
        empty.style.padding = '20px 0';
        empty.textContent = 'Операций не найдено';
        historyList.appendChild(empty);
        return;
    }

    let lastDateGroup = '';

filtered.forEach(item => {
    const dateGroup = getDateGroup(item.date);

    if (dateGroup !== lastDateGroup) {
        const heading = document.createElement('div');
        heading.className = 'date-group-title';
        heading.textContent = dateGroup;

        historyList.appendChild(heading);
        lastDateGroup = dateGroup;
    }

    historyList.appendChild(createTransactionRow(item));
});
}

function createHistoryPage() {
    if (document.getElementById('historyPage')) return;

    const page = document.createElement('div');
    page.id = 'historyPage';
    page.style.display = 'none';
    page.style.paddingBottom = '100px';

    page.innerHTML = `
        
<h1>История операций</h1>

<div class="section-title">Все операции</div>

<section class="panel">
    <input
        id="historySearch"
        type="text"
        placeholder="🔎 Поиск операции..."
    >

    <div class="history-filters">
        <select id="historyType">
            <option value="all">Все операции</option>
            <option value="income">Доходы</option>
            <option value="expense">Расходы</option>
        </select>

        <select id="historyPeriod">
            <option value="all">За всё время</option>
            <option value="today">Сегодня</option>
            <option value="week">Эта неделя</option>
            <option value="month">Этот месяц</option>
        </select>
    </div>

    <div class="transactions" id="historyTransactionsList"></div>
</section>
    `;

    document.querySelector('.app').appendChild(page);
}

function showPage(pageName) {
    createHistoryPage();
const search = document.getElementById('historySearch');
const typeFilter = document.getElementById('historyType');
const periodFilter = document.getElementById('historyPeriod');

search.oninput = renderTransactions;
typeFilter.onchange = renderTransactions;
periodFilter.onchange = renderTransactions;
    const app = document.querySelector('.app');
    const historyPage = document.getElementById('historyPage');

    Array.from(app.children).forEach(child => {
    if (child.id === 'historyPage') {
        child.style.display =
            pageName === 'history' ? 'block' : 'none';
    }
    else if (child.id === 'profilePage') {
        child.style.display =
            pageName === 'profile' ? 'block' : 'none';
    }
  else if (child.id === 'plansPage') {
    child.style.display =
        pageName === 'plans' ? 'block' : 'none';
}
else if (child.id === 'productsPage') {
    child.style.display =
        pageName === 'products' ? 'block' : 'none';
}
    else {
        child.style.display =
            pageName === 'home' ? '' : 'none';
    }
});

    document.querySelector('.bottom-nav .nav-item:nth-child(1)')
        .classList.toggle('active', pageName === 'home');

    document.querySelector('.bottom-nav .nav-item:nth-child(3)')
        .classList.toggle('active', pageName === 'history');
document.querySelector('.bottom-nav .nav-item:nth-child(4)')
    .classList.toggle('active', pageName === 'profile');
    renderTransactions();
    if (pageName === 'products') {
    renderProducts();
}
}

// Удаление товара
function deleteProduct(id) {
    products = products.filter(product => product.id !== id);

    saveBusinessData();
    renderProducts();
}
function removeStock(productId, quantity) {
    const product = products.find(item => item.id === Number(productId));

    if (!product) {
        alert('Товар не найден');
        return false;
    }

    quantity = Number(quantity);

    if (!Number.isFinite(quantity) || quantity <= 0) {
        alert('Укажи корректное количество');
        return false;
    }

    if (quantity > product.quantity) {
        alert('На складе недостаточно товара');
        return false;
    }

    product.quantity -= quantity;

    stockHistory.push({
        id: Date.now(),
        productId: product.id,
        productName: product.name,
        type: 'sale',
        quantity: -quantity,
        purchasePrice: product.purchasePrice,
        totalCost: quantity * product.purchasePrice,
        date: new Date().toLocaleDateString('ru-RU')
    });

    saveBusinessData();
    renderProducts();
    renderStockHistory();

    return true;
}
function editProduct(id) {
    const product = products.find(product => product.id === id);

    if (!product) return;

    editingProductId = id;

    document.getElementById('productName').value = product.name;
    document.getElementById('productCategory').value = product.category;
    document.getElementById('productQuantity').value = product.quantity;
    document.getElementById('productPurchasePrice').value = product.purchasePrice;
    document.getElementById('productSellingPrice').value = product.sellingPrice;

    productModal.classList.add('show');
}
function openStockModal() {
    stockForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const productId = Number(stockProduct.value);
    const quantity = Number(
        document.getElementById('stockQuantity').value
    );
    const purchasePrice = Number(
        document.getElementById('stockPurchasePrice').value
    );

    const product = products.find(item => item.id === productId);

    if (!product || quantity <= 0 || purchasePrice < 0) {
        alert('Проверь введённые данные');
        return;
    }

    const oldQuantity = Number(product.quantity);
    const oldPrice = Number(product.purchasePrice);

    const newQuantity = oldQuantity + quantity;

    // Пересчитываем среднюю закупочную цену
    product.purchasePrice = (
        oldQuantity * oldPrice + quantity * purchasePrice
    ) / newQuantity;

    product.quantity = newQuantity;

    stockHistory.push({
        id: Date.now(),
        productId: product.id,
        productName: product.name,
        quantity: quantity,
        purchasePrice: purchasePrice,
        totalCost: quantity * purchasePrice,
        date: new Date().toLocaleDateString('ru-RU')
    });

    saveBusinessData();
    renderProducts();
    renderStockHistory();
    stockForm.reset();
    stockModal.classList.remove('show');

    alert('Склад успешно пополнен!');
});
    stockForm.reset();

    stockProduct.innerHTML = '<option value="">Выберите товар</option>';

    products.forEach(product => {
        const option = document.createElement('option');

        option.value = product.id;
        option.textContent = product.name;

        stockProduct.appendChild(option);
    });

    stockModal.classList.add('show');
}
// Сохранение операции

form.addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('operationName').value.trim();
    const amount = Number(
        document.getElementById('operationAmount').value
    );

    const category = document.getElementById('operationCategory').value;

    if (!name || !Number.isFinite(amount) || amount <= 0) {
        alert('Проверь название и сумму операции');
        return;
    }

    const operation = {
        name: name,
        amount: amount,
        category: category,
        type: currentType,
        date: editIndex === null
            ? new Date().toLocaleDateString('ru-RU')
            : transactions[editIndex].date
    };

    if (editIndex === null) {
        transactions.push(operation);
    } else {
        transactions[editIndex] = operation;
    }

    localStorage.setItem(
        'mybusiness_transactions',
        JSON.stringify(transactions)
    );

    modal.classList.remove('show');
    form.reset();

    editIndex = null;
    currentType = 'income';

    incomeType.classList.add('selected');
    expenseType.classList.remove('selected');

    document.querySelector('.modal-header h2').textContent =
        'Новая операция';

    updateDashboard();
});
// Обработчик переключения периода
document.getElementById('chartPeriod')
    .addEventListener('change', updateDashboard);
    document.getElementById('expensePeriod')
    .addEventListener('change', updateExpenseChart);
// Показываем сохранённые данные при запуске
updateDashboard();
function openAddOperation() {
    editIndex = null;
    currentType = 'income';

    form.reset();

    incomeType.classList.add('selected');
    expenseType.classList.remove('selected');

    document.querySelector('.modal-header h2').textContent =
        'Новая операция';

    modal.classList.add('show');
}
function loadTelegramProfile() {
    const tg = window.Telegram?.WebApp;
    const user = tg?.initDataUnsafe?.user;

    if (!user) return;

    tg.ready();

    const fullName = [user.first_name, user.last_name]
        .filter(Boolean)
        .join(' ');

    document.getElementById('telegramName').textContent =
        fullName || 'Пользователь';

    document.getElementById('telegramUsername').textContent =
        user.username ? '@' + user.username : 'Username отсутствует';

    document.getElementById('telegramId').textContent = user.id;

    if (user.photo_url) {
        const avatar = document.getElementById('telegramAvatar');
        avatar.src = user.photo_url;
        avatar.style.display = 'block';

        document.getElementById('avatarFallback').style.display = 'none';
    }
}

loadTelegramProfile();
// Элементы окна добавления товара
const productModal = document.getElementById('productModal');
const productForm = document.getElementById('productForm');
const closeProductModal = document.getElementById('closeProductModal');
const stockModal = document.getElementById('stockModal');
const stockForm = document.getElementById('stockForm');
const stockProduct = document.getElementById('stockProduct');
const closeStockModal = document.getElementById('closeStockModal');
closeStockModal.addEventListener('click', () => {
    stockModal.classList.remove('show');
});
// Открытие окна добавления товара
let editingProductId = null;

function openProductModal() {
    editingProductId = null;
    productForm.reset();
    productModal.classList.add('show');
}
// Закрытие окна товара
closeProductModal.addEventListener('click', () => {
    productModal.classList.remove('show');
});

// Добавление товара через форму
productForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = document.getElementById('productName').value.trim();
    const category = document.getElementById('productCategory').value;
    const quantity = document.getElementById('productQuantity').value;
    const purchasePrice = document.getElementById('productPurchasePrice').value;
    const sellingPrice = document.getElementById('productSellingPrice').value;

    if (editingProductId !== null) {
    const product = products.find(product => product.id === editingProductId);

    if (product) {
        product.name = name;
        product.category = category;
        product.quantity = Number(quantity);
        product.purchasePrice = Number(purchasePrice);
        product.sellingPrice = Number(sellingPrice);
    }

    saveBusinessData();
    editingProductId = null;
} else {
    addProduct(name, category, quantity, purchasePrice, sellingPrice);
}

    productForm.reset();
    productModal.classList.remove('show');

    alert('Товар успешно добавлен!');
});
// Боковое меню
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebarOverlay');
const menuButton = document.getElementById('menuButton');
const closeSidebar = document.getElementById('closeSidebar');

// Открытие меню
function openSidebar() {
    sidebar.classList.add('active');
    sidebarOverlay.classList.add('active');
}

// Закрытие меню
function hideSidebar() {
    sidebar.classList.remove('active');
    sidebarOverlay.classList.remove('active');
}

menuButton.addEventListener('click', openSidebar);
closeSidebar.addEventListener('click', hideSidebar);
sidebarOverlay.addEventListener('click', hideSidebar);
// ==================================
// ЗАЩИТА ПРИ ВХОДЕ В MYBUSINESS
// ==================================

const loginScreen = document.getElementById('loginScreen');
const loginPin = document.getElementById('loginPin');
const loginButton = document.getElementById('loginButton');
const loginMessage = document.getElementById('loginMessage');

let firstPin = '';
let pinStage = localStorage.getItem('mybusiness_pin_hash')
    ? 'login'
    : 'create';

// Хеширование PIN
async function hashPin(pin) {
    const data = new TextEncoder().encode(pin);
    const hash = await crypto.subtle.digest('SHA-256', data);

    return Array.from(new Uint8Array(hash))
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
}

// Настройка экрана
if (pinStage === 'create') {
    loginMessage.textContent = 'Придумайте PIN-код из 4–6 цифр';
    loginButton.textContent = 'Продолжить';
} else {
    loginMessage.textContent = 'Введите PIN-код для входа';
    loginButton.textContent = 'Войти';
}

// Нажатие на кнопку
loginButton.addEventListener('click', async () => {

    const pin = loginPin.value;

    if (!/^\d{4,6}$/.test(pin)) {
        loginMessage.textContent = 'Введите от 4 до 6 цифр';
        return;
    }

    // Создание PIN
    if (pinStage === 'create') {

        firstPin = pin;
        pinStage = 'confirm';

        loginPin.value = '';
        loginMessage.textContent = 'Повторите PIN-код';
        loginButton.textContent = 'Подтвердить';

        return;
    }

    // Подтверждение PIN
    if (pinStage === 'confirm') {

        if (pin !== firstPin) {
            firstPin = '';
            pinStage = 'create';

            loginPin.value = '';
            loginMessage.textContent = 'PIN-коды не совпали. Придумайте новый';
            loginButton.textContent = 'Продолжить';

            return;
        }

        const hash = await hashPin(pin);

        localStorage.setItem('mybusiness_pin_hash', hash);

        loginScreen.style.display = 'none';
        return;
    }

    // Обычный вход
    if (pinStage === 'login') {

        const hash = await hashPin(pin);
        const savedHash = localStorage.getItem('mybusiness_pin_hash');

        if (hash === savedHash) {
            loginScreen.style.display = 'none';
        } else {
            loginMessage.textContent = 'Неверный PIN-код';
            loginPin.value = '';
        }
    }
});