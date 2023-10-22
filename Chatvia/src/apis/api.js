import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000'; // Replace with actual backend server URL once its running

const registerUser = async (userData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/users/register`, userData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

const loginUser = async (userData) => {
    try {
        const response = await axios.post(`${API_BASE_URL}/api/users/login`, userData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export { registerUser, loginUser };
