# SkillUs

## Περιγραφή
Το SkillUs είναι μια διαδικτυακή πλατφόρμα ανταλλαγής και αγοράς δεξιοτήτων. Επιτρέπει σε κάθε χρήστη να δημοσιεύει ή να αναζητά δεξιότητες, να προσφέρει μαθήματα είτε ως αμοιβή είτε ως ανταλλαγή (skill swap), και να βρίσκει αξιόπιστους εκπαιδευτές ή μαθητές.

## Σκοπός
Το SkillUs συνδέει τους ανθρώπους που έχουν μια δεξιότητα με αυτούς που θέλουν να την αποκτήσουν.
Η ιδέα είναι να δημιουργηθεί μια κοινότητα αμφίδρομης μάθησης, όπου ο κάθε χρήστης μπορεί να είναι ταυτόχρονα "δάσκαλος" και "μαθητής".

## Τι δεν είναι
- Δεν είναι MOOCs με προκατασκευασμένα μαθήματα ή πιστοποιήσεις.
- Δεν είναι πλατφόρμα freelancing όπως Upwork.
- Δεν παρέχει εκπαιδευτικό περιεχόμενο απευθείας, αλλά συνδέει κατόχους δεξιοτήτων με ενδιαφερόμενους.

## Τεχνολογίες - Εργαλεία
- React
- Vite
- Tailwind CSS
- Radix UI
- React Router
- Lucide icons
- TypeScript
- Express
- PostgreSQL
- pg (node-postgres)
- bcrypt
- express-session
- Microsoft Word
- ClickUp (Οργάνωση task)
- Vs Code
- Figma
- Railway (Hosting)

## Δομή έργου
- `Code/src/app/components`: React components UI
- `Code/src/app/types.ts`: τύποι και domain model
- `Code/public`: στατικά αρχεία assets (π.χ. `skillus-logo.png`)
- `Code/index.html`: κεντρικό HTML αρχείο εφαρμογής
- `Code/server/controllers`: backend controllers (Auth, Listings, Sessions, Reviews, Skills)
- `Code/server/routes`: Express API routes
- `Code/server/db`: σύνδεση PostgreSQL (Railway), schema και seed δεδομένων
- `Code/server/middleware`: middleware διαχείρισης σφαλμάτων

Το hosting της πλατφόρμας γίνεται στο Railway και υπάρχει πρόσβαση στους χρήστες μέσω της παρακάτω διεύθυνσης https://projectsoftwaretechnology-production.up.railway.app

## Demo λογαριασμοί
Διαθέσιμοι λογαριασμοί δοκιμής στο αρχείο `demo_credentials.txt`.

## Ομάδα έργου
- Αγγελής Γιώργος — Contributor, Peer Reviewer
- Αγγελόπουλος Μιχάλης — Contributor, Peer Reviewer
- Γιαννακόπουλος Σωτήρης — Contributor, Peer Reviewer
- Πετρόπουλος Γιώργος — Contributor, Peer Reviewer
- Φουσέκης Πέτρος — Editor, Contributor

## Screenshots

- `home screen.png` — αρχική σελίδα / αναζήτηση δεξιοτήτων
- `profile screen.png` — προφίλ χρήστη
- `post your skill.png` — φόρμα ανάρτησης νέας δεξιότητας
- `offered skill view.png` — προβολή δεξιότητας με επιλογή swap

## Τεκμηρίωση
Η βασική περιγραφή του έργου και οι use cases βρίσκονται στο αρχείο:
`Παραδοτέο 1/SkillUs_Project-description-v0.1.docx`

## Κύριες λειτουργίες
- Αναζήτηση δεξιοτήτων με φίλτρα και κατηγορίες
- Προβολή αγγελιών και λεπτομέρειες δεξιοτήτων
- Δημιουργία νέας αγγελίας για προσφορά ή αίτημα
- Επισήμανση "Swap Available" για ανταλλαγές δεξιοτήτων
- Εγγραφή και σύνδεση χρηστών με session-based authentication
- Προβολή προφίλ χρήστη με δεξιότητες, αξιολογήσεις και sessions
- Προβολή και διαχείριση προγραμματισμένων συνεδριών
- Σύστημα μηνυμάτων μεταξύ χρηστών (συνομιλίες, αποστολή/λήψη)
- Αξιολογήσεις (reviews) μετά από ολοκληρωμένες συνεδρίες
- Ειδοποιήσεις (notifications) για νέα μηνύματα και αιτήματα
- Σύστημα προσφορών (offers) και skill swaps
- Πληρωμές με μηχανισμό escrow (κράτηση & αποδέσμευση)
