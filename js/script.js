let isRecording=false;
let recognition = null;

let currentSlide = 0;
let autoSlideInterval;

const slides = document.querySelectorAll('.carousel-slide');

function initializeSpeechRecognition(){
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            document.getElementById('voiceResult').value = transcript;
            document.getElementById('voiceStatus').textContent = 'Voice captured successfully!';
        };

        recognition.onerror = function(event) {
            console.error('Speech recognition error:', event.error);
            document.getElementById('voiceStatus').textContent = 'Error: ' + event.error;
        };

        recognition.onend = function() {
            isRecording = false;
            document.getElementById('voiceIcon').classList.remove('recording');
            document.getElementById('voiceBtn').innerHTML = '<i class="fas fa-microphone"></i> Start Recording';
        };
    }
}

function activateVoiceSearch() {
    hideAllInterfaces();
    document.getElementById('voiceSearchInterface').style.document='block';
    document.getElementById('voiceSearchBtn').style.document='none';

}

function activateManualSearch() {
    hideAllInterfaces();
    document.getElementById('manualSearchInterface').style.document='block';
    document.getElementById('manualSearchBtn').style.document='none';

}

function hideAllInterfaces(){
    const interfaces = ['manualSearchInterface','voiceSearchInterface'];
    const buttons = ['voiceSearchBtn', 'manualSearchBtn'];
    interfaces.forEach(id =>{
        const element = document.getElementById(id);
        if(element) element.style.display='none';
    });
    buttons.forEach(id =>{
        const element = document.getElementById(id);
        if(element) element.style.display='none';
    });
}

function toggleVoiceRecording()
{
    if(!recognition){
        alert('Speech Recognition is not supported by your browser');
        return;
    }
    if(isRecording){
        recognition.stop();
    }
    else{
        recognition.start();
        isRecording=true;
    }
}

async function performSearch() {
    console.log("Started");
    const query = document.getElementById('mainSearch').value;
    if(query.trim())
    {
        try{
            const aiResponse = await generateTripSuggestions(query);
            showResults(aiResponse);
        }catch(error)
        {
            console.log(error);
        }
    }
}

async function generateTripSuggestions(userInput) {
    try{
        const systemPrompt = `You are an expert travel planner and advisor. Provide detailed, personalized travel suggestions based on user input. 
        Include:
        - Recommended destinations and attractions
        - Suggested itinerary with daily activities
        - Budget considerations and tips
        - Best time to visit
        - Accommodation suggestions
        - Local cuisine recommendations
        - Travel tips and cultural insights
        
        Format your response in a clear, structured way with headings and bullet points. Be specific and actionable.`;

        const userPrompt = `Please provide delailed travel planning suggestions for : ${userInput}`;
        const response = await callGithubAI(`${systemPrompt}\n\n User Request: ${userPrompt}`);
        console.log(response);
        return response;
    }catch(error)
    {
        console.log(error);
    }
}

window.travelApp={
    performSearch,
    generateTripSuggestions
};