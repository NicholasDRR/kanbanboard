export const jwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5YmJkMjA0NS01NWNmLTQ5MGEtOTdjYS1kMDg2MTllMGEzYjUiLCJleHAiOjE3MzI4MTM5NDd9.S5Tu_m62Wi19CBCVNsnMk79f6oWWEufBnXjcbljo1zA';
export const ambient = 'localhost';
export const backEndUrl = 'http://54.219.225.136:8000/tasks';


export function getJwtToken() {
    return localStorage.getItem('jwtToken'); 
}

export function checkAuth() {
    const token = localStorage.getItem('jwtToken');
    
    if (!token) {
        window.location.href = "http://54.219.225.136:80/login"; 
    }
}
