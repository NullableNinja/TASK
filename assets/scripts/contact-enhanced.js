/* ============================================================
   ENHANCED CONTACT FORM - JavaScript
   ------------------------------------------------------------
   Purpose:
   - Form validation and submission
   - Success/error messaging
   - Email integration (using FormSubmit or similar)
============================================================ */

document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.getElementById('contactForm');
  const openPanelBtn = document.getElementById('openPanel');
  const panel = document.getElementById('panel');
  
  // Open/Close panel
  if (openPanelBtn && panel) {
    openPanelBtn.addEventListener('click', function() {
      panel.classList.toggle('show');
    });
    
    // Close panel when clicking outside
    document.addEventListener('click', function(e) {
      if (!panel.contains(e.target) && !openPanelBtn.contains(e.target)) {
        panel.classList.remove('show');
      }
    });
  }
  
  // Form submission
  if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const nameInput = document.getElementById('name');
      const emailInput = document.getElementById('email');
      const msgInput = document.getElementById('msg');
      const submitBtn = contactForm.querySelector('.send');
      
      // Get form data
      const formData = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        message: msgInput.value.trim()
      };
      
      // Validate
      if (!formData.name || !formData.email || !formData.message) {
        showMessage('Please fill in all fields', 'error');
        return;
      }
      
      if (!isValidEmail(formData.email)) {
        showMessage('Please enter a valid email address', 'error');
        return;
      }
      
      // Disable submit button
      submitBtn.disabled = true;
      submitBtn.textContent = 'SENDING...';
      
      try {
        // Option 1: Use FormSubmit.co (free email service)
        // Replace with your FormSubmit endpoint or your own backend
        const response = await fetch('https://formsubmit.co/ajax/taskkarate@gmail.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            message: formData.message,
            _subject: 'New Contact Form Submission - Task Karate',
            _template: 'table'
          })
        });
        
        if (response.ok) {
          showMessage('Message sent successfully! We\'ll get back to you soon.', 'success');
          contactForm.reset();
          
          // Close panel after 3 seconds
          setTimeout(() => {
            panel.classList.remove('show');
          }, 3000);
        } else {
          throw new Error('Failed to send message');
        }
      } catch (error) {
        console.error('Error sending message:', error);
        
        // Fallback: Open email client
        const subject = encodeURIComponent('Contact from ' + formData.name);
        const body = encodeURIComponent(
          `Name: ${formData.name}\n` +
          `Email: ${formData.email}\n\n` +
          `Message:\n${formData.message}`
        );
        
        window.location.href = `mailto:taskkarate@gmail.com?subject=${subject}&body=${body}`;
        
        showMessage('Opening your email client...', 'success');
      } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.textContent = 'HI-YAH!';
      }
    });
  }
  
  // Show message helper
  function showMessage(text, type) {
    // Remove existing message
    const existingMessage = contactForm.querySelector('.message');
    if (existingMessage) {
      existingMessage.remove();
    }
    
    // Create new message
    const message = document.createElement('div');
    message.className = `message ${type} show`;
    message.textContent = text;
    
    // Insert after submit button
    const submitBtn = contactForm.querySelector('.send');
    submitBtn.parentNode.insertBefore(message, submitBtn.nextSibling);
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
      message.classList.remove('show');
      setTimeout(() => message.remove(), 300);
    }, 5000);
  }
  
  // Email validation
  function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }
  
  // Add input animations
  const inputs = contactForm.querySelectorAll('input, textarea');
  inputs.forEach(input => {
    input.addEventListener('focus', function() {
      this.parentElement.classList.add('focused');
    });
    
    input.addEventListener('blur', function() {
      if (!this.value) {
        this.parentElement.classList.remove('focused');
      }
    });
  });
});