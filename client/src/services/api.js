import axios from "axios";

const api = axios.create({
  baseURL:
    `${window.location.protocol}//` + `${window.location.hostname}:5000/api`,

  timeout: 10000,
});

export default api;
