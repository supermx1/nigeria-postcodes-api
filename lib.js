// nigeria-locations.js
import axios from 'axios';

class NigeriaLocations {
    constructor(baseUrl = 'https://nigeria-postcodes.pages.dev') {
        this.baseUrl = baseUrl;
        this.currentState = null;
        this.currentLGA = null;
        this.currentDistrict = null;
        this.data = null;
    }

    // Helper method to fetch and cache states data
    async fetchStatesData() {
        if (!this.data) {
            const response = await axios.get(`${this.baseUrl}/states`);
            this.data = response.data;
        }
        return this.data;
    }

    // Individual functions
    async getAllStates() {
        const data = await this.fetchStatesData();
        return data.states;
    }

    async getLGAsInState(stateName) {
        const data = await this.fetchStatesData();
        return data.details[stateName]?.lgas || [];
    }

    async getDistrictsInLGA(stateName, lgaName) {
        const data = await this.fetchStatesData();
        return data.details[stateName]?.details[lgaName]?.districts || [];
    }

    async getPostalCodes(stateName, lgaName, districtName) {
        const data = await this.fetchStatesData();
        return data.details[stateName]?.details[lgaName]?.details[districtName]?.postal_codes || [];
    }

    async getPostcodeDetails(postcode) {
        const response = await axios.get(`${this.baseUrl}/postcode/${postcode}`);
        return response.data;
    }

    // Chainable methods
    state(stateName) {
        this.currentState = stateName;
        return this;
    }

    lga(lgaName) {
        this.currentLGA = lgaName;
        return this;
    }

    district(districtName) {
        this.currentDistrict = districtName;
        return this;
    }

    async get() {
        if (!this.currentState) {
            return this.getAllStates();
        }
        if (!this.currentLGA) {
            return this.getLGAsInState(this.currentState);
        }
        if (!this.currentDistrict) {
            return this.getDistrictsInLGA(this.currentState, this.currentLGA);
        }
        return this.getPostalCodes(this.currentState, this.currentLGA, this.currentDistrict);
    }
}

// Create singleton instance
const nigeriaLocations = new NigeriaLocations();

// Export both class and singleton instance
export { NigeriaLocations, nigeriaLocations as default };