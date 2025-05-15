const blockList = [
    "lop@actnow1.com",
    "Recs@northtexasxray.com",
    "billing4@actnow1.com",
    "billrep1@northtexasxray.com",
    "collectionsrep4@actclinic.com",
    "collectionsrep4@actclinic.com",
    "NTX Records",
    "ntx records",
    "Sarai Zaragoza Team Lead ACT LOP",
    "recs@infinitycare1.com",
    "Tiffany Vanegas",
    "sufyanar@actclinic.com",
    "Sufyan A Software Engineer Collections",
    
  ].map(e => e.toLowerCase());
  
  function showWarning(name) {
    alert(`⚠️ You are sending a contract to an internal recipient: ${name}\n\nPlease double-check before sending.`);
  }
  
  function getToEmails() {
    // Try multiple selectors for the chips (covering both compose and reply)
    const chipSelectors = [
      '.g2', '.vN', '.a4W', '.a4X', '.a4Y', '.a4Z', '.a50', '.a51',
      // Add selectors for reply window
      'div[role="dialog"] .a4W',
      'div[role="dialog"] .a4X',
      'div[role="dialog"] .a4Y',
      'div[role="dialog"] .a4Z',
      'div[role="dialog"] .a50',
      'div[role="dialog"] .a51',
      // Add selectors for the To field in reply
      'div[role="dialog"] [aria-label="To"]',
      'div[role="dialog"] [aria-label="Recipients"]',
      'div[role="dialog"] [name="to"]'
    ];
    
    const chips = document.querySelectorAll(chipSelectors.join(','));
    console.log('Found chips:', chips.length);
   
    if (chips.length > 0) {
      const recipients = Array.from(chips).map(chip => {
        const emailAttr = chip.getAttribute('email');
        const ariaLabel = chip.getAttribute('aria-label');
        const text = chip.textContent || chip.innerText || '';
   
        const value = (emailAttr || ariaLabel || text).trim().toLowerCase();
        console.log('Chip content:', value);
        return value;
      }).filter(text => text !== '');
   
      console.log('Found recipients from chips:', recipients);
      return recipients;
    }
   
    // Fallback for cases where chips don't render
    const fallbackSelectors = [
      '[name="to"]',
      '[aria-label="To"]',
      '[aria-label="Recipients"]',
      'div[role="dialog"] [name="to"]',
      'div[role="dialog"] [aria-label="To"]',
      'div[role="dialog"] [aria-label="Recipients"]'
    ];
    
    const fallbackField = document.querySelector(fallbackSelectors.join(','));
    console.log('To field found:', fallbackField);
   
    if (!fallbackField) {
      console.log('To field not found');
      return [];
    }
   
    const text = fallbackField.value || fallbackField.textContent || '';
    const recipients = text.split(',')
      .map(r => r.trim().toLowerCase())
      .filter(r => r !== '');
    
    console.log('Found recipients from input:', recipients);
    return recipients;
  }
  
  
  function monitorSendButton() {
    console.log('Starting to monitor send button...');
    const observer = new MutationObserver(() => {
      // Look for the send button in both new compose and reply windows
      const sendButtons = document.querySelectorAll(
        'div.T-I.J-J5-Ji.aoO.v7.T-I-atl.L3[role="button"][data-tooltip="Send"], ' +
        'div.T-I.J-J5-Ji.aoO.v7.T-I-atl.L3[role="button"][aria-label="Send"], ' +
        'div#\\:7q[role="button"][data-tooltip="Send"], ' +  // Reply window send button
        'div[role="button"][data-tooltip="Send"][aria-label="Send"], ' +  // Generic send button
        // Add more specific selectors for reply window
        'div[role="dialog"] div[role="button"][data-tooltip="Send"]',
        'div[role="dialog"] div[role="button"][aria-label="Send"]'
      );
      
      console.log('Found send buttons:', sendButtons.length);
      
      sendButtons.forEach(button => {
        if (!button.classList.contains('warn-attached')) {
          button.classList.add('warn-attached');
          button.addEventListener('click', (event) => {
            console.log('Send button clicked');
            const recipients = getToEmails();
            console.log('Checking recipients:', recipients);
            
            let hasBlockedRecipient = false;
            recipients.forEach(recipient => {
              if (blockList.includes(recipient)) {
                showWarning(recipient);
                hasBlockedRecipient = true;
              }
            });

            if (hasBlockedRecipient) {
              event.preventDefault();
              event.stopPropagation();
              console.log('Blocked internal recipient detected, preventing send.');
            }
          });
        }
      });
    });
  
    observer.observe(document.body, { childList: true, subtree: true });
  }
  
  // Start monitoring when the page loads
  window.addEventListener('load', () => {
    console.log('Extension loaded on Gmail page');
    monitorSendButton();
  });
  