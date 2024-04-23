const ENDPOINTS = {
    WORDS: '/words/',
    LEVELS: `/words/levels/`,
    CHARACTERISTICS: '/words/characteristics/',
}
const query = {
    level: null,
    char: null,
    search: null,
}

function getQueryParams() {
    const arr = [
        query.level ? `level=${query.level}` : null,
        query.char ? `char=${query.char}` : null,
        query.search ? `search=${query.search}` : null
    ];

    const filteredArray = arr.filter(item => item !== null);
    const res = filteredArray.join("&");

    return res.length > 0 ? `?${res}` : ""
}

async function get(endpoint) {
    return new Promise((resolve, reject) => {
        fetch(endpoint + getQueryParams()).then(response => resolve(response.json()))
            .catch(error => console.error('Error fetching items:', error));
    })
}

function wordsToTable(words) {
    const table = document.querySelector('#table tbody');
    table.innerHTML = '';

    words.forEach(word => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${word.name}</td>
            <td>
                <ol type="1">
                    ${word.description.split('#').map(i => `<li>${i}</li>`).join("")}
                </ol>
            </td>
            <td>${word.level}</td>
            <td>${word.characteristic}</td>
        `;
        table.appendChild(row);
    });
}

function toggleDropdown(id) {
    const dropdownMenu = document.getElementById(id);
    dropdownMenu.classList.toggle("show");
}

function fillDropdown(dropDownId, titles, onclickFunc) {
    const drop = document.getElementById(dropDownId);
    let items = '';

    titles.forEach(title => {
        items += `<a href="#" onclick="${onclickFunc}('${title}')">${title}</a>`;
    });

    drop.innerHTML = items;
}

async function setLevel(level) {
    query.level = level;
    const words = await get(ENDPOINTS.WORDS)
    wordsToTable(words)

    document.getElementById("drop-btn-1").innerText = "Рівень: " + level
}

async function setChar(char) {
    query.char = char;
    const words = await get(ENDPOINTS.WORDS)
    wordsToTable(words)

    document.getElementById("drop-btn-2").innerText = "Характеристика: " + char
}

async function search() {
    const input = document.getElementById('search')
    query.search = input.value;
    const words = await get(ENDPOINTS.WORDS)
    wordsToTable(words)
}


async function resetFilters() {
    query.level = null;
    query.char = null;
    query.search = null;

    const words = await get(ENDPOINTS.WORDS)
    wordsToTable(words)

    document.getElementById("drop-btn-1").innerText = "За рівнем"
    document.getElementById("drop-btn-2").innerText = "За морфологічною характеристикою"
    document.getElementById('search').value = '';
}

document.addEventListener('DOMContentLoaded', async () => {
    document.addEventListener('click', (event) => {
        const header = document.getElementById('header');
        const nav = document.getElementById('navigation');
        const table = document.getElementById('table');
        const footer = document.getElementById('footer');
        header.classList.add('small');
        footer.classList.add('hidden');
        table.classList.remove('hidden');
        nav.classList.remove('hidden');

        // Hide dropdowns
        if (!event.target.matches('.dropbtn')) {
            const dropdowns = document.getElementsByClassName("dropdown-content");
            for (let i = 0; i < dropdowns.length; i++) {
                const openDropdown = dropdowns[i];
                if (openDropdown.classList.contains('show')) openDropdown.classList.remove('show');
            }
        }
    });

    const words = await get(ENDPOINTS.WORDS);
    const levels = await get(ENDPOINTS.LEVELS)
    const characteristics = await get(ENDPOINTS.CHARACTERISTICS)

    fillDropdown('dropdown-1', levels, 'setLevel')
    fillDropdown('dropdown-2', characteristics, 'setChar')

    wordsToTable(words)
});