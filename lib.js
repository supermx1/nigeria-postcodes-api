// nigeria-locations.js
import axios from 'axios';

class NigeriaLocations {
    constructor(baseUrl = 'https://nigeria-postcodes.pages.dev') {
        this.baseUrl = baseUrl;
        this.data = null;
        this.isReady = false;

        // Fetch data immediately
        this.initializeData();
    }

    async initializeData() {
        try {
            const response = await axios.get(`${this.baseUrl}/states`);
            this.data = response.data;
            this.isReady = true;
        } catch (error) {
            console.error('Failed to initialize Nigeria Locations data:', error);
            throw error;
        }
    }

    // Individual functions
    getAllStates() {
        if (!this.isReady) throw new Error('Data not yet loaded');
        return this.data.states.sort();
    }

    getLGAsInState(stateName) {
        if (!this.isReady) throw new Error('Data not yet loaded');
        return (this.data.details[stateName]?.lgas || []).sort();
    }

    getDistrictsInLGA(stateName, lgaName) {
        if (!this.isReady) throw new Error('Data not yet loaded');
        return (this.data.details[stateName]?.details[lgaName]?.districts || []).sort();
    }

    getPostalCodes(stateName, lgaName, districtName) {
        if (!this.isReady) throw new Error('Data not yet loaded');
        return (this.data.details[stateName]?.details[lgaName]?.details[districtName]?.postal_codes || []).sort((a, b) => a - b);
    }

    getLocalities(stateName, lgaName, districtName) {
        if (!this.isReady) throw new Error('Data not yet loaded');
        return (this.data.details[stateName]?.details[lgaName]?.details[districtName]?.localities || []).sort();
    }

    async getPostcodeDetails(postcode) {
        try {
            const response = await axios.get(`${this.baseUrl}/postcode/${postcode}`);
            return response.data;
        } catch (error) {
            console.error(`Failed to fetch details for postcode ${postcode}:`, error);
            throw error;
        }
    }

    // Chainable methods
    state(stateName) {
        return new ChainableQuery(this, stateName);
    }

    // Method to check if data is loaded
    isInitialized() {
        return this.isReady;
    }

    // Method to wait for initialization
    async waitForInitialization() {
        if (this.isReady) return;

        // Poll until data is ready
        while (!this.isReady) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
}

class ChainableQuery {
    constructor(nigeriaLocations, stateName = null, lgaName = null, districtName = null) {
        this.nigeriaLocations = nigeriaLocations;
        this.stateName = stateName;
        this.lgaName = lgaName;
        this.districtName = districtName;
    }

    lga(lgaName) {
        return new ChainableQuery(this.nigeriaLocations, this.stateName, lgaName);
    }

    district(districtName) {
        return new ChainableQuery(this.nigeriaLocations, this.stateName, this.lgaName, districtName);
    }

    get() {
        if (!this.stateName) {
            return this.nigeriaLocations.getAllStates();
        }
        if (!this.lgaName) {
            return this.nigeriaLocations.getLGAsInState(this.stateName);
        }
        if (!this.districtName) {
            return this.nigeriaLocations.getDistrictsInLGA(this.stateName, this.lgaName);
        }
        return {
            postal_codes: this.nigeriaLocations.getPostalCodes(this.stateName, this.lgaName, this.districtName),
            localities: this.nigeriaLocations.getLocalities(this.stateName, this.lgaName, this.districtName)
        };
    }
}

// Create singleton instance
const nigeriaLocations = new NigeriaLocations();

// Export both class and singleton instance
export { NigeriaLocations, nigeriaLocations as default };