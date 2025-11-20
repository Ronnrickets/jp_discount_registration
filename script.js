function setFormState(isValid) {
    const fields = ['name', 'email', 'phone'];
    const submitButton = document.querySelector('button[type="submit"]');
    
    fields.forEach(fieldId => {
        const input = document.getElementById(fieldId);
        input.disabled = !isValid;
    });

    submitButton.disabled = !isValid;
    const form = document.getElementById('dataForm');
    if (isValid) {
        form.classList.remove('disabled-form');
    } else {
        form.classList.add('disabled-form');
    }
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
    if (document.getElementById('name').disabled) {
        document.getElementById('responseMessage').textContent = '⚠️ Please enter a valid discount code first.';
        document.getElementById('responseMessage').style.backgroundColor = '#fcf8e3';
        return; 
    }

    const form = event.target;
    const formData = new FormData(form);
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
                responseMessage.textContent = `❌ Error: ${data.message}`;
                responseMessage.style.backgroundColor = '#f2dede'; 
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
            responseMessage.textContent = '❌ Error: ' + data.message;
            responseMessage.style.backgroundColor = '#f2dede'; 
        }
    })
    .catch(error => {
        if (error !== 'Duplicate Entry' && error !== 'Server Error') {
            console.error('Fetch error:', error);
            responseMessage.textContent = '🚨 Network Error. Could not connect to server.';
            responseMessage.style.backgroundColor = '#fcf8e3';
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
    document.getElementById('receiptDate').textContent = formattedDate;
    document.getElementById('receiptDiscount').textContent = formData.get('discount');
    document.getElementById('receiptName').textContent = formData.get('name');
    document.getElementById('receiptEmail').textContent = formData.get('email');
    document.getElementById('receiptPhone').textContent = formData.get('phone');

    // Hide the form and show the receipt
    document.getElementById('dataForm').style.display = 'none';
    document.getElementById('responseMessage').style.display = 'none'; // Hide the response box
    document.getElementById('receiptContainer').style.display = 'block';
}