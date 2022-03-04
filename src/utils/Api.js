export let BASE_URL = "http://ec2-100-25-152-186.compute-1.amazonaws.com:8000/";

export async function getDataAsync(path){
     let url = BASE_URL + path;
     console.log(url);
      return await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(response => {
            console.log(response);
            if(!response.ok) {
                let error = new Error(response.statusText);
                error.response = response;
                throw error;
            }
            return response.text();
        })
}

 export async function postDataAsync(path = '', data = {}){
    let url = BASE_URL + path;
    console.log(url);
    return await fetch(url, {
            method: 'POST',
            headers: {
                // Accept: 'application/json',
                'content-type': 'multipart/form-data'
               
            },
            body: JSON.stringify(data)
        }).then(response => {
            
            return response;
        });
        
    

}