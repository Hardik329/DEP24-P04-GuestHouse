import axios from "axios";
import { toast } from "react-toastify";
import { BASE_URL } from "../constants";
import { logout } from "../redux/userSlice";

let store;

export const injectStore = (_store) => {
  store = _store;
};

axios.interceptors.request.use((config) => {
  config.baseURL = BASE_URL;
  config.headers.accessToken = 'Bearer '+store.getState().user.accessToken;
  config.headers.refreshToken = 'Bearer '+store.getState().user.refreshToken;
  // console.log(config.headers);
  return config;
});

axios.interceptors.response.use((res)=>{
  toast.success(res.data?.message)
  // console.log(res)
  return res;
}, (error) => {
  const expectedError =
    error.response &&
    error.response.status >= 400 &&
    error.response.status < 500;
  console.log(error);

  if (expectedError && error.response.data?.message) {
    if (error.response.status === 401) {
      store.dispatch(logout());
    }
    else if(error.response.status === 403){
      window.location.href="/unauthorized"
    }
    else if(error.response.status === 404){
      window.location.href="/404"
    }
  } else {
    toast.error("Something went wrong!");
  }

  return Promise.reject(error);
});

export default {
  get: axios.get,
  put: axios.put,
  post: axios.post,
  delete: axios.delete,
};
