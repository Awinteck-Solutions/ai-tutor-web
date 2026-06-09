import { BASEURL } from "../../constants/api.constant";

export const authEndpoints = {
    LOGIN: `${BASEURL}/auth/login`,
    REFRESH: `${BASEURL}/auth/refresh`,
    LOGOUT: `${BASEURL}/auth/logout`,
    PROFILE: `${BASEURL}/auth/profile`,
    CHANGE_PASSWORD: `${BASEURL}/auth/change-password`,
    REGISTER: `${BASEURL}/auth/register`,
    FORGOT_PASSWORD: `${BASEURL}/auth/forgot-password`,
    RESET_PASSWORD: `${BASEURL}/auth/reset-password`,
};
