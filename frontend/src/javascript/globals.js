export const jwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiY2U3NGVjNC0yZDk0LTRjZWYtYTUwMC1lMzIxMmVkZDhmNDkiLCJleHAiOjE3MzI4MzMzMDd9.Zf9L7v18DHrn_w6AB95HFLuuA2QeziJf-3zrXCIFdeM';
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


export function toTitleCase(str) {
    return str.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
export function toLowerCase(str) {
    return str.toLowerCase();
}
