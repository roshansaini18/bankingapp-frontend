// import axios from "axios";
// // http request
// export const http=(accessToken=null)=>{
//   axios.defaults.baseURL=import.meta.env.VITE_BASEURL;
//   if(accessToken){
//     axios.defaults.headers.common['Authorization']=`Bearer${accessToken}`;
//   }
//   return axios;
// };

// export const trimData = (obj) => {
//   let finalObj={};
//   for(let key in obj){
//   const value=obj[key];
//   if(typeof value==='string'){
//     finalObj[key]=value.trim().toLowerCase();
//   }
//   else if(typeof value==='number'|| typeof value==='boolean'){
//     finalObj[key]=value.toString();
//   }
//   else{
//     finalObj[key]=value;
//   }
//   }
//   return finalObj;
// };

//   //fetcher
//   export const fetchData=async (api) => {
//     try{
//       const httpReq=http();
//       const {data}=await httpReq.get(api);
//       return data;
//     }
//     catch(err){
//   return null;
//     }
//   };


//   export const uploadFile = async (file, folderName) => {
//     // 1. Create a FormData object to hold the file and other data.
//     const formData = new FormData();
    
//     // 2. Append the file and the folderName to the FormData.
//     // The backend will read these fields.
//     formData.append("file", file);
//     formData.append("folderName", folderName);

//     try {
//         // Assuming 'http()' is your pre-configured Axios or fetch instance.
//         const httpReq = http(); 

//         // 3. Send the POST request. The endpoint should match your backend router.
//         // The FormData will be sent as a 'multipart/form-data' request.
//         const response = await httpReq.post(
//             "/api/upload", // The folderName is now in the body, so it's removed from the URL.
//             formData
//         );

//         console.log("Upload successful. ImageKit Response:", response.data);
        
//         // 4. Return the data from the successful response.
//         // This will be the JSON object from ImageKit.
//         return response.data;

//     } catch (error) {
//         console.error("Upload failed:", error.response?.data || error);
//         // Rethrow the error so the calling function can handle it.
//         throw error.response?.data || error;
//     }
// };

  
import axios from "axios";

// http request
export const http = (accessToken = null) => {
  // Ensure baseURL is correctly set from environment variable
  const baseURL = import.meta.env.VITE_BASEURL;

  // Optional: Remove these logs in production to avoid build issues
  if (process.env.NODE_ENV !== "production") {
    console.log("VITE_BASEURL from env:", baseURL);
    console.log("Axios baseURL set to:", baseURL);
  }

  axios.defaults.baseURL = baseURL;

  if (accessToken) {
    // Correct Authorization header format
    axios.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
  }

  return axios;
};

export const trimData = (obj) => {
  const finalObj = {};
  for (let key in obj) {
    const value = obj[key];
    if (typeof value === "string") {
      finalObj[key] = value.trim().toLowerCase();
    } else if (typeof value === "number" || typeof value === "boolean") {
      finalObj[key] = value;
    } else {
      finalObj[key] = value;
    }
  }
  return finalObj;
};

// fetcher
export const fetchData = async (api) => {
  try {
    const httpReq = http();
    const { data } = await httpReq.get(api);
    return data;
  } catch (err) {
    return null;
  }
};

export const uploadFile = async (file, folderName) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("folderName", folderName);

  try {
    const httpReq = http();
    const response = await httpReq.post("/api/upload", formData);

    if (process.env.NODE_ENV !== "production") {
      console.log("Upload successful. ImageKit Response:", response.data);
    }

    return response.data;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.error("Upload failed:", error.response?.data || error);
    }
    throw error.response?.data || error;
  }
};
