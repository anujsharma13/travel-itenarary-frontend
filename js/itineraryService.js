class ItineraryService {
    constructor() {
        this.baseUrl = 'http://localhost:8080'; 
        this.apiEndpoint = '/api/itineraries';
    }

    getAuthToken() {
        return localStorage.getItem('authToken');
    }

    async saveItinerary(itineraryData, userId) {
        const authToken = this.getAuthToken();
        
        if (!authToken) {
            throw new Error('Authentication token not found. Please log in again.');
        }

        if (!userId) {
            throw new Error('User ID is required');
        }

        if (!itineraryData.destination || !itineraryData.fullItinerary) {
            throw new Error('Destination and full itinerary are required');
        }

        const url = `${this.baseUrl}${this.apiEndpoint}?userId=${encodeURIComponent(userId)}`;
        
        const requestBody = {
            destination: itineraryData.destination,
            fullItinerary: itineraryData.fullItinerary,
            startDate: itineraryData.startDate || null,
            endDate: itineraryData.endDate || null,
            numberOfDays: itineraryData.numberOfDays || null,
            budgetRange: itineraryData.budgetRange || null,
            travelStyle: itineraryData.travelStyle || null
        };

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
            }

            const responseData = await response.json();
            console.log('Itinerary saved successfully:', responseData);
            return responseData;

        } catch (error) {
            console.error('Error saving itinerary:', error);
            throw error;
        }
    }

    async getUserItineraries(userId) {
        const authToken = this.getAuthToken();
        
        if (!authToken) {
            throw new Error('Authentication token not found. Please log in again.');
        }

        if (!userId) {
            throw new Error('User ID is required');
        }

        const url = `${this.baseUrl}${this.apiEndpoint}?userId=${encodeURIComponent(userId)}`;
        
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => null);
                throw new Error(errorData?.message || `HTTP error! status: ${response.status}`);
            }

            const responseData = await response.json();
            return responseData;

        } catch (error) {
            console.error('Error fetching user itineraries:', error);
            throw error;
        }
    }
}

const itineraryService = new ItineraryService();

async function saveUserItinerary(destination, fullItinerary, options = {}) {
    try {
        const userId = localStorage.getItem('userId');
        
        if (!userId) {
            throw new Error('User not logged in');
        }

        const itineraryData = {
            destination,
            fullItinerary,
            startDate: options.startDate,
            endDate: options.endDate,
            numberOfDays: options.numberOfDays,
            budgetRange: options.budgetRange,
            travelStyle: options.travelStyle
        };

        const result = await itineraryService.saveItinerary(itineraryData, userId);
        
        showNotification('Itinerary saved to your search history!', 'success');
        
        return result;
    } catch (error) {
        console.error('Failed to save itinerary:', error);
        showNotification(`Failed to save itinerary: ${error.message}`, 'error');
        throw error;
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        border-radius: 4px;
        color: white;
        font-weight: bold;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.3s ease;
        background-color: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
    `;

    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '1';
    }, 100);

    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ItineraryService, itineraryService, saveUserItinerary };
} 