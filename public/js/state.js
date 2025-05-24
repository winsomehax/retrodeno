// Simple state management for RetroNode
export class RetroNodeState {
  constructor() {
    this.state = {
      games: [], // Should be an array of game objects
      platforms: [], // Should be an array of platform objects
      currentPage: 1,
      itemsPerPage: 100, // Increased default items per page
      totalItems: 0,
      isLoading: false,
      searchTerm: '',
      platformFilter: '',
      sortField: 'title',
      sortAsc: true,
      error: null
    };
    
    this.listeners = new Set();
  }

  // Subscribe to state changes
  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Update state and notify listeners
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
  }

  // Notify all listeners of state change
  notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }

  // Getters for common state values
  get games() { return this.state.games; }
  get platforms() { return this.state.platforms; }
  get isLoading() { return this.state.isLoading; }
  get error() { return this.state.error; }

  // Actions
  async loadGames() {
    try {
      this.setState({ isLoading: true, error: null });
      
      const params = new URLSearchParams({
        page: this.state.currentPage,
        limit: this.state.itemsPerPage,
        search: this.state.searchTerm,
        platform: this.state.platformFilter,
        sort: this.state.sortField,
        order: this.state.sortAsc ? 'asc' : 'desc'
      });

      const response = await fetch('/api/games?' + params);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to load games');
      }

      // Ensure each game object uses its primary key (e.g., _id from MongoDB) as its 'id' property.
      // This prioritizes `game._id`. If `_id` doesn't exist, it falls back to `game.id`.
      const gamesWithProperId = data.data.map(game => ({
        ...game,
        id: game._id || game.id 
      }));

      this.setState({
        games: gamesWithProperId,
        totalItems: data.pagination.total,
        isLoading: false
      });
    } catch (err) {
      this.setState({
        error: err.message,
        isLoading: false
      });
    }
  }

  async loadPlatforms() {
    try {
      this.setState({ isLoading: true, error: null });
      const response = await fetch('/api/platforms');

      if (!response.ok) {
        const errorBodyText = await response.text();
        let errorDetail = errorBodyText;
        // Try to parse the error response as JSON, as APIs often return error details this way.
        try {
          const errorJson = JSON.parse(errorBodyText);
          errorDetail = errorJson.message || errorJson.error || errorBodyText;
        } catch (parseError) {
          // If parsing as JSON fails, use the raw text as the error detail.
          console.log("Parsing error: ", parseError)
        }
        throw new Error(`Failed to load platforms. Status: ${response.status} ${response.statusText}. Details: ${errorDetail}`);
      }

      const rawDataFromApi = await response.json(); // Renamed for clarity

      let platformsToSet = []; // Initialize as empty array
      // Get the relevant part (object or array), preferring rawDataFromApi.data if it exists
      const platformData = rawDataFromApi && rawDataFromApi.data ? rawDataFromApi.data : rawDataFromApi; // Get the relevant part (object or array)

      if (Array.isArray(platformData)) {
          // Case 1: API returned an array directly or under 'data'
          platformsToSet = platformData;
      } else if (platformData && typeof platformData === 'object') {
          // Case 2: API returned an object of platforms (keyed by ID)
          // Convert the object entries into an array, adding the key as the 'id' property
          platformsToSet = Object.entries(platformData).map(([id, platformObj]) => ({
            ...platformObj,
            id: id // Add the key (e.g., "c64") as the 'id' property
          }));
      } else {
          // Case 3: Unexpected format
          console.warn('[RetroNodeState] loadPlatforms: API response for platforms is not in an expected array or object format. Setting platforms to empty array. Received:', rawDataFromApi);
        platformsToSet = []; // Default to empty array if structure is unexpected or error occurs
      }
      
      this.setState({ platforms: platformsToSet, isLoading: false });

    } catch (err) {
      console.error('[RetroNodeState] loadPlatforms: Error loading platforms:', err);
      this.setState({ error: err.message, platforms: [], isLoading: false }); // Ensure platforms is an array on error
    }
  }

  setPage(page) {
    this.setState({ currentPage: page });
    this.loadGames();
  }

  setSearch(term) {
    this.setState({
      // Note: setState is called here, so your "fsdfiu" log *should* appear if setSearch is called.
      searchTerm: term,
      currentPage: 1
    });
    this.loadGames();
  }

  setPlatformFilter(platform) {
    this.setState({
      // Note: setState is called here.
      platformFilter: platform,
      currentPage: 1
    });
    this.loadGames();
  }

  setSort(field) {
    const sortAsc = field === this.state.sortField ? !this.state.sortAsc : true;
    this.setState({
      // Note: setState is called here.
      sortField: field,
      sortAsc,
      currentPage: 1
    });
    this.loadGames();
  }

  // Error handling
  clearError() {
    this.setState({ error: null });
  }
}

// Create a single instance for the application
const retroNodeState = new RetroNodeState();
export default retroNodeState;
