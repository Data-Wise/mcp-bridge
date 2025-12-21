// MCP Bridge Background Script
// Handles icon badge updates based on bridge health status

let lastHealth = { online: false };

// Update icon and badge
async function updateExtensionUI(health) {
  const online = health && health.online;
  const sessions = (health && health.sessionIds) || [];
  const diagnostics = (health && health.diagnostics) || {};
  
  const hasErrors = Object.values(diagnostics).some(status => status === 'error' || status === 'unreachable');
  
  try {
    let badgeText = '';
    if (online) {
      badgeText = sessions.length > 0 ? sessions.length.toString() : '✓';
    }
    
    if (chrome.action) {
      await chrome.action.setBadgeText({ text: badgeText });
      await chrome.action.setBadgeBackgroundColor({ color: online ? (hasErrors ? '#f59e0b' : '#10b981') : '#6b7280' });
    }
  } catch (e) {
    console.error('[MCP Bridge] Error updating badge:', e);
  }
}

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'mcp-health-update') {
    lastHealth = message.health;
    updateExtensionUI(lastHealth);
    if (sendResponse) sendResponse({ success: true });
  }
  return true;
});
