let isRecording=false;
let recognition = null;

let currentSlide = 0;
let autoSlideInterval;

const slides = document.querySelectorAll('.carousel-slide');
const totalSlides = slides.length;

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
        document.getElementById('voiceIcon').classList.add('recording');
        document.getElementById('voiceBtn').classList.add('<i class="fas fa-stop"></i> stop recording');
        document.getElementById('voiceStatus').classList.add('Listening.....');
    }
}

// Calling AI and get Rsponse Start
async function performSearch() {
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

async function performManualSearch() {
    const destination = document.getElementById('destination').value;
    const duration = document.getElementById('duration').value;
    const budget = document.getElementById('budget').value;
    const style = document.getElementById('travelStyle').value;
    if(destination.trim())
    {
        showLoadingState();
        const searchQuery =`Destination: ${destination}, duration: ${duration} days, Budget: ${budget}, travelStyle: ${style}`;
        try{
            const aiResponse = await generateTripSuggestions(searchQuery);
        }catch(error)
        {

        }
    }
}

function showLoadingState(){
    const resultContent= document.getElementById('resultsContent');
    resultContent.innerHTML = `
    <div class="text-center">
        <div class='spinner-border text-primary'>
            <span class="visually-hidden"> Loading..... </span>
        <div>
        <p class="mt-2"> Generate Personalized travel Suggestions ....</p>
    </div>
    `;
    document.getElementById('searchResults').style.display='block';
    document.getElementById('searchResults').scrollIntoView({behavior: 'smooth'});
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
        const response = await callGitHubAI(`${systemPrompt}\n\n User Request: ${userPrompt}`);
        console.log(response);
        return response;
    }catch(error)
    {
        console.log(error);
    }
}


function showResults(content){
    document.getElementById('resultsContent').innerHTML=content;
    document.getElementById('searchResults').style.display='block';
    document.getElementById('searchResults').scrollIntoView({behavior: 'smooth'});
}
// Calling AI and get Rsponse End

// Carousel Logic Start 
function initCarousel()
{
    createDots();
    startAutoSlide();
    updateCarousel();
}

function createDots()
{
    const dotsContainer = document.getElementById('carouselDots');
    for(let i=0;i<totalSlides;i++){
        const dot = document.createElement('div');
        dot.className='carousel-dot';
        dot.onclick = () => goToSlide(i);
        dotsContainer.appendChild(dot);
    }
}

function updateCarousel()
{
    const track = document.getElementById('countryCarousel');
    const slideWidth = 320;
    const offset = -currentSlide*slideWidth;
    track.style.transform = `translateX(${offset}px)`;

    const dots = document.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index)=>{
        dot.classList.toggle('active', index===currentSlide);
    })
}

function moveCarousel(direction)
{
    currentSlide+=direction;
    if(currentSlide>=totalSlides)
    {
        currentSlide=0;
    }
    else if(currentSlide<0)
    {
        currentSlide=totalSlides-1;
    }
    updateCarousel();
    resetAutoslide();
}
function startAutoSlide()
{
    autoSlideInterval = setInterval(()=>{
       moveCarousel();
    }, 3000);
}

function goToSlide(loc){
    currentSlide = IDBIndex;
    updateCarousel();
    resetAutoslide();
}

function resetAutoslide()
{
    clearInterval(autoSlideInterval);
    startAutoSlide();
}

// Carousel Logic End 

window.travelApp={
    performSearch,
    generateTripSuggestions
};