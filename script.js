// function setFormState(isValid) {
//     const fields = ['lastname', 'firstname', 'email', 'phone'];
//     const submitButton = document.querySelector('button[type="submit"]');
    
//     fields.forEach(fieldId => {
//         const input = document.getElementById(fieldId);
//         input.disabled = !isValid;
//     });

//     submitButton.disabled = !isValid;
//     const form = document.getElementById('dataForm');
//     if (isValid) {
//         form.classList.remove('disabled-form');
//     } else {
//         form.classList.add('disabled-form');
//     }
// }

let isDiscountValid = false;

// 2. Select the elements
const condition2Checkbox = document.getElementById('condition2');
const submitButton = document.querySelector('button[type="submit"]');

function areFormFieldsFilled() {
    const fields = ['lastname', 'firstname', 'email', 'phone'];
    return fields.every(fieldId => {
        const input = document.getElementById(fieldId);
        // Trim to check for non-whitespace content
        return input && input.value.trim() !== ''; 
    });
}

// 3. Define a helper function that checks BOTH requirements
// function updateSubmitButton() {
//     if (isDiscountValid && condition2Checkbox.checked) {
//         submitButton.disabled = false;
//         submitButton.style.opacity = "1"; 
//         submitButton.style.cursor = "pointer";
//     } else {
//         submitButton.disabled = true;
//         submitButton.style.opacity = "0.5";
//         submitButton.style.cursor = "not-allowed";
//     }
// }

function updateSubmitButton() {
    const isReadyToSubmit = isDiscountValid && condition2Checkbox.checked;
    
    // Check if the primary fields are filled for STYLING
    const areFieldsFilled = areFormFieldsFilled(); 

    if (isReadyToSubmit) {
        // Button is enabled if Discount is valid AND Checkbox is checked
        submitButton.disabled = false;
        // The styling changes based on the new check below
    } else {
        // Button is disabled otherwise
        submitButton.disabled = true;
    }
    
    // --- STYLING LOGIC MODIFICATION ---
    // Change opacity and cursor based on the disabled attribute
    if (submitButton.disabled) {
        submitButton.style.opacity = "0.5";
        submitButton.style.cursor = "not-allowed";
        // Optionally remove the 'fields-filled' class if you use it for CSS
        submitButton.classList.remove('fields-filled');
    } else {
        submitButton.style.opacity = "1";
        submitButton.style.cursor = "pointer";
    }

    // New: Add a class to trigger the color change ONLY when fields are filled
    // This allows CSS to target it when fields are ready.
    if (areFieldsFilled) {
        submitButton.classList.add('fields-filled');
    } else {
        submitButton.classList.remove('fields-filled');
    }
    // ------------------------------------
}

// 4. Your modified setFormState function
function setFormState(isValid) {
    isDiscountValid = isValid;
    const fields = ['lastname', 'firstname', 'email', 'phone'];
    
    // Toggle the input fields
    fields.forEach(fieldId => {
        const input = document.getElementById(fieldId);
        if(input) {
            input.disabled = !isValid;
            if (!input._hasBlurListener) {
                input.addEventListener('input', updateSubmitButton);
                input._hasBlurListener = true;
            }
        }
    });

    const form = document.getElementById('dataForm');
    if (isValid) {
        form.classList.remove('disabled-form');
    } else {
        form.classList.add('disabled-form');
    }

    updateSubmitButton();
}

if (condition2Checkbox) {
    condition2Checkbox.addEventListener('change', function() {
        updateSubmitButton();
    });
}


function showPopup(message) {
    const popup = document.getElementById('errorPopup');
    const popupMessage = document.getElementById('popupMessage');
    popupMessage.innerHTML = '🚨 ' + message;
    popup.style.display = 'flex'; 
}

function hidePopup() {
    document.getElementById('errorPopup').style.display = 'none';
}

setFormState(false); 

async function validateDiscount() {
    const discountInput = document.getElementById('discount');
    const discountCode = discountInput.value.trim();
    const discountError = document.getElementById('discountError');
    const responseMessage = document.getElementById('responseMessage');
    discountError.textContent = '';
    discountInput.classList.remove('error-input');
    responseMessage.textContent = '';
    responseMessage.style.backgroundColor = 'transparent';
    hidePopup();

    if (discountCode === '') {
        setFormState(false);
        return;
    }
    try {
        const response = await fetch(`./backend/check_discount.php?discount=${encodeURIComponent(discountCode)}`);
        const data = await response.json();

        if (data.exists) {
            discountInput.classList.remove('error-input');
            discountError.textContent = '';
            setFormState(true);
        } else {
            discountInput.classList.add('error-input'); 
            discountError.textContent = '❌ ' + data.message;
            discountError.style.color = 'red';
            setFormState(false);
        }
    } catch (error) {
        console.error('Validation fetch error:', error);
        discountInput.classList.add('error-input');
        discountError.textContent = '🚨 Network Error. Could not validate discount.';
        discountError.style.color = 'red';
        setFormState(false);
    }
}


document.getElementById('dataForm').addEventListener('submit', function(event) {
    event.preventDefault(); 

    // Function to hide the response message after a delay
    function autoHideMessage() {
        // Clear any existing timeout to prevent conflicts
        clearTimeout(window.messageTimeout); 
        
        // Set a new timeout
        window.messageTimeout = setTimeout(() => {
            const responseMessage = document.getElementById('responseMessage');
            responseMessage.textContent = '';
            responseMessage.style.backgroundColor = 'transparent';
            responseMessage.style.opacity = '0'; // Optional: for a fading effect
        }, 3000); // 3000 milliseconds = 3 seconds
    }
    
    // Function to show the response message
    function showResponseMessage(content, bgColor) {
        const responseMessage = document.getElementById('responseMessage');
        responseMessage.textContent = content;
        responseMessage.style.backgroundColor = bgColor;
        responseMessage.style.opacity = '1'; // Ensure it's fully visible
        autoHideMessage(); // Start the 3-second timer
    }
    
    const responseMessages = document.getElementById('responseMessage');
    responseMessages.textContent = '';
    responseMessages.style.backgroundColor = 'transparent';
    responseMessages.style.opacity = '0';
    clearTimeout(window.messageTimeout); // Clear any previous timeout
    hidePopup();

    if (document.getElementById('lastname').disabled) {
        document.getElementById('responseMessage').textContent = '⚠️ Please enter a valid discount code first.';
        document.getElementById('responseMessage').style.backgroundColor = '#fcf8e3';
        return; 
    }

    const form = event.target;
    const formData = new FormData(form);
    const isCondition1Checked = document.getElementById('condition1').checked;
    const isCondition2Checked = document.getElementById('condition2').checked;
    formData.set('condition1', isCondition1Checked ? 1 : 0);
    formData.set('condition2', isCondition2Checked ? 1 : 0);
    const responseMessage = document.getElementById('responseMessage');
    responseMessage.textContent = '';
    responseMessage.style.backgroundColor = 'transparent';
    hidePopup(); 
    
    fetch(form.action, {
        method: form.method,
        body: formData,
    })
    .then(response => {
        if (response.status === 409) {
            return response.json().then(data => {
                showPopup(data.message);
                return Promise.reject('Duplicate Entry'); 
            });
        }
        
        if (!response.ok) {
            return response.json().then(data => {
                // responseMessage.textContent = `❌ Error: ${data.message}`;
                // responseMessage.style.backgroundColor = '#f2dede'; 
                showResponseMessage(`❌ Error: ${data.message}`, '#f2dede'); 
                return Promise.reject('Server Error');
            });
        }
        
        return response.json();
    })
    .then(data => {
        if (data.success) {
            // responseMessage.textContent = '✅ Success: Data saved! Message: ' + data.message;
            // responseMessage.style.backgroundColor = '#dff0d8';
            displayReceipt(formData)
            form.reset();
            // validateDiscount(); 
            setFormState(false)
        } else {
            // responseMessage.textContent = '❌ Error: ' + data.message;
            // responseMessage.style.backgroundColor = '#f2dede'; 
            showResponseMessage(`❌ Error: ${data.message}`, '#f2dede'); 
        }
    })
    .catch(error => {
        console.log(error, 'error');
        
        if (error !== 'Duplicate Entry' && error !== 'Server Error') {
            console.error('Fetch error:', error);
            // responseMessage.textContent = '🚨 Network Error. Could not connect to server.';
            // responseMessage.style.backgroundColor = '#fcf8e3';
            showResponseMessage('🚨 Network Error. Could not connect to server.', '#fcf8e3');
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#errorPopup .close-btn').addEventListener('click', hidePopup);
    document.querySelector('#errorPopup .close-btn-popup').addEventListener('click', hidePopup);
    document.getElementById('errorPopup').addEventListener('click', function(event) {
        if (event.target.id === 'errorPopup') {
            hidePopup();
        }
    });
});

function displayReceipt(formData) {
    // Get today's date in a readable format
    const today = new Date();
    const dateOptions = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    const formattedDate = today.toLocaleDateString('en-US', dateOptions);

    // Populate the receipt container
    // document.getElementById('receiptDate').textContent = formattedDate;
    // document.getElementById('receiptDiscount').textContent = formData.get('discount');
    // document.getElementById('receiptName').textContent =  formData.get('firstname') + ' ' + formData.get('lastname');
    // document.getElementById('receiptEmail').textContent = formData.get('email');
    // document.getElementById('receiptPhone').textContent = formData.get('phone');

    // Hide the form and show the receipt
    document.getElementById('dataForm').style.display = 'none';
    document.getElementById('responseMessage').style.display = 'none'; // Hide the response box
    document.getElementById('receiptContainer').style.display = 'block';
}