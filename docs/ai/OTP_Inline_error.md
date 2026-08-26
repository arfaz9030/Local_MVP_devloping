Yes. I reviewed the **Engineering Handbook, frontend guidelines, coding standards, API contract, current status, and your actual `onboarding.tsx`** before answering.

The screenshot shows exactly why the UX feels wrong:

* The large **Alert popup** is blocking the OTP screen.
* The underlying OTP screen is still visible.
* The `WAITING` loader is part of your current state flow.
* The bottom black `"Verify OTP Error"` message is a development error/log display, not something the user should see in the production UI.

Your project guidelines explicitly say forms must have **validation, loading state, error state, and user-friendly messages**, and should never expose backend exceptions.

## 🏏 Current Ball: Replace the popup with inline OTP validation

You **do not need a new component** and you don't need to redesign the screen.

Your existing `OTP_INPUT` screen is the correct place for this because `onboarding.tsx` already owns the OTP screen state. 

### 1. Add `otpError` beside your existing state

You currently have:

```tsx
const [step, setStep] = useState<OnboardingStep>('PROMO');
const [phoneNumber, setPhoneNumber] = useState('7680922101');
const [otpCode, setOtpCode] = useState('');
```

Change to:

```tsx
const [step, setStep] = useState<OnboardingStep>('PROMO');
const [phoneNumber, setPhoneNumber] = useState('7680922101');
const [otpCode, setOtpCode] = useState('');
const [otpError, setOtpError] = useState('');
```

`otpError` is simply React state that remembers the current OTP validation message.

---

## 2. Remove `Alert` from the import

Currently you have:

```tsx
import { Alert, Dimensions, Image, ScrollView, StyleSheet, View } from 'react-native';
```

Change it to:

```tsx
import { Dimensions, Image, ScrollView, StyleSheet, View } from 'react-native';
```

You don't need `Alert` anymore.

---

## 3. Replace `handleOtpVerify()`

Your current implementation contains:

```tsx
Alert.alert("Invalid OTP", "OTP verification failed.");
```

Replace the **whole function** with:

```tsx
const handleOtpVerify = async () => {
  // Clear any previous validation message before starting a new request.
  setOtpError('');

  // Show the existing loading screen while verification is in progress.
  setStep('WAITING');

  try {
    const response = await authApi.verifyOTP(phoneNumber, otpCode);

    console.log("Verify OTP Response:", response);

    // Successful verification requires both JWT and user ID.
    if (response.token && response.userId) {
      setTimeout(() => {
        setStep("SURVEY");
      }, 500);

      return;
    }

    // Backend response did not contain the required authentication data.
    setOtpError('Invalid OTP. Please check the code and try again.');
    setStep('OTP_INPUT');

  } catch (error) {
    // Keep the technical error for development debugging.
    console.error("Verify OTP Error:", error);

    // Show a user-friendly validation message inside the OTP screen.
    setOtpError('Invalid OTP. Please check the code and try again.');

    // Return to the OTP screen so the user can correct the code.
    setStep('OTP_INPUT');
  }
};
```

### Notice the important change

Before:

```text
WAITING
   ↓
Error
   ↓
Alert popup
```

Now:

```text
WAITING
   ↓
Error
   ↓
OTP_INPUT
   ↓
Inline error message
```

That is the behavior you want.

---

# 4. Clear the error when the user edits the OTP

You currently have:

```tsx
<OTPInput value={otpCode} onChange={setOtpCode} />
```

Change it to:

```tsx
<OTPInput
  value={otpCode}
  onChange={(code) => {
    setOtpCode(code);
    setOtpError('');
  }}
/>
```

Now the UX becomes:

```text
Wrong OTP
   ↓
❌ Invalid OTP. Please check the code and try again.
   ↓
User changes OTP
   ↓
Error disappears
```

That's much more natural for a form.

---

# 5. Display the error directly below OTPInput

Your current section is:

```tsx
<OTPInput value={otpCode} onChange={setOtpCode} />

<Button
  mode="contained"
  ...
>
  Verify & Proceed
</Button>
```

Change it to:

```tsx
<OTPInput
  value={otpCode}
  onChange={(code) => {
    setOtpCode(code);
    setOtpError('');
  }}
/>

{otpError ? (
  <Text style={styles.otpError}>
    {otpError}
  </Text>
) : null}

<Button
  mode="contained"
  onPress={handleOtpVerify}
  style={styles.otpSubmitBtn}
  buttonColor="#1d978e"
  disabled={otpCode.length < 5}
  id="otp-verify-btn"
>
  Verify & Proceed
</Button>
```

I also changed:

```tsx
disabled={otpCode.length < 4}
```

to:

```tsx
disabled={otpCode.length < 5}
```

because your API contract requires a **5-digit OTP**. 

---

# 6. Add the error style

Your project guidelines say to use centralized theme tokens rather than hardcoded colors. 

So **if your theme already has an error/danger color**, use that.

For example, if your theme exposes:

```tsx
colors.error
```

then use:

```tsx
otpError: {
  color: colors.error,
  fontSize: 14,
  textAlign: 'center',
  marginTop: 4,
  marginBottom: 12,
},
```

**Don't create a new red color such as `#D32F2F` just for this message** if your existing theme already provides an error token.

If you show me your current `colors.tsx`/theme file, I can tell you the **exact existing token** to use instead of guessing.

---

# 7. What the final screen should look like

Instead of your screenshot:

```text
        Verify OTP

We have sent a verification code...

     [ 1 ][ 2 ][ 3 ][ 4 ][ 5 ]

        ┌─────────────────────┐
        │     Invalid OTP     │
        │                     │
        │ OTP verification    │
        │ failed.             │
        │                  OK │
        └─────────────────────┘
```

you want:

```text
        Verify OTP

We have sent a verification code...

     [ 1 ][ 2 ][ 3 ][ 4 ][ 5 ]

❌  Invalid OTP. Please check
    the code and try again.

       [ Verify & Proceed ]

          Back to login
```

The user stays on the same screen and can immediately correct the OTP.

---

## About the black message at the bottom

The screenshot also shows:

> `Verify OTP Error: Error: OTP verification...`

That is coming from:

```tsx
console.error("Verify OTP Error:", error);
```

Your project standards allow useful development logging, but the frontend guidelines say unnecessary logs should be removed before merging.

For **development**, you can temporarily keep it.

For **deployment**, remove it or replace it with safe structured debugging if genuinely needed.

And importantly, never log the OTP or JWT. Your frontend guidelines explicitly prohibit that. 

---

# Your OTP error flow after this change

```text
User enters wrong 5-digit OTP
            ↓
      Verify & Proceed
            ↓
        WAITING
            ↓
       Backend 400
            ↓
          catch
            ↓
     setOtpError(...)
            ↓
     setStep('OTP_INPUT')
            ↓
┌─────────────────────────────┐
│ Verify OTP                  │
│                             │
│ [1] [2] [3] [4] [5]        │
│                             │
│ Invalid OTP. Please check   │
│ the code and try again.     │
│                             │
│ [ Verify & Proceed ]        │
└─────────────────────────────┘
```

This directly satisfies the project's form requirements: **validation + loading + error state + user feedback + retry path**. 

### 🏏 Ball 6 — OTP Error UI

**Change only `onboarding.tsx` for this ball.**

Don't modify `authAPI.tsx`, backend, navigation, or authentication persistence.

Test these three cases:

1. ✅ Correct 5-digit OTP → Survey
2. ❌ Wrong 5-digit OTP → inline error, **no popup**
3. ✏️ User edits OTP → error disappears

Once those three pass, this OTP error-handling ball is complete.
