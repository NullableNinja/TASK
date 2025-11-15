/* ============================================================
   STUDENT LOGIN - JavaScript
   ------------------------------------------------------------
   Purpose:
   - Handle 4-digit PIN authentication
   - Auto-focus and auto-advance between PIN digits
   - Validate against stored student PINs
   - Redirect to dashboard on successful login
============================================================ */

document.addEventListener('DOMContentLoaded', function() {
  const pinInputs = document.querySelectorAll('.pin-digit');
  const loginForm = document.getElementById('loginForm');
  const errorMessage = document.getElementById('errorMessage');
  
  // Auto-focus first input
  pinInputs[0].focus();
  
  // Handle PIN input
  pinInputs.forEach((input, index) => {
    // Auto-advance to next input
    input.addEventListener('input', function(e) {
      const value = e.target.value;
      
      // Only allow numbers
      if (!/^\d$/.test(value)) {
        e.target.value = '';
        return;
      }
      
      // Move to next input
      if (value && index < pinInputs.length - 1) {
        pinInputs[index + 1].focus();
      }
      
      // Auto-submit when all 4 digits entered
      if (index === pinInputs.length - 1 && value) {
        setTimeout(() => loginForm.requestSubmit(), 100);
      }
    });
    
    // Handle backspace
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Backspace' && !e.target.value && index > 0) {
        pinInputs[index - 1].focus();
      }
    });
    
    // Handle paste
    input.addEventListener('paste', function(e) {
      e.preventDefault();
      const pastedData = e.clipboardData.getData('text');
      const digits = pastedData.replace(/\D/g, '').split('').slice(0, 4);
      
      digits.forEach((digit, i) => {
        if (pinInputs[i]) {
          pinInputs[i].value = digit;
        }
      });
      
      if (digits.length === 4) {
        setTimeout(() => loginForm.requestSubmit(), 100);
      }
    });
  });
  
  // Handle form submission
  loginForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Get PIN
    const pin = Array.from(pinInputs).map(input => input.value).join('');
    
    // Validate PIN length
    if (pin.length !== 4) {
      showError('Please enter all 4 digits');
      return;
    }
    
    // Authenticate
    authenticateStudent(pin);
  });
  
  function authenticateStudent(pin) {
    // Get all students
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    
    // Find student with matching PIN
    const student = students.find(s => s.pin === pin);
    
    if (student) {
      // Success! Store session and redirect
      sessionStorage.setItem('studentLoggedIn', 'true');
      sessionStorage.setItem('loggedInStudentId', student.id);
      sessionStorage.setItem('loggedInStudentName', `${student.firstName} ${student.lastName}`);
      
      // Redirect to dashboard
      window.location.href = `student-dashboard.html?student=${student.id}`;
    } else {
      // Failed authentication
      showError('Invalid PIN. Please try again.');
      clearPinInputs();
      pinInputs[0].focus();
    }
  }
  
  function showError(message) {
    errorMessage.textContent = message;
    errorMessage.classList.add('show');
    
    // Hide after 3 seconds
    setTimeout(() => {
      errorMessage.classList.remove('show');
    }, 3000);
  }
  
  function clearPinInputs() {
    pinInputs.forEach(input => {
      input.value = '';
    });
  }
});