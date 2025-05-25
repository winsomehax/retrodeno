import { getPlatformNames } from './gameUtils.js';

export function renderGamesGrid( // Renamed from renderGamesTable
    gridContainer, // Parameter name changed
    paginatedGames,
    allPlatforms,
    isLoading,
    error,
    onPlay,
    onEdit,
    onDelete,
    masterGamesList // Needed to get original index
) {
    if (!gridContainer) return;
    gridContainer.innerHTML = ''; // Clear previous content

    if (isLoading) {
        // Display loading indicator directly in the grid container
        // It will span the full width due to grid container's nature if it's the only child
        gridContainer.innerHTML = `
            <div class="col-span-full text-center py-20">
                <div class="inline-block animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-orange-500"></div>
                <p class="text-orange-400 mt-4 text-lg">Loading games...</p>
            </div>`;
        return;
    }

    if (error) {
        gridContainer.innerHTML = `
            <div class="col-span-full text-center py-20">
                <i class="material-icons text-red-400 text-5xl mb-2">error_outline</i>
                <p class="text-red-400 text-lg">${error}</p>
            </div>`;
        return;
    }

    if (paginatedGames.length === 0) {
        gridContainer.innerHTML = `
            <div class="col-span-full text-center py-20">
                <i class="material-icons text-slate-500 text-5xl mb-2">search_off</i>
                <p class="text-slate-400 text-lg">No games found matching your criteria.</p>
            </div>`;
        return;
    }

    paginatedGames.forEach((game) => {
        if (!game) return;
        const originalGameIndex = masterGamesList.indexOf(game);
        const platformDisplayNames = getPlatformNames(game, allPlatforms);
        
        const card = document.createElement('div');
        card.className = "bg-slate-800 rounded-lg shadow-xl overflow-hidden flex flex-col transition-all duration-300 ease-in-out hover:shadow-2xl hover:scale-[1.02]";
        
        const coverSrc = game.cover_image_path || '/img/default_cover_dark.png';
        const defaultCoverSrc = globalThis.location.origin + '/img/default_cover_dark.png';

        card.innerHTML = `
            <div class="aspect-[3/4] w-full bg-slate-700">
                <img src="${coverSrc}"
                     alt="Cover for ${game.title || 'No title'}"
                     class="w-full h-full object-cover cover-thumb"
                     onerror="if (this.src !== '${defaultCoverSrc}') { this.src='${defaultCoverSrc}'; } else { this.onerror=null; }">
            </div>
            <div class="p-4 flex flex-col flex-grow">
                <h3 class="text-lg font-semibold text-orange-400 truncate mb-1" title="${game.title || ''}">${game.title || 'No title'}</h3>
                <p class="text-xs text-slate-400 mb-2 truncate" title="${platformDisplayNames || ''}">${platformDisplayNames || 'No platforms'}</p>
                <p class="text-sm text-slate-300 flex-grow mb-3 text-ellipsis overflow-hidden line-clamp-3" style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical;">
                    ${game.description || 'No description available.'}
                </p>
                <div class="mt-auto pt-3 border-t border-slate-700/50 flex justify-end space-x-2">
                    <button class="p-2 rounded-full text-green-400 hover:bg-slate-700 hover:text-green-300 transition-colors play-game-btn" data-original-index="${originalGameIndex}" title="Play">
                        <i class="material-icons">play_arrow</i>
                    </button>
                    <button class="p-2 rounded-full text-sky-400 hover:bg-slate-700 hover:text-sky-300 transition-colors edit-game-btn" data-original-index="${originalGameIndex}" title="Edit">
                        <i class="material-icons">edit</i>
                    </button>
                    <button class="p-2 rounded-full text-red-400 hover:bg-slate-700 hover:text-red-300 transition-colors delete-game-btn" data-original-index="${originalGameIndex}" title="Delete">
                        <i class="material-icons">delete</i>
                    </button>
                </div>
            </div>
        `;

        // Attach event listeners
        const playBtn = card.querySelector('.play-game-btn');
        if (playBtn && typeof onPlay === 'function') playBtn.onclick = () => onPlay(originalGameIndex);
        
        const editBtn = card.querySelector('.edit-game-btn');
        if (editBtn && typeof onEdit === 'function') editBtn.onclick = () => onEdit(originalGameIndex);

        const deleteBtn = card.querySelector('.delete-game-btn');
        if (deleteBtn && typeof onDelete === 'function') deleteBtn.onclick = () => onDelete(originalGameIndex);
        
        gridContainer.appendChild(card);
    });
}

// renderPlatformFilter remains largely the same, ensure it styles options for dark theme if needed.
export function renderPlatformFilter(selectElement, platforms, currentFilterValue) {
    if (!selectElement) return;
    let platformOptionsHtml = '';
    if (Array.isArray(platforms)) {
        platformOptionsHtml = platforms
            .map(p => {
                const id = p && p.id !== undefined ? p.id : '';
                const name = p && p.name !== undefined ? p.name : 'Unnamed Platform';
                // Add class for styling options if needed, e.g., bg-slate-700 text-slate-200
                return `<option value="${id}" class="bg-slate-700 text-slate-200">${name}</option>`;
            })
            .join('');
    }
    // Ensure "All Platforms" also has dark theme styling
    selectElement.innerHTML = '<option value="" class="text-gray-400 bg-slate-700">All Platforms</option>' + platformOptionsHtml;
    selectElement.value = currentFilterValue || "";
}

// updatePaginationControls remains largely the same.
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
    nav.className = 'flex items-center justify-between border-t border-slate-700 bg-slate-800 px-4 py-3 sm:px-6 rounded-b-lg'; // Can be styled further if needed

    const createButton = (text, page, isDisabled) => {
        const btn = document.createElement('button');
        btn.className = `relative inline-flex items-center rounded-md border border-slate-600 bg-slate-700 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-600 ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''} transition-colors`;
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
    summaryText.className = 'text-sm text-slate-400';
    const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalFilteredItems);
    const endItem = Math.min(currentPage * itemsPerPage, totalFilteredItems);
    summaryText.innerHTML = `Showing <span class="font-medium text-slate-200">${startItem}</span> to <span class="font-medium text-slate-200">${endItem}</span> of <span class="font-medium text-slate-200">${totalFilteredItems}</span> results`;
    
    summaryWrapper.appendChild(summaryText);
    summaryWrapper.appendChild(prevNextWrapper.cloneNode(true)); // Clone for sm+ screens layout
            
    const mobilePrevNextWrapper = prevNextWrapper; // Use original for mobile
    mobilePrevNextWrapper.classList.add('sm:hidden');
    mobilePrevNextWrapper.classList.remove('sm:justify-end');


    nav.appendChild(summaryWrapper); 
    nav.appendChild(mobilePrevNextWrapper);          
    paginationContainer.appendChild(nav);
}

// updateSortIcons will now target the new buttons in the filter bar.
export function updateSortIcons(sortField, sortAsc) {
    const titleIcon = document.getElementById('sortTitleIcon');
    const platformIcon = document.getElementById('sortPlatformIcon');
    
    // Reset both icons first
    if (titleIcon) titleIcon.textContent = 'unfold_more';
    if (platformIcon) platformIcon.textContent = 'unfold_more';

    // Set the active one
    if (sortField === 'title' && titleIcon) {
        titleIcon.textContent = sortAsc ? 'arrow_drop_up' : 'arrow_drop_down';
    } else if (sortField === 'platforms' && platformIcon) {
        platformIcon.textContent = sortAsc ? 'arrow_drop_up' : 'arrow_drop_down';
    }
}

