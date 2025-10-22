import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;
export async function getTags() {
  return await axios.get(`${apiUrl}/shared/tags`, {
    withCredentials: true,
  });
}
