import api from "./api";

async function getCsrfToken() {
const { data } = await api.patch("/csrf");
    return data.csrfToken
  
}
export default getCsrfToken