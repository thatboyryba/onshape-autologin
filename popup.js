const emailEl = document.getElementById('email');
const passwordEl = document.getElementById('password');
const statusEl = document.getElementById('status');

chrome.storage.local.get(['email', 'password']).then(({ email, password }) => {
  if (email) emailEl.value = email;
  if (email && password) statusEl.textContent = 'saved';
});

document.getElementById('save').addEventListener('click', async () => {
  if (!emailEl.value || !passwordEl.value) {
    statusEl.textContent = 'both fields required';
    return;
  }
  await chrome.storage.local.set({ email: emailEl.value, password: passwordEl.value });
  statusEl.textContent = 'saved';
});

document.getElementById('clear').addEventListener('click', async () => {
  await chrome.storage.local.remove(['email', 'password']);
  emailEl.value = '';
  passwordEl.value = '';
  statusEl.textContent = 'cleared';
});
