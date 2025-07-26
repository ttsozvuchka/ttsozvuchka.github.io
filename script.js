document.addEventListener("DOMContentLoaded", () => {
    let audioFilesData = [];
    let voicesWithTagsData = {};
    const audioListElement = document.getElementById("audio-list");
    const searchInput = document.getElementById("search-input");
    const filterButtons = document.querySelectorAll(".filter-button");
    let activeFilters = {};
    const categoryButtonsContainer = document.getElementById("category-buttons-container");
    const categoryLoadingIndicator = document.getElementById("category-loading-indicator");
    const audioLoadingIndicator = document.getElementById("audio-loading-indicator");

    const tagTranslations = {
        men: "Мужской",
        women: "Женский",
        unknown: "Непонятен",
        child: "Детский",
        young: "Молодой",
        adult: "Взрослый",
        old: "Старый",
        slow: "Медленный",
        medium: "Обычный",
        fast: "Быстрый",
        shit: "Дерьмо",
        bad: "Плохой",
        normal: "Обычный",
        good: "Хороший",
        super: "Супер",
        verylow: "Очень низкий",
        low: "Низкий",
        simple: "Обычный",
        high: "Высокий",
        veryhigh: "Очень высокий",
        funny: "Забавный",
        hd: "HD",
        nohd: "NOHD"
    };

    const categoryTranslations = {
        "Altfs": "Альтушка для скуфа",
        "VlastelinK": "Властелин колец",
        "Nashi Yaziki": "Кириллические языки",
        "KazahskiyA": "Казахский акцент",
        "Pirates of the Caribbean": "Пираты карибского моря",
        "Other": "Другое",
        "Dota 2": "Дота 2",
        "HOTS": "Heroes of the Storm",
        "League of Legends": "Лига Легенд",
        "Hearthstone": "Хартстоун",
        "Skyrim": "Скайрим",
        "WoW": "World of Warcraft",
        "The Witcher": "Ведьмак",
        "Zaychik": "Зайчик",
        "Evil Islands": "Проклятые земли",
        "Half-Life": "Халф-Лайф",
        "Overwatch 2": "Овервотч 2",
        "Warcraft 3": "Варкрафт 3",
        "Slovo": "Слово Пацана",
        "Shrek": "Шрек",
        "Spongebob": "Спанчбоб",
        "Potc": "Пираты Карибского моря",
        "Witcher": "Ведьмак",
        "Valorant": "Валорант",
        "Warthunder": "Вартандер",
        "Fallout": "Фоллаут",
        "Harrypotter": "Гарри Поттер",
        "Transformers, robots": "Трансформеры",
        'Metro 2033': 'Метро 2033'
    };

    const itemsPerPage = 30;
    let currentPage = 1;
    let searchTerm = "";

    function createPaginationButtons(totalPages, applyFilters, audioFiles, container) {
        container.innerHTML = "";

        const prevButton = document.createElement("button");
        prevButton.textContent = "Пред.";
        prevButton.classList.add("pagination-button", "prev-button");
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener("click", () => {
            currentPage--;
            renderPage(applyFilters, audioFiles);
            createPaginationButtons(totalPages, applyFilters, audioFiles, topPaginationContainer);
            createPaginationButtons(totalPages, applyFilters, audioFiles, bottomPaginationContainer);
            if (container === bottomPaginationContainer) {
                scrollToTop();
            }
        });
        container.appendChild(prevButton);

        const pageInfo = document.createElement("span");
        pageInfo.textContent = `${currentPage}/${totalPages}`;
        pageInfo.classList.add("page-info");
        container.appendChild(pageInfo);

        const nextButton = document.createElement("button");
        nextButton.textContent = "След.";
        nextButton.classList.add("pagination-button", "next-button");
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener("click", () => {
            currentPage++;
            renderPage(applyFilters, audioFiles);
            createPaginationButtons(totalPages, applyFilters, audioFiles, topPaginationContainer);
            createPaginationButtons(totalPages, applyFilters, audioFiles, bottomPaginationContainer);
            if (container === bottomPaginationContainer) {
                scrollToTop();
            }
        });
        container.appendChild(nextButton);
    }

    function enableFilterButtons() {
        filterButtons.forEach(button => {
            button.disabled = false;
        });
    }

    function disableFilterButtons() {
        filterButtons.forEach(button => {
            button.disabled = true;
        });
    }

    async function loadAudioData() {
        try {
            audioLoadingIndicator.style.display = "inline-block";

            const voicesWithTagsResponse = await fetch("voices_with_tags.json");
            voicesWithTagsData = await voicesWithTagsResponse.json();

            const audioFilesResponse = await fetch("audio_list.json");
            const audioFiles = await audioFilesResponse.json();

            const tagsMap = new Map();
            for (const voice in voicesWithTagsData) {
                tagsMap.set(voice + ".aac", {
                    tags: voicesWithTagsData[voice].tags || [],
                    category: voicesWithTagsData[voice].category || [],
                    quality: voicesWithTagsData[voice].quality || "normal"
                });
            }

            audioFilesData = audioFiles.map(filename => {
                const data = tagsMap.get(filename) || {
                    tags: [],
                    category: [],
                    quality: "normal"
                };
                return {
                    filename: filename,
                    tags: data.tags,
                    category: data.category,
                    quality: data.quality
                };
            });
            audioLoadingIndicator.style.display = "none";
            return audioFilesData;

        } catch (error) {
            console.error("Ошибка загрузки аудио данных:", error);
            audioListElement.textContent = "Не удалось загрузить аудио файлы.";
        } finally {
            audioLoadingIndicator.style.display = "none";
        }
        return [];
    }

    function createAudioItem(fileData) {
        const fileName = fileData.filename.replace(".aac", "");

        const div = document.createElement("div");
        div.classList.add("audio-item");
        div.dataset.filename = fileName;

        const label = document.createElement("span");
        label.textContent = fileName;
        label.classList.add("clickable");
        label.title = "Click to copy";
        label.addEventListener("click", () => {
            const textToCopy = `!tts ${fileName}`;
            navigator.clipboard.writeText(textToCopy)
                .then(() => console.log(`Скопировано: ${textToCopy}`))
                .catch(err => console.error("Ошибка копирования", err));
        });

        const audio = document.createElement("audio");
        audio.controls = true;
        audio.preload = 'none';
        audio.dataset.src = `audio/${fileData.filename}`;

        const tagsDiv = document.createElement("div");
        tagsDiv.classList.add("tags");
        let combinedTags = [...fileData.tags];

        fileData.category.forEach(category => {
            if (categoryTranslations[category]) {
                combinedTags.push(categoryTranslations[category]);
            } else {
                combinedTags.push(category);
            }
        });

        const sortedTags = combinedTags.sort();
        const translatedTags = sortedTags.map(tag => tagTranslations[tag] || tag);
        tagsDiv.textContent = "Теги: " + translatedTags.join(", ");

        div.appendChild(label);
        div.appendChild(audio);
        div.appendChild(tagsDiv);
        return div;
    }

    let lazyLoad;

    if ('IntersectionObserver' in window) {
        lazyLoad = (target) => {
            const io = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const audio = target.querySelector('audio');
                        if (audio) {
                            audio.src = audio.dataset.src;
                            audio.addEventListener('loadedmetadata', () => {});
                            observer.unobserve(target);
                        }
                    }
                });
            });

            io.observe(target);
        };
    } else {
        console.warn("IntersectionObserver is not supported, loading all audio files");
        lazyLoad = (target) => {
            const audio = target.querySelector('audio');
            if (audio) {
                audio.src = audio.dataset.src;
                audio.addEventListener('loadedmetadata', () => {});
            }
            };
        }

    function renderPage(applyFilters, audioFiles) {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageFiles = audioFiles.slice(startIndex, endIndex);

        audioListElement.innerHTML = "";

        pageFiles.forEach(fileData => {
            const audioItem = createAudioItem(fileData);
            audioListElement.appendChild(audioItem);
            lazyLoad(audioItem);
        });
        audioListElement.scrollTop = 0;
    }

    function applyFilters(audioFiles) {
        const filteredFiles = audioFiles.filter(fileData => {
            const fileName = fileData.filename.replace(".aac", "").toLowerCase();
            const voiceName = fileData.filename.replace(".aac", "");

            let searchTextMatch = true;

            if (searchTerm && searchTerm !== "") {
                searchTextMatch = fileName.includes(searchTerm.toLowerCase()) ||
                    (voicesWithTagsData[voiceName] && voiceName.toLowerCase().includes(searchTerm.toLowerCase()));
            }

            let allFiltersMatch = true;

            for (const filterGroup in activeFilters) {
                if (activeFilters[filterGroup].length > 0) {
                    let groupMatch = false;
                    for (const activeValue of activeFilters[filterGroup]) {
                        if (filterGroup === "category") {
                            if (fileData.category.includes(activeValue)) {
                                groupMatch = true;
                                break;
                            }
                            // обработка пустых категорий
                            if (activeValue === "Other" && (fileData.category.length === 0 || fileData.category.includes("")) ) {
                                groupMatch = true;
                                break;
                            }
                        }  else if (filterGroup === "quality-hd") {
                            if ((activeValue === "hd" && fileData.quality === "hd") ||
                                (activeValue === "nohd" && fileData.quality === "nohd")) {
                                groupMatch = true;
                                break;
                            }
                        } else if (filterGroup === "kachestvo") {
                            // фильтр по качеству (без HD/NOHD)
                            if (fileData.tags.includes(activeValue)) {
                                groupMatch = true;
                                break;
                            }
                        } else {
                            // остальные теги
                            if (fileData.tags.includes(activeValue)) {
                                groupMatch = true;
                                break;
                            }
                        }
                    }
                    if (!groupMatch) {
                        allFiltersMatch = false;
                        break;
                    }
                }
            }

            return searchTextMatch && allFiltersMatch;
        });

        if (filteredFiles.length === 0) {
            audioListElement.innerHTML = "<span style='color:white;'>Голосов не найдено</span>";
            topPaginationContainer.innerHTML = "";
            bottomPaginationContainer.innerHTML = "";
        } else {
            currentPage = 1;
            const totalPages = Math.ceil(filteredFiles.length / itemsPerPage);
            renderPage(applyFilters, filteredFiles);
            createPaginationButtons(totalPages, applyFilters, filteredFiles, topPaginationContainer);
            createPaginationButtons(totalPages, applyFilters, filteredFiles, bottomPaginationContainer);
        }
    }

    function setupFilters(audioFiles) {
        const allButtons = document.querySelectorAll('.filter-button');
        allButtons.forEach(button => {
            button.addEventListener("click", () => {
                const filterGroup = button.closest('.filter-group').id;
                const activeValue = button.dataset.tag || button.dataset.category;

                if (!activeFilters[filterGroup]) {
                    activeFilters[filterGroup] = [];
                }

                const index = activeFilters[filterGroup].indexOf(activeValue);

                if (index === -1) {
                    activeFilters[filterGroup].push(activeValue);
                } else {
                    activeFilters[filterGroup].splice(index, 1);
                }

                updateFilterButtonsState();
                applyFilters(audioFiles);
            });
        });

        searchInput.addEventListener("input", (event) => {
            searchTerm = event.target.value;
            applyFilters(audioFiles);
        });
    }

    function updateFilterButtonsState() {
        const allButtons = document.querySelectorAll('.filter-button');
        allButtons.forEach(button => {
            const filterGroup = button.closest('.filter-group').id;
            const activeValue = button.dataset.tag || button.dataset.category;

            if (activeFilters[filterGroup] && activeFilters[filterGroup].includes(activeValue)) {
                button.classList.add("active");
            } else {
                button.classList.remove("active");
            }
        });
    }

    function populateCategoryButtons(audioFilesData) {
        const categoryCounts = {};
        audioFilesData.forEach(fileData => {
            // если категория пустая, считаем как 'Other'
            if (fileData.category.length === 0 || fileData.category.includes("")) {
                categoryCounts["Other"] = (categoryCounts["Other"] || 0) + 1;
            } else {
                fileData.category.forEach(category => {
                    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
                });
            }
        });

        const sortedCategories = Object.entries(categoryCounts)
            .sort(([, countA], [, countB]) => countB - countA)
            .map(([category]) => category);

        sortedCategories.forEach(category => {
            let buttonText = categoryTranslations[category] || category;

            const button = document.createElement("button");
            button.classList.add("filter-button");
            button.dataset.category = category;
            button.textContent = buttonText;

            categoryButtonsContainer.appendChild(button);
        });
        categoryLoadingIndicator.style.display = "none";
    }

    async function initialize() {
        categoryLoadingIndicator.style.display = "inline-block";
        disableFilterButtons();

        const audioFilesData = await loadAudioData();

        populateCategoryButtons(audioFilesData);

        setupFilters(audioFilesData);
        updateFilterButtonsState();
        enableFilterButtons();
        categoryLoadingIndicator.style.display = "none";
    }

    function scrollToTop() {
        let topOffset = topPaginationContainer.offsetTop;
        let elementHeight = topPaginationContainer.offsetHeight;

        window.scrollTo({
            top: topOffset + elementHeight,
            behavior: "smooth"
        });
    }

    var modal = document.getElementById("allVoicesModal");

    var span = document.getElementsByClassName("close")[0];

    span.onclick = function () {
        modal.style.display = "none";
    }

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }

    const topPaginationContainer = document.createElement("div");
    topPaginationContainer.id = "top-pagination-container";
    topPaginationContainer.classList.add('pagination-container');

    const bottomPaginationContainer = document.getElementById("pagination-container") || document.createElement("div");
    bottomPaginationContainer.id = "pagination-container";
    bottomPaginationContainer.classList.add('pagination-container');

    audioListElement.parentNode.insertBefore(topPaginationContainer, audioListElement);
    audioListElement.parentNode.insertBefore(bottomPaginationContainer, audioListElement.nextSibling);

    initialize();
});