import { sendAchievementUpdate } from './shared-api.js';

// Function to track user actions and update achievements
export function trackUserAction(actionType) {
    const userId = localStorage.getItem('userId');

    // Proceed only if a user ID is available
    if (userId) {
        console.log(`🚀 Tracking action: '${actionType}' for userId: ${userId}`);

        // Call the shared API function to send the update
        sendAchievementUpdate(userId, actionType)
            .then(response => {
                // Check if the API call was successful
                if (response.success) {
                    console.log(`✅ Achievement progress updated successfully for action: ${actionType}`);
                    
                    // Dispatch a custom event to notify other parts of the app
                    const event = new CustomEvent('achievement-progress-updated', {
                        detail: { actionType }
                    });
                    document.dispatchEvent(event);
                    console.log('🚀 Dispatched "achievement-progress-updated" event.');

                } else {
                    // Handle cases where the API returns an error
                    console.error(`❌ Failed to update achievement progress: ${response.data?.message || 'Unknown error'}`);
                }
            })
            .catch(error => {
                // Handle network errors or other exceptions
                console.error('🔥 Critical error while sending achievement update:', error);
            });
    } else {
        // Log a warning if no user ID is found
        console.warn(`⚠️ Cannot track action '${actionType}' because user is not logged in.`);
    }
}
