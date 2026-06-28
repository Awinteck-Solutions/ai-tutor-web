import { BASEURL } from "../../constants/api.constant";

export const authEndpoints = {
    LOGIN: `${BASEURL}/auth/login`,
    REFRESH: `${BASEURL}/auth/refresh`,
    LOGOUT: `${BASEURL}/auth/logout`,
    PROFILE: `${BASEURL}/auth/profile`,
    LEARNING_PROFILE: `${BASEURL}/auth/learning-profile`,
    CHANGE_PASSWORD: `${BASEURL}/auth/change-password`,
    REGISTER: `${BASEURL}/auth/register`,
    GOOGLE: `${BASEURL}/auth/google`,
    FORGOT_PASSWORD: `${BASEURL}/auth/forgot-password`,
    RESET_PASSWORD: `${BASEURL}/auth/reset-password`,
};
