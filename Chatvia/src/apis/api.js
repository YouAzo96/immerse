import axios from 'axios';
import { setLoggedInUser } from '../helpers/authusUtils';
const API_BASE_URL = 'http://localhost:3001'; // Replace with actual backend server URL once its running

const registerUser = async (userData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/users/register`,
      userData
    );

    console.log('registered!');
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

const loginUser = async (userData) => {
  try {
    const token = await axios.post(`${API_BASE_URL}/api/users/login`, userData);
    setLoggedInUser(token);
    return token;
  } catch (error) {
    console.log(error);
    return false;
  }
};

export { registerUser, loginUser };
