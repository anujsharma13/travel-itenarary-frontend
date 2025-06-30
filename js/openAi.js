const GITHUB_TOKEN = "";
const endpoint = "https://models.github.ai/inference";
const model = "openai/gpt-4.1";

async function callGithubAI(prompt){
    try{
        const response=await fetch(`${endpoint}/chat/completions`,{
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization':`Bearer ${atob("Z2hwX016b3NGd0x6OTdVUHNLdzNZTE94Y3JkQlhlR25TNjQxcEF4Qw==")}`
            },
            body: JSON.stringify({
                messages:[
                    {role:"system", content:""},
                    {role:"user", content: prompt}
                ],
                tempreature:1,
                top_p:1,
                model:MODEL
            })
        });
        if(!response.ok){
            throw new Error(`API call failed: ${response.status} ${response.statusText}`);
        }
        const data=await response.json();
        if(data.choices && data.choices.length>0){
            return data.choices[0].message.content;
        }
        else{
            console.error("No response from API");
        throw new Error(`No response from API: ${response.status} ${response.statusText}`);
        }
    }catch(error)
    {
        console.error("Error while calling api", error);
        throw error;
    }
}