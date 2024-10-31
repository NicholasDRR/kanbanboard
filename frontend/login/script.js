const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');
// let jwtToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5YmJkMjA0NS01NWNmLTQ5MGEtOTdjYS1kMDg2MTllMGEzYjUiLCJleHAiOjE3MzI5MTEwMjR9.Yr2yZKef0MJ7x-8DtSoXs7CLpQygs6EphFkQFTvdbr8';
let ambient = 'localhost:8000'
const globalBackendURL = `http://${ambient}/users/user/post`


signUpButton.addEventListener('click', () => {
	container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
	container.classList.remove("right-panel-active");
});

document.getElementById('signup-form').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent the default form submission

    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    try {
        axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';
        const response = await axios.post(globalBackendURL, {
            email: email,
            password: password
        });

        console.log('User created successfully:', response.data);
        alert('Account created successfully!'); // Notify user of success
    } catch (error) {
        console.error('Error creating user:', error);
        alert('Error creating account. Please try again.'); // Notify user of error
    }
});

document.getElementById('login-form').addEventListener('submit', async function (event) {
    event.preventDefault(); // Prevent the default form submission

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    // Input validation (basic example)
    if (!email || !password) {
        alert("Please fill in both fields.");
        return;
    }

    try {
        axios.defaults.headers.post['Access-Control-Allow-Origin'] = '*';
        const response = await axios.post('http://localhost:8000/auth/login', new URLSearchParams({
            username: email,
            password: password
        }));

        console.log('Login successful:', response.data);
        alert('Login successful!');
        localStorage.setItem('jwtToken', response.data.access_token);
		
		window.location.href = `http://localhost:5501/frontend/`;
    } catch (error) {
        console.error('Error logging in:', error);
        alert('Error logging in. Please check your credentials and try again.'); 
    }
});
