# WiseWallet

A comprehensive personal finance management app built with React Native (Expo).

## Features

| Feature | Description |
|---------|-------------|
| 📊 **Dashboard** | Balance overview, income/expense summary, pie chart |
| 💰 **Transactions** | Add, Edit, Delete with receipt photos |
| 💳 **Payment Methods** | Track Cash, Card, Bank, E-Wallet |
| 📍 **Establishment** | Log where you spent (e.g., "Jollibee") |
| 🧾 **Receipts** | Attach photos via Camera or Gallery |
| 📅 **Calendar** | View transactions by date |
| 📈 **Reports** | Monthly comparison with bar charts |
| 💵 **Budgets** | Set limits with progress bars |
| 📋 **Agenda** | Reminders for scheduled payments |
| 💡 **Financial Tips** | Rotating money management advice |
| ⚙️ **Settings** | Currency toggle (₱ PHP / $ USD) |

## Tech Stack

- **Framework**: React Native + Expo
- **Language**: TypeScript
- **UI**: React Native Paper
- **Charts**: react-native-chart-kit
- **Calendar**: react-native-calendars
- **Camera**: expo-image-picker
- **API (Dev)**: json-server

## How to Run

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Mock Server

```bash
npm run server
```

> Keep this terminal open.

### 3. Start App

```bash
npm run web      # Browser
npm run android  # Android Emulator
npm run ios      # iOS Simulator (Mac only)
```

## App Navigation

From the Dashboard header:

| Icon | Screen | Purpose |
|------|--------|---------|
| 📅 | Calendar | View transactions by date |
| 📊 | Reports | Monthly comparison charts |
| 💰 | Budgets | Set spending limits |
| 📋 | Agenda | Reminders & scheduled payments |
| ⚙️ | Settings | Currency toggle |

## Screens Overview

- **Dashboard** - Main overview with balance, charts, tips
- **Add Transaction** - Full form with receipt, payment method
- **Transaction Details** - View all fields, edit, delete
- **Calendar** - Tap dates to see daily transactions
- **Reports** - This month vs last month comparison
- **Budgets** - Progress bars for spending limits
- **Agenda** - Checklist for scheduled payments
- **Settings** - Switch between PHP (₱) and USD ($)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Data not loading | Ensure `npm run server` is running |
| Network error (Android) | Use emulator or update IP in `hooks/useTransactions.ts` |
| Charts empty | Add some transactions first |
