// Authentication Module
const AUTH_API = 'http://localhost:8080/api/auth';

const auth = {
    async login(emailOrUsername, password) {
        const isEmail = emailOrUsername.includes('@');
        const loginData = isEmail 
            ? { email: emailOrUsername, password }
            : { userName: emailOrUsername, password };
            
        const response = await fetch(`${AUTH_API}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData)
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store in localStorage
            localStorage.setItem('JWT_TOKEN', data.token);
            localStorage.setItem('CURRENT_USER', JSON.stringify({
                id: data.id,
                userName: data.userName,
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                role: data.role
            }));
            return data;
        }
        throw new Error(data.message || 'Login failed');
    },

    async signup(userData) {
        const response = await fetch(`${AUTH_API}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: userData.email,
                email: userData.email,
                password: userData.password,
                firstName: userData.firstName,
                lastName: userData.lastName
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Store in localStorage
            localStorage.setItem('JWT_TOKEN', data.token);
            localStorage.setItem('CURRENT_USER', JSON.stringify({
                id: data.id,
                userName: data.userName,
                email: data.email,
                firstName: data.firstName,
                lastName: data.lastName,
                role: data.role
            }));
            return data;
        }
        throw new Error(data.message || 'Signup failed');
    },

    async request(url, options = {}) {
        const token = localStorage.getItem('JWT_TOKEN');
        return fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers
            }
        });
    },

    logout() {
        localStorage.removeItem('JWT_TOKEN');
        localStorage.removeItem('CURRENT_USER');
        window.location.href = 'http://127.0.0.1:5500/html/signin.html';
    },

    isAuthenticated() {
        return localStorage.getItem('JWT_TOKEN') !== null;
    },

    getCurrentUser() {
        const user = localStorage.getItem('CURRENT_USER');
        return user ? JSON.parse(user) : null;
    },

    getToken() {
        return localStorage.getItem('JWT_TOKEN');
    }
};

// Form handlers
document.addEventListener('DOMContentLoaded', () => {
    // Login form
    const loginForm = document.getElementById('signinForm');
    if (loginForm) {
        loginForm.onsubmit = async (e) => {
            e.preventDefault();
            
            const emailOrUsername = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            if (!emailOrUsername || !password) {
                alert('Please fill in all fields');
                return;
            }
            
            try {
                await auth.login(emailOrUsername, password);
                alert('Login successful!');
                window.location.href = 'http://127.0.0.1:5500/html/home.html';
            } catch (error) {
                alert('Login failed: ' + error.message);
            }
        };
    }

    // Signup form
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.onsubmit = async (e) => {
            e.preventDefault();
            try {
                await auth.signup({
                    firstName: document.getElementById('firstName').value,
                    lastName: document.getElementById('lastName').value,
                    email: document.getElementById('email').value,
                    password: document.getElementById('password').value
                });
                
                alert('Account created successfully!');
                window.location.href = 'http://127.0.0.1:5500/html/home.html';
            } catch (error) {
                alert('Signup failed: ' + error.message);
            }
        };
    }

    // Logout buttons
    document.querySelectorAll('[data-logout]').forEach(btn => {
        btn.onclick = () => auth.logout();
    });

    // Route protection
    if (window.location.pathname.includes('home.html')) {
        if (!auth.isAuthenticated()) {
            window.location.href = 'http://127.0.0.1:5500/html/signin.html';
        }
    }
});

// Global access
window.auth = auth; 