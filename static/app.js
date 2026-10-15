async function fetchStatistics(url) {
    const response = await fetch(url, {
        credentials: "same-origin",
        headers: {
            "Accept": "application/json"
        }
    });

    if (!response.ok) {
        throw new Error(`Ошибка HTTP ${response.status}`);
    }

    return await response.json();
}

function formatValue(value, fractionDigits = 0) {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    if (typeof value === "number") {
        return new Intl.NumberFormat("ru-RU", {
            maximumFractionDigits: fractionDigits
        }).format(value);
    }

    return String(value);
}

function renderStatistics(elementId, fields) {
    const container = document.getElementById(elementId);
    container.replaceChildren();

    const list = document.createElement("dl");
    list.className = "row mb-0";

    for (const field of fields) {
        const label = document.createElement("dt");
        label.className = "col-7 mb-2 fw-normal text-muted";
        label.textContent = field.label;

        const value = document.createElement("dd");
        value.className = "col-5 mb-2 text-end fw-semibold";
        value.textContent = formatValue(
            field.value,
            field.fractionDigits || 0
        );

        list.append(label, value);
    }

    container.appendChild(list);
}

function showError(elementId, error) {
    const container = document.getElementById(elementId);

    container.replaceChildren();

    const message = document.createElement("div");
    message.className = "alert alert-danger mb-0";
    message.textContent = `Не удалось загрузить статистику: ${error.message}`;

    container.appendChild(message);
}

async function loadUsersStatistics() {
    const elementId = "users-stats";

    try {
        const data = await fetchStatistics("/api/users/stats/");

        renderStatistics(elementId, [
            { label: "Всего пользователей", value: data.count },
            { label: "Клиентов", value: data.clients },
            { label: "Тренеров", value: data.trainers },
            { label: "Минимальный ID", value: data.min_id },
            { label: "Максимальный ID", value: data.max_id },
            {
                label: "Средний ID",
                value: data.avg_id,
                fractionDigits: 2
            }
        ]);

    } catch (error) {
        showError(elementId, error);
    }
}

async function loadMembershipsStatistics() {
    const elementId = "memberships-stats";

    try {
        const data = await fetchStatistics("/api/membership/stats/");

        renderStatistics(elementId, [
            { label: "Всего абонементов", value: data.count },
            { label: "Активных", value: data.active },
            { label: "Неактивных", value: data.inactive }
        ]);

    } catch (error) {
        showError(elementId, error);
    }
}

async function loadMembershipTypesStatistics() {
    const elementId = "membership-types-stats";

    try {
        const data = await fetchStatistics("/api/membershiptype/stats/");

        const container = document.getElementById(elementId);
        container.replaceChildren();

        if (!Array.isArray(data) || data.length === 0) {
            container.textContent = "Нет данных";
            return;
        }

        const table = document.createElement("table");
        table.className = "table table-sm table-striped align-middle";

        const header = document.createElement("thead");
        const headerRow = document.createElement("tr");

        for (const heading of ["Тип абонемента", "Пользователей"]) {
            const cell = document.createElement("th");
            cell.textContent = heading;
            headerRow.appendChild(cell);
        }

        header.appendChild(headerRow);

        const body = document.createElement("tbody");

        for (const item of data) {
            const row = document.createElement("tr");

            const type = document.createElement("td");
            type.textContent = item.type ?? "—";

            const count = document.createElement("td");
            count.textContent = formatValue(item.users_count);
            count.className = "text-end";

            row.append(type, count);
            body.appendChild(row);
        }

        table.append(header, body);
        container.appendChild(table);

    } catch (error) {
        showError(elementId, error);
    }
}

async function loadWorkoutsStatistics() {
    const elementId = "workouts-stats";

    try {
        const data = await fetchStatistics("/api/workoutsession/stats/");

        renderStatistics(elementId, [
            { label: "Всего тренировок", value: data.total },
            {
                label: "За последние 7 дней",
                value: data.last_7_days
            },
            { label: "Предстоящих", value: data.upcoming },
            {
                label: "Среднее на клиента",
                value: data.avg_per_client,
                fractionDigits: 2
            },
            {
                label: "Самый активный тренер",
                value: data.top_trainer_name
            },
            {
                label: "Тренировок у тренера",
                value: data.top_trainer_sessions
            },
            {
                label: "Самый активный клиент",
                value: data.top_client_name
            },
            {
                label: "Тренировок у клиента",
                value: data.top_client_sessions
            }
        ]);

    } catch (error) {
        showError(elementId, error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadUsersStatistics();
    loadMembershipsStatistics();
    loadMembershipTypesStatistics();
    loadWorkoutsStatistics();
});