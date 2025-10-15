# 🎯 Smart Figma Link Templates with User Guidance

## Enhanced Solution
Instead of showing "Link unavailable", the plugin now provides helpful templates and clear instructions for users to create the correct Figma links themselves.

## 🔗 **What Users Will See Now**

### ✅ **When File Key is Available**:
```
**Figma File:** [My Design File](https://www.figma.com/design/ABC123XYZ?node-id=7013-21642)
```

### 🛠️ **When File Key is Unavailable** (NEW):
```
**Figma File:** My Design File
**Figma Link:** `https://www.figma.com/design/[YOUR_FILE_KEY]?node-id=7013-21642`
**Instructions:** Replace `[YOUR_FILE_KEY]` with your actual Figma file key from the URL.
**How to find file key:** Copy your Figma file URL - it looks like `figma.com/design/ABC123XYZ/...` where `ABC123XYZ` is your file key.
```

### 📍 **Individual Frame Links**:
```
Frame 1: "Header Component"
- Direct Link: `https://www.figma.com/design/[YOUR_FILE_KEY]?node-id=7013-21642`
  (Replace `[YOUR_FILE_KEY]` with your Figma file key)
```

## 🎯 **Key Benefits**

1. **Preserves Correct Node IDs** - The `?node-id=7013-21642` part is always accurate
2. **Clear Instructions** - Users know exactly what to replace and how to find it
3. **Copy-Paste Ready** - Template URLs are easy to copy and modify
4. **Educational** - Teaches users about Figma URL structure
5. **Professional** - Tickets still contain useful link information

## 🧪 **User Workflow**

1. **Run the plugin** - generates ticket with template links
2. **Copy Figma file URL** - from browser address bar: `https://www.figma.com/design/ABC123XYZ/MyFile`
3. **Extract file key** - `ABC123XYZ` from the URL
4. **Replace in ticket** - Change `[YOUR_FILE_KEY]` to `ABC123XYZ`
5. **Result** - Working link: `https://www.figma.com/design/ABC123XYZ?node-id=7013-21642`

## 📋 **Example Final Ticket**
```markdown
## Design Implementation Ticket

**Figma File:** Homepage Design
**Figma Link:** `https://www.figma.com/design/[YOUR_FILE_KEY]?node-id=7013-21642`
**Instructions:** Replace `[YOUR_FILE_KEY]` with your actual Figma file key from the URL.

Frame 1: "Header Section"
- Direct Link: `https://www.figma.com/design/[YOUR_FILE_KEY]?node-id=7013-21642`
  (Replace `[YOUR_FILE_KEY]` with your Figma file key)
```

This approach turns a limitation into a helpful guide, ensuring users can always create working Figma links!