// Assuming showAppToast, openModal, closeModal, showLoadingOverlay are globally available
// or passed in. For simplicity, we'll rely on them being global here.
// Import retroNodeState for platform list and TheGamesDB platform mapping
import retroNodeState from './state.js'; 
import { showToastAndLog } from './gameUtils.js';


export function openGameDialog(mode, game = {}, originalIndex = null, onFormSubmitCallback) {
    if (!globalThis.openModal || !globalThis.closeModal || !globalThis.showLoadingOverlay) {
        console.error("Modal or Loading Overlay functions not found globally.");
        return;
    }

    document.getElementById('crudDialogTitle').textContent = mode === 'edit' ? 'Edit Game' : 'Add Game';
    const form = document.getElementById('crudForm');
    form.innerHTML = ''; // Clear previous form content

    let platformOptions = '';
    if (Array.isArray(retroNodeState.state.platforms)) {
        platformOptions = retroNodeState.state.platforms.map(p_obj => {
            const platformId = p_obj.id;
            const platformName = p_obj.name;
            // Use Object.prototype.hasOwnProperty.call for safer property checking
            const isSelected = game.platforms && typeof game.platforms === 'object' && Object.prototype.hasOwnProperty.call(game.platforms, platformId);
            return `<option value="${platformId}" ${isSelected ? 'selected' : ''}>${platformName}</option>`;
        }).join('');
    }
    
    form.innerHTML = `
        <div>
            <label for="gameTitle" class="block text-sm font-medium text-gray-700">Title</label>
            <input id="gameTitle" type="text" value="${game.title || ''}" required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
        </div>
        <div>
            <label for="gameDescription" class="block text-sm font-medium text-gray-700">Description</label>
            <textarea id="gameDescription" rows="3" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">${game.description || ''}</textarea>
        </div>
        <div>
            <label for="gameCover" class="block text-sm font-medium text-gray-700">Cover Image URL</label>
            <input id="gameCover" type="url" value="${game.cover_image_path || ''}" class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
        </div>
        <div>
            <label for="gamePlatforms" class="block text-sm font-medium text-gray-700">Platforms</label>
            <select id="gamePlatforms" multiple class="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md h-32">
                ${platformOptions}
            </select>
        </div>
        <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            <button id="askAiBtnDialog" type="button" class="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-400">
                <i class="material-icons mr-2 -ml-1">smart_toy</i>Ask AI
            </button>
            <button id="igdbDialogImportBtnDialog" type="button" class="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400">
                <i class="material-icons mr-2 -ml-1">image_search</i>IGDB
            </button>
            <button id="theGamesDBDialogImportBtnDialog" type="button" class="w-full sm:col-span-2 lg:col-span-1 flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400">
                <i class="material-icons mr-2 -ml-1">storage</i>TheGamesDB
            </button>
        </div>
        <div id="igdbInlineResultsDialog" class="mt-4 space-y-2"></div>
        <div id="theGamesDBInlineResultsDialog" class="mt-4 space-y-2"></div>
    `;
    
    const saveBtn = document.getElementById('crudFormSubmit');
    if (saveBtn) {
        const newBtn = saveBtn.cloneNode(true); 
        saveBtn.parentNode.replaceChild(newBtn, saveBtn);
        newBtn.onclick = function(e) {
            e.preventDefault();
            if (typeof onFormSubmitCallback === 'function') {
                onFormSubmitCallback(mode, originalIndex);
            }
        };
    }

    globalThis.openModal('crudDialog');

    // Attach handlers for buttons inside the dialog
    // Use setTimeout to ensure elements are in DOM if openModal is async or has transitions
    setTimeout(() => {
        attachAskAiHandler();
        attachIgdbSearchHandler();
        initializeTheGamesDBSearchInDialog();
    }, 0); 
}

function attachAskAiHandler() {
    const askAiBtn = document.getElementById('askAiBtnDialog');
    if (askAiBtn) {
        askAiBtn.onclick = async function() {
            const title = document.getElementById('gameTitle').value.trim();
            if (!title) { showToastAndLog('Enter a game title first!', 'warn'); return; }
            askAiBtn.disabled = true;
            askAiBtn.innerHTML = '<span class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span> Asking...';
            try {
                const resp = await fetch('/api/ai/game-info?title=' + encodeURIComponent(title));
                const data = await resp.json();
                if (data && data.description) {
                    document.getElementById('gameDescription').value = data.description;
                    showToastAndLog('AI description filled!', 'success');
                } else {
                    showToastAndLog('No info found from AI.', 'info');
                }
            } catch (e) {
                showToastAndLog('AI request failed: ' + e.message, 'error');
            }
            askAiBtn.disabled = false;
            askAiBtn.innerHTML = '<i class="material-icons mr-2 -ml-1">smart_toy</i>Ask AI';
        };
    }
}

function attachIgdbSearchHandler() {
    const igdbDialogBtn = document.getElementById('igdbDialogImportBtnDialog');
    if (igdbDialogBtn) {
        igdbDialogBtn.onclick = async function() {
            const title = document.getElementById('gameTitle').value.trim();
            if (!title) { showToastAndLog('Enter a game title first!', 'warn'); return; }
            igdbDialogBtn.disabled = true;
            igdbDialogBtn.innerHTML = '<span class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span> Searching IGDB...';
            const resultsDiv = document.getElementById('igdbInlineResultsDialog');
            resultsDiv.innerHTML = '<div class="text-center py-2"><div class="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div></div>';
            try {
                const igdbResp = await fetch('/api/igdb/game', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ title })
                });
                const igdbData = await igdbResp.json();

                resultsDiv.innerHTML = ''; 
                if (igdbData && igdbData.results && igdbData.results.length) {
                    igdbData.results.slice(0,3).forEach((game, idx) => {
                        const images = [];
                        if (game.cover && game.cover.url) images.push({url: 'https:' + game.cover.url, type: 'cover'});
                        (game.screenshots || []).forEach(s => images.push({url: 'https:' + s.url, type: 'screenshot'}));
                        
                        const imageOptions = images.slice(0,3).map((img, i) => 
                            `<label class='mr-2 cursor-pointer inline-block relative'>
                                <input type='radio' name='igdbCoverDialog${idx}' value='${img.url}' ${i===0?'checked':''} class='sr-only peer'>
                                <img src='${img.url}' data-full='${img.url.replace("t_thumb","t_1080p")}' class='igdb-cover-thumb-dialog w-12 h-12 object-cover rounded border-2 border-gray-300 peer-checked:border-blue-500 peer-checked:ring-2 peer-checked:ring-blue-500 transition-all' style='margin-bottom:2px;'>
                                <span class='block text-xs text-center text-gray-500'>${img.type}</span>
                                <span class='hidden peer-checked:block absolute top-0.5 right-0.5 bg-blue-500 text-white rounded-full w-4 h-4 text-xs leading-4 text-center'>✓</span>
                            </label>`
                        ).join('');

                        const rating = game.rating ? `<span class='text-sm text-gray-600'>Rating: ${game.rating.toFixed(1)}</span>` : '';
                        const summary = game.summary ? `<div class='text-sm text-gray-700 mt-1 max-h-20 overflow-y-auto'>${game.summary.substring(0, 180)}${game.summary.length > 180 ? '...' : ''}</div>` : '';
                        const video = (game.videos && game.videos[0]) ? `<a href='https://youtube.com/watch?v=${game.videos[0].video_id}' target='_blank' class="text-blue-500 hover:text-blue-700">🎬</a>` : '';
                        
                        resultsDiv.innerHTML += `
                            <div class='border border-gray-200 p-3 rounded-md shadow-sm'>
                                <div class='flex items-start gap-3'>
                                    <div class='flex-shrink-0'>
                                        <div class='igdb-image-options-dialog flex flex-wrap gap-1' data-idx='${idx}'>${imageOptions || '<span class="text-xs text-gray-400">No images</span>'}</div>
                                    </div>
                                    <div class='flex-grow'>
                                        <h4 class='font-semibold text-gray-800'>${game.name} ${rating} ${video}</h4>
                                        ${summary}
                                    </div>
                                    <button class='flex-shrink-0 self-start px-3 py-1.5 text-xs font-medium text-white bg-blue-500 hover:bg-blue-600 rounded shadow-sm igdb-import-btn-dialog' data-idx='${idx}'>Import</button>
                                </div>
                                <div class='mt-2 text-xs space-x-2'>
                                    <label class="inline-flex items-center"><input type='checkbox' class='igdb-field-dialog rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-1' data-field='cover' checked> Cover</label>
                                    <label class="inline-flex items-center"><input type='checkbox' class='igdb-field-dialog rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-1' data-field='name' checked> Title</label>
                                    <label class="inline-flex items-center"><input type='checkbox' class='igdb-field-dialog rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-1' data-field='summary' checked> Summary</label>
                                    <label class="inline-flex items-center"><input type='checkbox' class='igdb-field-dialog rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 mr-1' data-field='rating' ${game.rating ? 'checked' : 'disabled'}> Rating</label>
                                </div>
                            </div>
                        `;
                    });

                    resultsDiv.querySelectorAll('.igdb-import-btn-dialog').forEach(btn2 => {
                        btn2.onclick = function() {
                            const idx2 = parseInt(btn2.getAttribute('data-idx'));
                            const game2 = igdbData.results[idx2];
                            const card = btn2.closest('.border');
                            const fields = Array.from(card.querySelectorAll('.igdb-field-dialog:checked')).map(cb=>cb.getAttribute('data-field'));
                            
                            let coverUrl = '';
                            const selectedImgRadio = card.querySelector(`.igdb-image-options-dialog input[type='radio']:checked`);
                            if (selectedImgRadio) coverUrl = selectedImgRadio.value;

                            if (fields.includes('cover') && coverUrl) document.getElementById('gameCover').value = coverUrl;
                            if (fields.includes('name')) document.getElementById('gameTitle').value = game2.name;
                            if (fields.includes('summary')) document.getElementById('gameDescription').value = game2.summary || '';
                            if (fields.includes('rating') && game2.rating) {
                                const currentDesc = document.getElementById('gameDescription').value;
                                document.getElementById('gameDescription').value = (currentDesc ? currentDesc + "\n" : "") + `Rating: ${game2.rating.toFixed(1)}`;
                            }
                            resultsDiv.innerHTML = ''; 
                            showToastAndLog(`Imported ${game2.name} from IGDB`, 'success');
                        };
                    });
                    // Add image preview for these new inline results
                    resultsDiv.querySelectorAll('.igdb-cover-thumb-dialog').forEach(img => {
                        img.addEventListener('mouseenter', handleDialogImagePreviewEnter);
                        img.addEventListener('mouseleave', handleDialogImagePreviewLeave);
                    });

                } else {
                    resultsDiv.innerHTML = '<div class="p-3 bg-yellow-100 text-yellow-700 rounded-md text-sm">No IGDB results found.</div>';
                }
            } catch (e) {
                console.error("Error fetching/rendering IGDB data in dialog:", e);
                resultsDiv.innerHTML = `<div class="p-3 bg-red-100 text-red-700 rounded-md text-sm">Error fetching IGDB data: ${e.message}</div>`;
            }
            igdbDialogBtn.disabled = false;
            igdbDialogBtn.innerHTML = '<i class="material-icons mr-2 -ml-1">image_search</i>IGDB';
        };
    }
}

function handleDialogImagePreviewEnter(e) {
    let previewImg = document.getElementById('coverPreviewImgDialog');
    if (!previewImg) {
        previewImg = document.createElement('img');
        previewImg.id = 'coverPreviewImgDialog';
        previewImg.className = 'fixed z-[10001] hidden max-w-xs max-h-[70vh] shadow-2xl rounded-lg bg-white p-1 border border-gray-300 pointer-events-none'; // Higher z-index for dialog
        document.body.appendChild(previewImg);
    }
    previewImg.src = this.getAttribute('data-full') || this.src;
    previewImg.classList.remove('hidden');
    
    const move = ev => {
        let x = ev.clientX + 20;
        let y = ev.clientY - previewImg.offsetHeight / 2;
        if (x + previewImg.offsetWidth > globalThis.innerWidth - 10) x = ev.clientX - previewImg.offsetWidth - 20;
        if (y + previewImg.offsetHeight > globalThis.innerHeight - 10) y = globalThis.innerHeight - previewImg.offsetHeight - 10;
        if (y < 10) y = 10;
        previewImg.style.left = x + 'px';
        previewImg.style.top = y + 'px';
    };
    move(e);
    this._moveHandlerDialog = move;
    globalThis.addEventListener('mousemove', this._moveHandlerDialog);
}

function handleDialogImagePreviewLeave() {
    const previewImg = document.getElementById('coverPreviewImgDialog');
    if (previewImg) previewImg.classList.add('hidden');
    if(this._moveHandlerDialog) globalThis.removeEventListener('mousemove', this._moveHandlerDialog);
}


// --- TheGamesDB Search Functionality (for Dialog) ---
function initializeTheGamesDBSearchInDialog() {
    const theGamesDBDialogButton = document.getElementById('theGamesDBDialogImportBtnDialog');
    if (theGamesDBDialogButton) {
        theGamesDBDialogButton.addEventListener('click', handleTheGamesDBSearchInDialog);
    }
}

async function handleTheGamesDBSearchInDialog() {
    const gameTitleInput = document.getElementById('gameTitle'); 
    const resultsContainer = document.getElementById('theGamesDBInlineResultsDialog');
    const searchButton = document.getElementById('theGamesDBDialogImportBtnDialog');

    if (!gameTitleInput || !resultsContainer || !searchButton) {
        showToastAndLog('Required elements for TheGamesDB search are missing.', 'error');
        return;
    }
    const gameTitle = gameTitleInput.value.trim();
    if (!gameTitle) {
        showToastAndLog('Please enter a game title to search TheGamesDB.', 'warn');
        return;
    }

    searchButton.disabled = true;
    searchButton.innerHTML = '<span class="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></span> Searching...';
    resultsContainer.innerHTML = '<div class="text-center py-2"><div class="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-green-500"></div></div>';

    try {
        const response = await fetch(`/api/thegamesdb/search?name=${encodeURIComponent(gameTitle)}`);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `Request failed with status ${response.status}` }));
            throw new Error(errorData.message || `TheGamesDB API request failed`);
        }
        const data = await response.json();
        if (!data.success) throw new Error(data.message || 'Failed to fetch from TheGamesDB.');
        displayTheGamesDBResultsInDialog(data.results, resultsContainer);
    } catch (error) {
        console.error('Error searching TheGamesDB (dialog):', error);
        resultsContainer.innerHTML = `<div class="p-3 bg-red-100 text-red-700 rounded-md text-sm">Error: ${error.message}</div>`;
    } finally {
        searchButton.disabled = false;
        searchButton.innerHTML = '<i class="material-icons mr-2 -ml-1">storage</i>TheGamesDB';
    }
}

function displayTheGamesDBResultsInDialog(games, containerElement) {
    if (!games || games.length === 0) {
        containerElement.innerHTML = '<div class="p-3 bg-yellow-100 text-yellow-700 rounded-md text-sm">No results found on TheGamesDB.</div>';
        return;
    }
    let resultsHTML = '<h6 class="text-sm font-semibold text-gray-700 mb-2">TheGamesDB Results:</h6>';
    games.slice(0, 3).forEach((game, index) => {
        const displayThumbnailUrl = game.boxart_thumb_url || game.boxart_large_url || '/img/default-cover.png';
        const releaseDateDisplay = game.release_date ? new Date(game.release_date).toLocaleDateString() : 'N/A';
        let platformDisplayName = 'N/A';
        if (game.platform && Array.isArray(retroNodeState.state.platforms)) {
            const matchedPlatform = retroNodeState.state.platforms.find(p => p.thegamesdb_id === parseInt(game.platform, 10));
            platformDisplayName = matchedPlatform ? matchedPlatform.name : `ID: ${game.platform}`;
        } else if (game.platform) {
            platformDisplayName = `ID: ${game.platform}`; 
        }
        resultsHTML += `
            <div class="border border-gray-200 p-3 rounded-md shadow-sm mb-2">
                <div class="flex items-start gap-3">
                    <img src="${displayThumbnailUrl}" alt="${game.game_title || 'Cover'}" class="w-12 h-16 object-cover rounded border bg-gray-100">
                    <div class="flex-grow">
                        <strong class="text-sm text-gray-800">${game.game_title || 'N/A'}</strong><br>
                        <small class="text-xs text-gray-500">Platform: ${platformDisplayName} | Released: ${releaseDateDisplay}</small>
                        ${game.overview ? `<p class="text-xs text-gray-600 mt-1 max-h-12 overflow-hidden">${game.overview.substring(0,100)}...</p>` : ''}
                    </div>
                    <button class="flex-shrink-0 self-start px-3 py-1.5 text-xs font-medium text-white bg-green-500 hover:bg-green-600 rounded shadow-sm import-tgdb-dialog-btn" data-game-index="${index}" type="button">Import</button>
                </div>
            </div>
        `;
    });
    containerElement.innerHTML = resultsHTML;
    containerElement.querySelectorAll('.import-tgdb-dialog-btn').forEach(button => {
        button.addEventListener('click', (event) => {
            const gameIndex = parseInt(event.target.getAttribute('data-game-index'), 10);
            const selectedGame = games[gameIndex];
            if (selectedGame) {
                populateDialogFormWithTheGamesDBData(selectedGame);
                containerElement.innerHTML = ''; 
            }
        });
    });
}

function populateDialogFormWithTheGamesDBData(gameData) {
    const titleField = document.getElementById('gameTitle');
    const descriptionField = document.getElementById('gameDescription');
    const coverField = document.getElementById('gameCover');
    const platformSelectElement = document.getElementById('gamePlatforms');

    if (titleField && gameData.game_title) titleField.value = gameData.game_title;
    if (descriptionField && gameData.overview) descriptionField.value = gameData.overview;
    if (coverField) coverField.value = gameData.boxart_large_url || ''; 
    if (gameData.platform && platformSelectElement && Array.isArray(retroNodeState.state.platforms)) {
        const tgdbPlatformId = parseInt(gameData.platform, 10);
        const matchedPlatform = retroNodeState.state.platforms.find(p => p.thegamesdb_id === tgdbPlatformId);
        if (matchedPlatform && matchedPlatform.id) {
            const optionToSelect = Array.from(platformSelectElement.options).find(opt => opt.value === matchedPlatform.id);
            if (optionToSelect) optionToSelect.selected = true;
        }
    }
    showToastAndLog(`Imported "${gameData.game_title}" from TheGamesDB. Review and save.`, 'success');
}
// --- End of TheGamesDB Search Functionality (for Dialog) ---
