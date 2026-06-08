# Firestore Security Specification: Chat System

## 1. Data Invariants
- A conversation must exist between exactly two participants.
- A message cannot exist without a valid parent conversation that the user is a participant of.
- Read receipts are restricted to the participant of the conversation who is not the sender.
- Messages are immutable once created.

## 2. "Dirty Dozen" Payloads
1.  **Orphan Message**: Create a message without a valid parent conversation.
2.  **Unauthorized Access**: Read messages from a conversation where the user is not a participant.
3.  **Spoofed Sender**: Create a message with a `senderId` that is not the current user's UID.
4.  **Field Injection**: Create a message with an extra `isVerified: true` field.
5.  **Invalid Timestamp**: Create a message with a client-supplied `timestamp` from the future.
6.  **Read Receipt Toggling**: Attempt to update a message `status` to `seen` when the user is not the recipient.
7.  **Conversation Hijacking**: Update `participants` list in `Conversation` collection to add a third user.
8.  **Empty Message**: Create a message with an empty `text` string (enforcing constraints).
9.  **Conversation ID Poisoning**: Access `/conversations/1.5KB_of_junk_characters_...`
10. **State Mutation**: Attempt to update an existing message text.
11. **PII Injection**: Add an `email` field to a conversation partner's object if it was stored there.
12. **The "Shadow" Write**: Attempt to create a document in `/conversations` as a non-authenticated user.

## 3. Test Runner
Will be implemented in `firestore.rules.test.ts`.
