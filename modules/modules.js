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
  // --- DEBUGGING: Log the environment variable to the console ---
  // This will show us exactly what value is being used in production.
  console.log("VITE_BASEURL from env:", import.meta.env.VITE_BASEURL);

  axios.defaults.baseURL = import.meta.env.VITE_BASEURL;

  // --- DEBUGGING: Log the final baseURL that Axios will use ---
  console.log("Axios baseURL set to:", axios.defaults.baseURL);

  if (accessToken) {
    // Corrected Authorization header format
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  }
  return axios;
};

export const trimData = (obj) => {
  let finalObj = {};
  for (let key in obj) {
    const value = obj[key];
    if (typeof value === 'string') {
      finalObj[key] = value.trim().toLowerCase();
    }
    // Corrected logic to handle numbers and booleans properly
    else if (typeof value === 'number' || typeof value === 'boolean') {
      finalObj[key] = value;
    }
    else {
      finalObj[key] = value;
    }
  }
  return finalObj;
};

//fetcher
export const fetchData = async (api) => {
  try {
    const httpReq = http();
    const { data } = await httpReq.get(api);
    return data;
  }
  catch (err) {
    return null;
  }
};

export const uploadFile = async (file, folderName) => {
  // 1. Create a FormData object to hold the file and other data.
  const formData = new FormData();

  // 2. Append the file and the folderName to the FormData.
  // The backend will read these fields.
  formData.append("file", file);
  formData.append("folderName", folderName);

  try {
    // Assuming 'http()' is your pre-configured Axios or fetch instance.
    const httpReq = http();

    // 3. Send the POST request. The endpoint should match your backend router.
    // The FormData will be sent as a 'multipart/form-data' request.
    const response = await httpReq.post(
      "/api/upload", // The folderName is now in the body, so it's removed from the URL.
      formData
    );

    console.log("Upload successful. ImageKit Response:", response.data);

    // 4. Return the data from the successful response.
    // This will be the JSON object from ImageKit.
    return response.data;

  } catch (error) {
    console.error("Upload failed:", error.response?.data || error);
    // Rethrow the error so the calling function can handle it.
    throw error.response?.data || error;
  }
};
```

### What This Change Does

1.  **Logs the Environment Variable:** It adds a `console.log` to show the exact value of `import.meta.env.VITE_BASEURL` as your deployed app sees it.
2.  **Logs the Final URL:** It logs the `baseURL` that Axios is actually configured with.
3.  **Bonus Fix:** I also corrected a small bug in your `Authorization` header (`Bearer${accessToken}` should be `Bearer ${accessToken}` with a space) and improved the `trimData` function to handle numbers and booleans correctly.

### Next Steps

1.  **Update your `modules.js` file** with the code from the Canvas.
2.  **Commit and push** the changes to trigger a new deployment on Render.
3.  **Open the deployed application** and check the browser console again.

You should now see the new log messages. I suspect you will see `"VITE_BASEURL from env: undefined"`, which will confirm that the environment variable is not set correctly for your frontend service on Render, even if you think it is. If so, please double-check the steps from my previous message to set 
