// Import the default singleton instance
import API from './nigeria-locations';

// Example 1: Using individual functions
async function example1() {
    // Get all states
    const states = await API.getAllStates();
    console.log('States:', states);

    // Get LGAs in Abia
    const lgas = await API.getLGAsInState('Abia');
    console.log('LGAs in Abia:', lgas);

    // Get districts in Ikwuano LGA
    const districts = await API.getDistrictsInLGA('Abia', 'Ikwuano');
    console.log('Districts in Ikwuano:', districts);

    // Get postal codes for a district
    const postalCodes = await API.getPostalCodes('Abia', 'Ikwuano', 'Umuhu');
    console.log('Postal codes:', postalCodes);

    // Get details for a specific postcode
    const postcodeDetails = await API.getPostcodeDetails('440114');
    console.log('Postcode details:', postcodeDetails);
}

// Example 2: Using chainable methods
async function example2() {
    // Get all states
    const states = await API.get();
    
    // Get LGAs in Abia
    const lgas = await API
        .state('Abia')
        .get();
    
    // Get districts in Ikwuano
    const districts = await API
        .state('Abia')
        .lga('Ikwuano')
        .get();
    
    // Get postal codes
    const postalCodes = await API
        .state('Abia')
        .lga('Ikwuano')
        .district('Umuhu')
        .get();
}

// Example 3: Using with custom base URL
const customLocations = new NigeriaLocations('https://nigeria-postcodes.pages.dev');