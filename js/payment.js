const PAYMENT_API = 'http://localhost:8080/api/payments/process';

class PaymentHandler{
    constructor(){
        this.selectedPaymentMethod = 'pm_card_visa'; // Default payment method
        this.selectedPlan = 'PRO'; // Default plan
        this.init();
    }
    init() {
        this.setEventListeners();
        this.updateSummary();
    }
    setEventListeners() {
    document.querySelectorAll('.payment-method-card ').forEach((input) => {
            input.addEventListener('click', (event) => {
                this.selectedPaymentMethod(event.currentTarget);
            });
        });
    document.querySelectorAll('.subscription-plan-card ').forEach((input) => {
            input.addEventListener('click', (event) => {
                this.selectSubscriptionPlan(event.currentTarget);
            });
        });

    document.getElementById('paymentForm').addEventListener('submit', (event) => {
            event.preventDefault();
            this.processPayment();
        });
    document.getElementById('currency').addEventListener('change', (event) => {
            this.updateSummary();
        });

    }
    selectedPaymentMethod(selectectCard) {
        const paymentMethods = document.querySelectorAll('.payment-method-card');
        paymentMethods.forEach((card) => {
            const checkIcon = card.querySelector('.fa-check-circle');
            if(checkIcon) {
                checkIcon.style.display = 'none';
            }
        });
        selectectCard.classList.add('selected');
        const checkIcon = selectectCard.querySelector('.fa-check-circle') || this.createCheckIcon(selectectCard);
        checkIcon.style.display = 'Inline';
        this.selectedPaymentMethod = selectectCard.dataset.method;
        document.getElementById('paymentMethodId').value = this.selectedPaymentMethod;
        this.updateSummary();
    }
    createCheckIcon(card) {
        const checkIcon = document.createElement('i');
        checkIcon.className = 'fa fa-check-circle text-success ms-auto';
        checkIcon.style.display = '.d-flex';
        card.appendChild(checkIcon);
        return checkIcon;
    }
    selectSubscriptionPlan(selectedCard) {
        const subscriptionPlans = document.querySelectorAll('.subscription-plan-card');
        subscriptionPlans.forEach((card) => {
            card.classList.remove('selected');
        });
        selectedCard.classList.add('selected');
        this.selectedPlan = selectedCard.dataset.plan;
        document.getElementById('selectedPlan').value = this.selectedPlan;

        const planPrice = parseFloat(selectedCard.dataset.price);
        document.getElementById('amount').value = planPrice;
        this.updateSummary();
    }
    updateSummary(){
        const currency = document.getElementById('currency').value;
        const amount = parseFloat(document.getElementById('amount').value);
        const paymentMethodText = getPayementMethodText();

        document.getElementById('summaryMethod').textContent = paymentMethodText;
        document.getElementById('summaryPlan').textContent = this.selectedPlan;
        document.getElementById('summaryAmount').textContent = this.formatCurrency(amount, currency);
        document.getElementById('summaryCurrency').textContent = currency.toUpperCase();
        document.getElementById('summartTotal').textContent = this.formatCurrency(amount, currency);
    }
    getPayementMethodText() {   
        const paymentMethods = {
            pm_card_visa: 'Visa Card',
            pm_card_mastercard: 'MasterCard',
            pm_card_amex: 'American Express',
        };
        return paymentMethods[this.selectedPaymentMethod] || 'Card';
    }
    formatCurrency(amount, currency) {
        const symbols = {
            USD: '$',
            EUR: '€',
            GBP: '£',
            INR: '₹',
        };
        const symbol = symbols[currency.toUpperCase()] || '$';
        return `${symbol}${amount.toFixed(2)}`;
    }
    async processPayment() {
        const formData = new FormData(document.getElementById('paymentForm'));
        const amount = parseFloat(document.getElementById('amount').value);
        const currency = document.getElementById('currency').value;

        if(!amount || !currency) {
            this.showError('Please select a valid amount and currency.');
            return;
        }

        const token = auth.getToken();
        if(!token) {
            this.showError('You must be logged in to make a payment.');
            return;
        }   
        const currentUser = auth.getCurrentUser();
        if(!currentUser) {
            this.showError('You must be logged in to make a payment.');
            return;
        }

        this.showProcessingOverlay();

        try {
            const paymentData = {
                amount: amount,
                currency: currency,
                paymentMethodId: this.selectedPaymentMethod,
                paymentType: "gateway",
                subscriptionPlan: this.selectedPlan,
            };
            const response = await fetch(PAYMENT_API, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'username': currentUser?.userName || ''
                },
                body: JSON.stringify(paymentData),
            });

            const data = await response.json();
            if(response.ok) {
                const currentUser = auth.getCurrentUser();
                if(currentUser) {
                    currentUser.membershipPlanß = this.selectedPlan;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                }
                this.showSuccess(result, paymentData);
                setTimeout(() => {
                    window.location.href = 'home.html';
                }, 3000);
            }else{
                this.showError(data.message || 'Payment processing failed');
            }
        } catch (error) {
            this.handlePaymentError(error);
        } finally {
            this.hideProcessingOverlay();
        }
    }
    showProcessingOverlay() {
        document.getElementById('processingOverlay').style.display = 'flex';
    }
    hideProcessingOverlay() {
        document.getElementById('processingOverlay').style.display = 'none';
    }

    showSuccess(result, paymentData) {
    const resultDiv = document.getElementById('paymentResult');
    const currency = document.getElementById('currency').value.toUpperCase();
    const amount =  this.formatCurrency(paymentData.amount, currency);
    
}