# QuillTip Smart Contracts

## Overview

This directory contains the Stellar Soroban smart contracts for QuillTip's micro-tipping system.

## Contracts

### Tipping Contract (`/tipping`)

A minimal proof-of-concept smart contract for article-level micro-tipping.

**Key Features:**

- 1¢ minimum tip (100,000 stroops)
- 2.5% platform fee (configurable)
- 97.5% goes to content creators
- Simple balance tracking
- Manual withdrawal system

**Functions:**

- `initialize`: Set up the contract with admin and platform addresses
- `tip_article`: Send a tip to an article author
- `get_article_tips`: Retrieve all tips for a specific article
- `get_balance`: Check an author's current balance
- `withdraw_earnings`: Withdraw accumulated tips
- `get_total_volume`: View total platform tip volume
- `update_fee`: Admin function to adjust platform fee

## Development

### Prerequisites

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Install Stellar CLI
cargo install --locked stellar-cli

# Add WebAssembly target
rustup target add wasm32-unknown-unknown
rustup target add wasm32v1-none
```

### Building

```bash
cd contracts/tipping
stellar contract build
```

### Testing

```bash
cd contracts/tipping
cargo test
```

### Deployment (Testnet)

```bash
# Deploy contract
stellar contract deploy \
  --wasm target/wasm32v1-none/release/quilltip_tipping.wasm \
  --source <YOUR_KEY> \
  --network testnet

# Initialize contract
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source <YOUR_KEY> \
  --network testnet \
  -- \
  initialize \
  --admin <ADMIN_ADDRESS> \
  --platform_address <PLATFORM_ADDRESS> \
  --fee_bps 250
```

## Architecture Decisions

### POC Simplifications

- **No granular tipping**: Article-level only (no word/sentence selection)
- **Internal balance tracking**: Simplified ledger without real XLM transfers
- **Manual withdrawals**: No automated payouts
- **Single contract**: All functionality in one contract for simplicity

### Production Considerations

Future enhancements for mainnet:

- Real XLM token integration
- Automated withdrawal scheduling
- Granular text coordinate tracking
- Heat map calculation on-chain
- Multi-sig admin controls
- Upgrade mechanisms

## Testing State

All core functions have unit tests covering:

- Contract initialization
- Tip sending with fee calculation
- Minimum tip enforcement
- Balance tracking
- Withdrawal functionality

Run tests with: `cargo test`

## Security Notes

This is a **proof-of-concept** implementation. For production:

- Add reentrancy guards
- Implement proper access controls
- Add emergency pause functionality
- Audit smart contract code
- Add upgrade mechanisms
- Implement proper XLM token transfers
