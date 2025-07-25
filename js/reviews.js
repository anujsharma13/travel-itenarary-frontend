// Reviews Module
const REVIEW_API = 'http://localhost:8080/api/review';

const reviews = {
    // Load all reviews from backend
    async loadReviews() {
        try {
            const currentUser = auth.getCurrentUser();
            const token = auth.getToken();
            const response = await auth.request(REVIEW_API, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'username': currentUser?.userName || ''
                }
            });
            
            if (!response.ok) {
                throw new Error('Failed to load reviews');
            }
            
            const data = await response.json();
            this.displayReviews(data.data || data);
        } catch (error) {
            console.error('Error loading reviews:', error);
            this.displayError('Failed to load reviews. Please try again later.');
        }
    },

    // Submit a new review
    async submitReview(reviewData) {
        try {
            const currentUser = auth.getCurrentUser();
            const token = auth.getToken();
            debugger;
            const response = await auth.request(REVIEW_API, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'username': currentUser?.userName || ''
                },
                body: JSON.stringify(reviewData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'Failed to submit review');
            }
            
            // Show success message
            this.showSuccess('Review submitted successfully!');
            
            // Clear form
            document.getElementById('reviewForm').reset();
            document.getElementById('rating').value = '0';
            this.updateStarRating(0);
            
            // Reload reviews
            this.loadReviews();
            
            return data;
        } catch (error) {
            console.error('Error submitting review:', error);
            throw error;
        }
    },

    // Display reviews in the UI
    displayReviews(reviewsData) {
        const reviewsList = document.getElementById('reviewsList');
        
        if (!reviewsData || reviewsData.length === 0) {
            reviewsList.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-star fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">No reviews yet</h5>
                    <p class="text-muted">Be the first to share your travel experience!</p>
                </div>
            `;
            return;
        }

        const reviewsHTML = reviewsData.map(review => `
            <div class="card review-card">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <div>
                            <h5 class="card-title mb-1">${this.escapeHtml(review.title || 'Travel Review')}</h5>
                            <h6 class="card-subtitle text-muted">
                                <i class="fas fa-map-marker-alt me-1"></i>
                                ${this.escapeHtml(review.destination || 'Unknown')}
                            </h6>
                        </div>
                        <div class="rating-stars">
                            ${this.generateStars(review.rating || 0)}
                        </div>
                    </div>
                    <p class="card-text">${this.escapeHtml(review.comment || review.review || '')}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">
                            <i class="fas fa-user me-1"></i>
                            ${this.escapeHtml(review.reviewerName || review.userName || 'Anonymous')}
                        </small>
                        <small class="text-muted">
                            <i class="fas fa-calendar me-1"></i>
                            ${this.formatDate(review.createdAt || review.date)}
                        </small>
                    </div>
                </div>
            </div>
        `).join('');

        reviewsList.innerHTML = reviewsHTML;
    },

    // Display error message
    displayError(message) {
        const reviewsList = document.getElementById('reviewsList');
        reviewsList.innerHTML = `
            <div class="alert alert-danger text-center">
                <i class="fas fa-exclamation-triangle me-2"></i>
                ${message}
                <button class="btn btn-link btn-sm ms-2" onclick="reviews.loadReviews()">
                    <i class="fas fa-redo me-1"></i>Try Again
                </button>
            </div>
        `;
    },

    // Show success message
    showSuccess(message) {
        // Create success alert
        const alert = document.createElement('div');
        alert.className = 'alert alert-success alert-dismissible fade show position-fixed';
        alert.style.cssText = 'top: 20px; right: 20px; z-index: 1055; min-width: 300px;';
        alert.innerHTML = `
            <i class="fas fa-check-circle me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alert);
        
        // Auto-remove after 3 seconds
        setTimeout(() => {
            if (alert.parentNode) {
                alert.remove();
            }
        }, 3000);
    },

    // Generate star display for ratings
    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let starsHTML = '';
        
        // Full stars
        for (let i = 0; i < fullStars; i++) {
            starsHTML += '<i class="fas fa-star"></i>';
        }
        
        // Half star
        if (hasHalfStar) {
            starsHTML += '<i class="fas fa-star-half-alt"></i>';
        }
        
        // Empty stars
        const emptyStars = 5 - Math.ceil(rating);
        for (let i = 0; i < emptyStars; i++) {
            starsHTML += '<i class="far fa-star"></i>';
        }
        
        return starsHTML;
    },

    // Format date for display
    formatDate(dateString) {
        if (!dateString) return 'Unknown date';
        
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'Unknown date';
        }
    },

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // Update star rating display
    updateStarRating(rating) {
        const stars = document.querySelectorAll('.star-rating .star');
        stars.forEach((star, index) => {
            if (index < rating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication
    if (!auth.isAuthenticated()) {
        window.location.href = 'http://127.0.0.1:5500/html/signin.html';
        return;
    }

    // Update user info in navigation
    const currentUser = auth.getCurrentUser();
    if (currentUser) {
        document.getElementById('userInfo').textContent = `Welcome, ${currentUser.firstName || currentUser.userName}!`;
    }

    // Load reviews
    reviews.loadReviews();

    // Star rating functionality
    const stars = document.querySelectorAll('.star-rating .star');
    const ratingInput = document.getElementById('rating');
    
    stars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = parseInt(star.getAttribute('data-rating'));
            ratingInput.value = rating;
            reviews.updateStarRating(rating);
        });
        
        star.addEventListener('mouseover', () => {
            const rating = parseInt(star.getAttribute('data-rating'));
            reviews.updateStarRating(rating);
        });
    });
    
    // Reset stars on mouse leave
    document.getElementById('starRating').addEventListener('mouseleave', () => {
        const currentRating = parseInt(ratingInput.value) || 0;
        reviews.updateStarRating(currentRating);
    });

    // Review form submission
    document.getElementById('reviewForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const rating = parseInt(document.getElementById('rating').value);
        
        if (rating === 0) {
            alert('Please select a rating');
            return;
        }
        
        const reviewData = {
            destination: formData.get('destination') || document.getElementById('destination').value,
            title: formData.get('title') || document.getElementById('title').value,
            comment: formData.get('comment') || document.getElementById('comment').value,
            rating: rating
        };
        
        // Show loading
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Submitting...';
        
        try {
            await reviews.submitReview(reviewData);
        } catch (error) {
            alert('Failed to submit review: ' + error.message);
        } finally {
            // Hide loading
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });
});

// Global access
window.reviews = reviews; 