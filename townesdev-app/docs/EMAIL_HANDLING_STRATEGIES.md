# Email-to-Incident Handling Strategies

## 🎯 **Current Configuration**

Your system is set to **reject unknown emails** (`HANDLE_UNKNOWN_EMAILS="false"`). This means:

✅ **Emails from known clients** → Create incidents automatically  
❌ **Emails from unknown senders** → Return 404, email stays in support inbox

## 📧 **Three Handling Strategies**

### **Strategy 1: Strict Client-Only (Current)**

```env
HANDLE_UNKNOWN_EMAILS="false"
```

**Best for:** Established businesses with known client base

- ✅ Clean incident queue
- ✅ No spam/noise
- ✅ Forces proper client onboarding
- ❌ Might miss legitimate inquiries
- ❌ Manual handling of unknown emails

### **Strategy 2: Accept All Emails**

```env
HANDLE_UNKNOWN_EMAILS="true"
# UNKNOWN_CLIENT_ID="" (leave empty - creates clientless incidents)
```

**Best for:** Growing businesses, open support

- ✅ Never miss an inquiry
- ✅ Complete audit trail
- ✅ Good for lead generation
- ❌ Potential spam incidents
- ❌ More manual sorting needed

### **Strategy 3: Unknown Client Bucket**

```env
HANDLE_UNKNOWN_EMAILS="true"
UNKNOWN_CLIENT_ID="your-unknown-client-bucket-id"
```

**Best for:** Organized unknown handling

- ✅ Structured unknown email handling
- ✅ Easy to review and sort
- ✅ Can track patterns from unknowns
- ❌ Requires creating "Unknown Clients" bucket
- ❌ Still need manual client assignment

## 🔧 **How to Change Strategy**

### **To Allow Unknown Emails:**

1. Edit `.env.local`:
   ```env
   HANDLE_UNKNOWN_EMAILS="true"
   ```
2. Restart your dev server
3. Test with non-client emails

### **To Create Unknown Client Bucket:**

1. In Sanity Studio, create a client called "Unknown Senders"
2. Copy its document ID
3. Add to `.env.local`:
   ```env
   UNKNOWN_CLIENT_ID="your-copied-id"
   ```

## 📊 **Testing Different Scenarios**

Your test page (`/test`) uses these test emails:

- `admin@acme.com` - Should match if client exists
- `client@example.com` - Should match if client exists
- `user@company.org` - Should match if client exists
- `random@nowhere.com` - Will test unknown handling

## 🎯 **Recommendations**

### **For Production Start:**

Use **Strategy 1** (current) - it's clean and forces proper client setup.

### **As You Grow:**

Consider **Strategy 3** - gives you organized unknown handling without chaos.

### **For High Volume:**

Use **Strategy 2** only if you have good spam filtering and staff to sort.

## 🔍 **What You See in Logs**

**Known Client Found:**

```
[Email Webhook] Found client via exact match: Acme Admin
[Email Webhook] Successfully created incident
```

**Unknown Client (Rejected):**

```
[Email Webhook] No client found for email: unknown@example.com
POST /api/email/inbound 404
```

**Unknown Client (Accepted):**

```
[Email Webhook] Creating incident for unknown sender: unknown@example.com
[Email Webhook] Creating clientless incident for unknown sender
```

The system is flexible - you can change strategies anytime by updating environment variables!
