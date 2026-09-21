import request from './request';

// 登录
export const login = (data) => {
    return request.post('/auth/login', data);
};