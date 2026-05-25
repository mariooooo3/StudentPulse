# Bug Fixes — StudentPulse

Documentație pentru toate modificările aplicate în sesiunea de debugging.

---

## 1. Emoji-uri garbled în Onboarding

**Fișier:** `src/features/onboarding/hooks/useOnboardingFlow.js`

**Problemă:** Emoji-urile din pașii de onboarding erau salvate cu encoding greșit (UTF-8 bytes interpretați ca Latin-1 = mojibake).

**Fix:** Înlocuite toate cele 6 emoji-uri cu caracterele Unicode corecte: `🎓 🖥️ 📅 💡 🔍 ⭐`

---

## 2. Săgeată garbled în lista "Primii pași" (Onboarding Done Screen)

**Fișier:** `src/features/onboarding/components/OnboardingDoneScreen.jsx`

**Problemă:** Săgeata `→` din lista de sarcini urgente se afișa ca `â†'`.

**Fix:** Înlocuit cu caracterul Unicode corect `→`.

---

## 3. Săgeată garbled în legenda RecoveryGrid

**Fișier:** `src/features/schedule/components/RecoveryGrid.jsx`

**Problemă:** Aceeași problemă de encoding pentru `→` în textul legendei grilei de recuperări.

**Fix:** Înlocuit `â†'` cu `→`.

---

## 4. Race condition la autentificare — Back în timpul VERIFYING

**Fișier:** `src/features/auth/AuthFlow.jsx`

**Problemă:** Dacă utilizatorul apăsa înapoi în timpul spinner-ului de 2.6s, funcția asincronă continua și forța navigarea la CONFIRMED.

**Fix:** Adăugat `submitIdRef` (contor de operații). Funcția verifică înainte de `setStep(CONFIRMED)` dacă operația mai este validă.

---

## 5. Butonul Back afișat pe pași greșiți

**Fișier:** `src/features/auth/AuthFlow.jsx`

**Problemă:** Back-ul era vizibil pe VERIFYING și CONFIRMED, ducând la stări confuze.

**Fix:** Butonul Back apare **doar** pe pasul ENTER_EMAIL.

---

## 6. `isNewUser` mereu `true`

**Fișier:** `src/features/auth/AuthFlow.jsx`

**Problemă:** `isNewUser: true` era hardcodat chiar și pentru utilizatorii existenți.

**Fix:** `isNewUser: !isReturning`

---

## 7. `handleDemoSkip` — funcție moartă eliminată

**Fișier:** `src/features/auth/AuthFlow.jsx`

**Problemă:** Funcția era definită dar nu era conectată la niciun element UI.

**Fix:** Funcția eliminată complet.

---

## 8. Butonul Back din "Viața în Oraș" nu făcea nimic

**Fișier:** `src/features/city/CityAdaptation.jsx`

**Problemă:** `onBack={() => {}}` — callback gol.

**Fix:** `onBack={() => onNavigate('discounts', 'life')}`

---

## 9. `session` nu era transmis la StudentTransport

**Fișiere:** `src/features/city/CityAdaptation.jsx`, `src/features/city/StudentTransport.jsx`

**Problemă:** Universitatea din session nu era folosită pentru lookup-ul datelor de transport, ducând la afișarea transportului DEFAULT.

**Fix:** Adăugat `session` ca prop și extins fallback-ul: `profile?.university?.id || session?.university?.id`

---

## 10. "Acceptă swap" fără efect pe server

**Fișier:** `src/features/schedule/components/SlotSwapView.jsx`

**Problemă:** La acceptarea unui match, se schimba doar starea UI locală. Niciun apel la server, nicio notificare.

**Fix:** Adăugat `socketService.submitSwap()` și `onNotify()` la acceptare.

---

## 11. Badge shortcut `⌘K` afișat pe Windows/Linux

**Fișier:** `src/app/layout/Header.jsx`

**Problemă:** Badge-ul afișa mereu `⌘K` (Mac) indiferent de platformă.

**Fix:** Detectare platformă — afișează `⌘K` pe Mac și `Ctrl+K` pe Windows/Linux.

---

## Fișiere modificate

| Fișier | Buguri rezolvate |
|--------|-----------------|
| `src/features/onboarding/hooks/useOnboardingFlow.js` | #1 |
| `src/features/onboarding/components/OnboardingDoneScreen.jsx` | #2 |
| `src/features/schedule/components/RecoveryGrid.jsx` | #3 |
| `src/features/auth/AuthFlow.jsx` | #4, #5, #6, #7 |
| `src/features/city/CityAdaptation.jsx` | #8, #9 |
| `src/features/city/StudentTransport.jsx` | #9 |
| `src/features/schedule/components/SlotSwapView.jsx` | #10 |
| `src/app/layout/Header.jsx` | #11 |
