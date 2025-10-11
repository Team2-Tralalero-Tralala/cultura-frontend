// src/Libs/Tags.ts
import axios from "axios";
const apiUrl = import.meta.env.VITE_API_URL;

export type Tag = {
  id: number;
  name: string;
};


//แท็กทั้งหมด
export async function getAllTags(){
  return await axios.get(`${apiUrl}/super/tags/`,{
    withCredentials: true,
  });
}

//สร้างแท็กใหม่
export async function createTag(name: string){
 return await axios.post(`${apiUrl}/super/tags/`, {name}, {
    withCredentials: true,
  });
}

//อัปเดตแท็ก
export async function updateTag (id: number, name: string){
  return await axios.put(`${apiUrl}/super/tags/${id}`, {name},{
    withCredentials: true,
  });
}

//ลบแท็ก
export async function deleteTag (id: number){
return await axios.patch(`${apiUrl}/super/tags/${id}`,{}, {
    withCredentials: true,
  });
}
