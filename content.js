// Walks Onshape's two-step signin form (email -> Continue -> password -> submit).
// Runs at most one full attempt per page load so a wrong password never loops.
(async () => {
  const { email, password } = await chrome.storage.local.get(['email', 'password']);
  if (!email || !password) return;

  // React ignores plain .value assignment; use the native setter + input event.
  const nativeSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
  const fill = (input, value) => {
    nativeSetter.call(input, value);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };

  const waitFor = (selector, timeoutMs = 15000) =>
    new Promise((resolve) => {
      const started = Date.now();
      const timer = setInterval(() => {
        const el = document.querySelector(selector);
        if (el) {
          clearInterval(timer);
          resolve(el);
        } else if (Date.now() - started > timeoutMs) {
          clearInterval(timer);
          resolve(null);
        }
      }, 300);
    });

  const clickButton = (texts) => {
    const btn = [...document.querySelectorAll('button')].find(
      (b) => !b.disabled && texts.some((t) => b.textContent.trim().toLowerCase().includes(t))
    );
    if (btn) btn.click();
    return !!btn;
  };

  const emailInput = await waitFor('input[name="username"], input[autocomplete="username"], input[type="email"]');
  if (!emailInput) return;
  fill(emailInput, email);
  // Continue button enables after the input event propagates.
  await new Promise((r) => setTimeout(r, 300));
  if (!clickButton(['continue', 'next'])) return;

  const passwordInput = await waitFor('input[type="password"]');
  if (!passwordInput) return;
  fill(passwordInput, password);
  await new Promise((r) => setTimeout(r, 300));
  clickButton(['sign in', 'log in', 'continue']);
  // ponytail: no error-detection/retry — if creds are wrong, Onshape shows its
  // error and the user signs in manually; retrying risks lockout/CAPTCHA.
})();
