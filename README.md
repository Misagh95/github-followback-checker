# 🔍 GitHub FollowBack Checker

> 🚀 A lightweight, zero-backend tool to compare who you follow on GitHub with who follows you back.

![GitHub FollowBack Checker](https://img.shields.io/badge/🚀-FollowBack-Checker-blue?style=for-the-badge)
![License](https://img.shields.io/badge/license-MIT-green?style=for-the-badge)
![Node](https://img.shields.io/badge/node-20+-brightgreen?style=for-the-badge)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 📊 **Smart Analytics** | See mutual connections, followers, and non-followers at a glance |
| 🔄 **Auto Unfollow** | Automatically unfollow users who don't follow back (every 72 hours) |
| 🔎 **Search & Sort** | Find and organize your non-follower list easily |
| 📁 **Export Options** | Download results as CSV or JSON |
| 🔐 **Token Support** | Optional Personal Access Token for higher API limits |
| 🚫 **Exclusion List** | Protect specific users from being auto-unfollowed |
| 🎯 **Dry Run Mode** | Preview who would be unfollowed before taking action |

---

## 🏃‍♂️ Quick Start

```bash
# 📥 Clone the repository
git clone https://github.com/Misagh95/github-followback-checker.git

# 📂 Navigate to the project
cd github-followback-checker

# 🌐 Open in browser
open index.html
```

> 💡 **No build step required!** Just open `index.html` in any browser or serve it with any static web server.

---

## 🛠️ How It Works

### 🌐 Web Interface

1. 📝 Enter your GitHub username
2. 🔑 (Optional) Add a Personal Access Token for higher rate limits
3. 🖱️ Click "Check" (بررسی کن)
4. 📈 View your stats and non-follower list
5. 📤 Export to CSV or JSON if needed

### ⚡ Auto Unfollow (GitHub Actions)

The script runs automatically every **72 hours** via GitHub Actions:

```
📅 Schedule: Every 3 days at 00:00 UTC
🎯 Max unfollows per run: 25
🚫 Exclusion list: Configurable
🔒 Dry run: Disabled (real unfollows)
```

---

## ⚙️ Configuration

### 🔐 Repository Secrets

| Secret | Description | Required |
|--------|-------------|----------|
| 🎫 `AUTO_UNFOLLOW_TOKEN` | GitHub Personal Access Token with `user:follow` scope | ✅ Yes |

### 📊 Repository Variables

| Variable | Description | Required |
|----------|-------------|----------|
| 👤 `GITHUB_USERNAME` | Your GitHub username (auto-detected if empty) | ❌ No |
| 🚫 `EXCLUDE_USERS` | Comma-separated list of users to never unfollow | ❌ No |

### 🎛️ Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| 🏃 `DRY_RUN` | `true` | Set to `false` to actually unfollow users |
| 🔢 `MAX_UNFOLLOWS` | `25` | Max accounts to unfollow per run (0 = unlimited) |

---

## 📋 Example: Setting Up Auto Unfollow

### Step 1️⃣: Create a Personal Access Token

1. 🔑 Go to GitHub Settings → Developer settings → Personal access tokens
2. ➕ Generate new token (classic)
3. ✅ Select scope: `user:follow`
4. 💾 Copy the token

### Step 2️⃣: Add Repository Secret

1. 📁 Go to your repository → Settings → Secrets and variables → Actions
2. ➕ Add new repository secret
3. 📝 Name: `AUTO_UNFOLLOW_TOKEN`
4. 🔒 Value: *your token*

### Step 3️⃣: (Optional) Add Exclusion List

1. 📊 Go to Settings → Secrets and variables → Actions → Variables
2. ➕ Add new repository variable
3. 📝 Name: `EXCLUDE_USERS`
4. 📋 Value: `user1,user2,user3`

---

## 🔒 Privacy & Security

| Aspect | Status |
|--------|--------|
| 🌐 Data Source | GitHub Public API |
| 💾 Storage | ❌ Nothing stored on our end |
| 🔐 Token Usage | ✅ Only used for your browser requests |
| 🛡️ Best Practice | Create tokens with minimal permissions and revoke after use |

> ⚠️ **Security Tip:** Always create tokens with the minimum required permissions and revoke them after use!

---

## ⚠️ Rate Limits

| Request Type | Limit |
|-------------|-------|
| 🔓 Unauthenticated | 60 requests/hour |
| 🔑 Authenticated | 5,000 requests/hour |

> 💡 If you see a `403` error, wait a few minutes or add a low-permission token.

---

## 📁 Project Structure

```
📦 github-followback-checker
├── 📄 index.html          # 🏠 Main HTML page
├── 🎨 styles.css          # 🖌️ Styling
├── ⚡ app.js              # 🔧 Frontend logic
├── 📜 README.md           # 📖 Documentation
├── 🚫 .gitignore          # 🙈 Ignored files
├── 📂 .github/
│   └── 📂 workflows/
│       └── ⚡ auto-unfollow.yml  # 🔄 Auto unfollow workflow
└── 📂 scripts/
    └── 🚀 auto-unfollow.mjs     # 🎯 Unfollow script
```

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

- 🐛 Report bugs
- 💡 Suggest new features
- 🔧 Submit pull requests

---

## 📜 License

MIT License - Feel free to use and modify! 🎉

---

## 🙏 Support

If you find this tool helpful:

- ⭐ Star the repository
- 🐛 Report any issues
- 💬 Share with friends

---

**Made with ❤️ for the GitHub community**
