# Security Specification & Test Payloads

## 1. Data Invariants
1. Orders must have a non-empty `id`, positive `total`, valid `status`, and valid `orderNumber`.
2. Menu items must have non-negative `stock`, valid `id`, `name`, and valid `category`.
3. Purchases must have positive `quantity`, positive `pricePerUnit`, and positive `totalCost`.
4. Connected devices must have valid `id`, `name`, and recognized `status` ('active' | 'disabled' | 'pending_approval').
5. Staff records must have an agreed positive salary, emergency contact phone, and valid name.
6. Settings must define restaurant name, currency, and owner email matching the system owner.
7. Only authenticated users or authorized devices can query records, and admin configurations require admin or owner identity.

## 2. Dirty Dozen Invariant & Security Payloads
1. Spoofed Role in Profile: User setting their own claim to `isAdmin: true` inside a non-admin document.
2. Negative Stock Mutation: Attempt to set item `stock: -50`.
3. Negative Order Total: Attempt to create order with `total: -5000`.
4. Huge String / Denial of Wallet: Injecting 2MB string into `customerName` or `notes`.
5. Invalid Status Step: Order bypassing 'pending'/'preparing' and forcing status to an arbitrary string.
6. Unauthorized Settings Overwrite: An anonymous user overwriting master admin passwords.
7. Invalid ID characters: Document ID with path traversal or illegal symbols `../../system`.
8. Ghost Fields: Attacker attempting to insert unapproved keys into purchases document.
9. Staff Salary Tampering: Client trying to forge an arbitrary staff salary amount.
10. Fraudulent Payment Reference: Attempt to fabricate M-Pesa transaction with arbitrary negative amount.
11. Device Spoofing: Attempt to mark a pending device as active without admin authorization.
12. Terminal State Rewrite: Attempting to edit a deleted or completed order after final settlement.
