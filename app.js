// 1. Define the variable using the config window object
const API_BASE_URL = window.ENV.API_BASE_URL;
const dateInput = document.getElementById('bookingDate');
const tourSelect = document.getElementById('tourSelect');
const submitBtn = document.querySelector('button[type="submit"]');
const loadingStatus = document.getElementById('loadingStatus');





// 2. Wrap your execution to ensure it runs when the page is ready
document.addEventListener('DOMContentLoaded', () => {
//Force Calendar to 7 days out!
const today = new Date();
//add 7 days.
today.setDate(today.getDate() + 7);
const formattedDate = today.toISOString().split('T')[0];
    // Set minimum date to today so users cannot book in the past
    dateInput.setAttribute('min', formattedDate);
    fetchAvailableTours();
});

// =================================================================================
// 3. FETCH TOURS (GET /tours)
// =================================================================================
async function fetchAvailableTours() {
    try {
        const response = await fetch(`${API_BASE_URL}/tours`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`Server responded with code: ${response.status}`);
        }

        const tours = await response.json();

        tourSelect.innerHTML = '<option value="" selected disabled>-- Select a Tour --</option>';

        tours.forEach(tour => {
            const option = document.createElement('option');
            option.value = tour.eventTypeId;
            option.textContent = `${tour.tourName} ($${tour.officialPrice})`;
            tourSelect.appendChild(option);
        });

        tourSelect.disabled = false;
        submitBtn.disabled = false;
        loadingStatus.classList.add('hidden');

    } catch (error) {
        console.error("Error fetching tours:", error);
        loadingStatus.textContent = "⚠️ Failed to load tours. Please refresh the page.";
        loadingStatus.style.color = "#bf2600";
    }
}

// =================================================================================
// 4. FORM SUBMISSION (POST /booking-form)
// =================================================================================
document.getElementById('bookingForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const messageBox = document.getElementById('messageBox');
    const tourId = tourSelect.value;
    const name = document.getElementById('customerName').value.trim();
    const email = document.getElementById('customerEmail').value.trim();
    const date = dateInput.value;
    const partySize = document.getElementById('partySize').value;
    const pickupAddress = document.getElementById('pickupAddress').value.trim();

    // 1. Client-Side Validation
    if (!tourId) { alert("Please select a tour."); return; }
    if (name.length < 3) { alert("Please enter a valid full name."); return; }
    if (!email.includes('@')) { alert("Please enter a valid email address."); return; }
    if (!date) { alert("Please select a booking date."); return; }
    if (!partySize || partySize <= 0) { alert("Please provide a valid party size."); return; }
    if (!pickupAddress) { alert("Please provide a pick-up location."); return; }

    // 2. Prepare payload
    const bookingData = { tourId, date, name, email, partySize, pickupAddress };

    try {
        messageBox.textContent = "Processing... Redirecting to Stripe.";
        messageBox.className = "info";
        submitBtn.disabled = true;

        const response = await fetch(`${API_BASE_URL}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingData)
        });

        if (response.ok) {
            // Expecting JSON { "url": "https://checkout.stripe.com/..." }
            const result = await response.json();

            // Redirect the browser to Stripe
            window.location.href = result.url;
        } else {
            throw new Error("API rejected the request");
        }
    } catch (err) {
        messageBox.textContent = "Error: Booking could not be completed.";
        messageBox.className = "error";
        submitBtn.disabled = false;
    }
});