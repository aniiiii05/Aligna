# Auth Testing Playbook for Aligna

## Step 1: Create Test User & Session
```bash
mongosh --eval "
use('test_database');
var userId = 'test-user-' + Date.now();
var sessionToken = 'test_session_' + Date.now();
db.users.insertOne({
  user_id: userId,
  email: 'test.user.' + Date.now() + '@example.com',
  name: 'Test User',
  picture: 'https://via.placeholder.com/150',
  plan: 'free',
  subscription_status: 'inactive',
  created_at: new Date()
});
db.user_sessions.insertOne({
  user_id: userId,
  session_token: sessionToken,
  expires_at: new Date(Date.now() + 7*24*60*60*1000),
  created_at: new Date()
});
print('Session token: ' + sessionToken);
print('User ID: ' + userId);
"
```

## Step 2: Test Backend API
```bash
# Test auth endpoint
curl -X GET "https://manifest-align-1.preview.emergentagent.com/api/auth/me" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN"

# Test goals endpoint
curl -X POST "https://manifest-align-1.preview.emergentagent.com/api/goals" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SESSION_TOKEN" \
  -d '{"title": "Financial Abundance", "affirmation": "I am a money magnet", "category": "abundance"}'
```

## Step 3: Browser Testing
```javascript
await page.context().addCookies([{
    name: "session_token",
    value: "YOUR_SESSION_TOKEN",
    domain: "manifest-align-1.preview.emergentagent.com",
    path: "/",
    httpOnly: true,
    secure: true,
    sameSite: "None"
}]);
await page.goto("https://manifest-align-1.preview.emergentagent.com");
```

## Quick Debug
```bash
mongosh --eval "
use('test_database');
db.users.find().limit(2).pretty();
db.user_sessions.find().limit(2).pretty();
"
```

## Checklist
- [ ] User document has user_id field
- [ ] Session user_id matches user's user_id
- [ ] All queries use {"_id": 0} projection
- [ ] /api/auth/me returns user data
- [ ] Dashboard loads without redirect
- [ ] CRUD operations work
