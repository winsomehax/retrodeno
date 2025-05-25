import { getPlatformNames } from './gameUtils.js';

export function renderGamesTable(
    tableBody,
    paginatedGames,
    allPlatforms,
    isLoading,
    error,
    onPlay,
    onEdit,
    onDelete,
    masterGamesList // Needed to get original index
) {
    if (!tableBody) return;
    tableBody.innerHTML = '';

    if (isLoading) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-10">
                    <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    <p class="text-blue-600 mt-2">Loading games...</p>
                </td>
            </tr>`;
        return;
    }

    if (error) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-10">
                    <div class="text-red-600">${error}</div>
                </td>
            </tr>`;
        return;
    }

    if (paginatedGames.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" class="text-center py-10 text-gray-500">
                    No games found matching your criteria.
                </td>
            </tr>`;
        return;
    }

    paginatedGames.forEach((game) => {
        if (!game) return;
        const originalGameIndex = masterGamesList.indexOf(game);
        const platformDisplayNames = getPlatformNames(game, allPlatforms);
        const row = document.createElement('tr');
        row.className = "hover:bg-gray-50";
        row.innerHTML = `
            <td class="px-6 py-4 whitespace-nowrap w-16">
                <img src="${game.cover_image_path || '/img/default-cover.png'}"
                     alt="${game.title || 'No title'}"
                     class="w-12 h-12 object-cover rounded-md bg-gray-200 cover-thumb"
                     onerror="if (this.src !== window.location.origin + '/img/default-cover.png') { this.src='/img/default-cover.png'; } else { this.onerror=null; }">
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${game.title || 'No title'}</td>
            <td class="px-6 py-4 text-sm text-gray-500 truncate max-w-xs">${game.description || 'No description'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${platformDisplayNames || 'No platforms'}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                <button class="text-green-600 hover:text-green-800 play-game-btn" data-original-index="${originalGameIndex}" title="Play">
                    <i class="material-icons text-base">play_arrow</i>
                </button>
                <button class="text-blue-600 hover:text-blue-800 edit-game-btn" data-original-index="${originalGameIndex}" title="Edit">
                    <i class="material-icons text-base">edit</i>
                </button>
                <button class="text-red-600 hover:text-red-800 delete-game-btn" data-original-index="${originalGameIndex}" title="Delete">
                    <i class="material-icons text-base">delete</i>
                </button>
            </td>
        `;
        // Attach event listeners if onPlay, onEdit, onDelete are provided and are functions
        const playBtn = row.querySelector('.play-game-btn');
        if (playBtn && typeof onPlay === 'function') playBtn.onclick = () => onPlay(originalGameIndex);
        
        const editBtn = row.querySelector('.edit-game-btn');
        if (editBtn && typeof onEdit === 'function') editBtn.onclick = () => onEdit(originalGameIndex);

        const deleteBtn = row.querySelector('.delete-game-btn');
        if (deleteBtn && typeof onDelete === 'function') deleteBtn.onclick = () => onDelete(originalGameIndex);
        
        tableBody.appendChild(row);
    });
}

export function renderPlatformFilter(selectElement, platforms, currentFilterValue) {
    if (!selectElement) return;
    let platformOptionsHtml = '';
    if (Array.isArray(platforms)) {
        platformOptionsHtml = platforms
            .map(p => {
                const id = p && p.id !== undefined ? p.id : '';
                const name = p && p.name !== undefined ? p.name : 'Unnamed Platform';
                return `<option value="${id}">${name}</option>`;
            })
            .join('');
    }
    selectElement.innerHTML = '<option value="">All Platforms</option>' + platformOptionsHtml;
    selectElement.value = currentFilterValue || "";
}

export function updatePaginationControls(
    paginationContainer,
    totalFilteredItems,
    currentPage,
    itemsPerPage,
    onPageChange // Callback function: (newPage) => void
) {
    if (!paginationContainer) return;
    paginationContainer.innerHTML = '';
    const totalPages = Math.ceil(totalFilteredItems / itemsPerPage) || 1;

    if (totalFilteredItems <= itemsPerPage && totalPages <= 1) return;

    const nav = document.createElement('nav');
    nav.className = 'flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6';

    const createButton = (text, page, isDisabled) => {
        const btn = document.createElement('button');
        btn.className = `relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`;
        btn.innerHTML = text;
        btn.disabled = isDisabled;
        if (!isDisabled) {
            btn.onclick = () => onPageChange(page);
        }
        return btn;
    };
    
    const prevNextWrapper = document.createElement('div');
    prevNextWrapper.className = 'flex flex-1 justify-between sm:justify-end space-x-2';
    
    const prevBtn = createButton('Previous', currentPage - 1, currentPage === 1);
    const nextBtn = createButton('Next', currentPage + 1, currentPage >= totalPages);
    nextBtn.classList.add('ml-3'); // Tailwind specific margin

    prevNextWrapper.appendChild(prevBtn);
    prevNextWrapper.appendChild(nextBtn);

    const summaryWrapper = document.createElement('div');
    summaryWrapper.className = 'hidden sm:flex sm:flex-1 sm:items-center sm:justify-between';
    const summaryText = document.createElement('p');
    summaryText.className = 'text-sm text-gray-700';
    const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalFilteredItems);
    const endItem = Math.min(currentPage * itemsPerPage, totalFilteredItems);
    summaryText.innerHTML = `Showing <span class="font-medium">${startItem}</span> to <span class="font-medium">${endItem}</span> of <span class="font-medium">${totalFilteredItems}</span> results`;
    
    summaryWrapper.appendChild(summaryText);
    summaryWrapper.appendChild(prevNextWrapper.cloneNode(true)); // Clone for sm+ screens layout
            
    const mobilePrevNextWrapper = prevNextWrapper; // Use original for mobile
    mobilePrevNextWrapper.classList.add('sm:hidden');
    mobilePrevNextWrapper.classList.remove('sm:justify-end');


    nav.appendChild(summaryWrapper); 
    nav.appendChild(mobilePrevNextWrapper);          
    paginationContainer.appendChild(nav);
}

export function updateSortIcons(sortField, sortAsc) {
    const titleIcon = document.getElementById('sortTitleIcon');
    const platformIcon = document.getElementById('sortPlatformIcon');
    if (titleIcon) {
        titleIcon.textContent = sortField === 'title' ? (sortAsc ? 'arrow_drop_up' : 'arrow_drop_down') : 'unfold_more';
    }
    if (platformIcon) {
        platformIcon.textContent = sortField === 'platforms' ? (sortAsc ? 'arrow_drop_up' : 'arrow_drop_down') : 'unfold_more';
    }
}
