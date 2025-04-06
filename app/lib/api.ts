import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
export async function login(identifier: string, password: string) {
  const res = await axios.post(`${API_BASE_URL}/auth/login`, {
    identifier,
    password,
  });
  return res.data;
}

export async function register(username: string, password: string) {
  const res = await axios.post(`${API_BASE_URL}/auth/register`, {
    username,
    password,
  });
  return res.data;
}

export async function getUserProfile(token: string) {
  const res = await axios.get(`${API_BASE_URL}/user/profile`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
  return res.data;
}