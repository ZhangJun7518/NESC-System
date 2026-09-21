import axios from 'axios';
import { message } from 'antd';

const request = axios.create({
    baseURL: '/api',
    timeout: 10000,
});

request.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

request.interceptors.response.use(
    (response) => {
        const res = response.data;
        if (res.code !== 200) {
            message.error(res.msg || '请求失败');
            if (res.code === 401) {
                localStorage.clear();
                window.location.href = '/login';
            }
            return Promise.reject(new Error(res.msg || 'Error'));
        }
        return res;
    },
    (error) => {
        message.error(error.message || '网络异常');
        return Promise.reject(error);
    }
);

export default request;