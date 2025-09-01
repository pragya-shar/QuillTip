#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, vec, Address, Env, Symbol, Vec};

#[derive(Clone)]
#[contracttype]
pub struct SimpleTip {
    pub tipper: Address,
    pub amount: i128,
    pub timestamp: u64,
}

#[derive(Clone)]
#[contracttype]
pub struct TipReceipt {
    pub tip_id: u64,
    pub amount_sent: i128,
    pub author_received: i128,
    pub platform_fee: i128,
    pub timestamp: u64,
}

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Admin,
    PlatformAddress,
    PlatformFeeBps,
    ArticleTips(Symbol),
    ArticleTotalTips(Symbol),  // Track total tips per article for NFT threshold
    AuthorBalance(Address),
    TipCounter,
    TotalVolume,
}

const MINIMUM_TIP_STROOPS: i128 = 100_000; // 0.01 XLM (approximately 1 cent)
const DEFAULT_PLATFORM_FEE_BPS: u32 = 250; // 2.5%

#[contract]
pub struct TippingContract;

#[contractimpl]
impl TippingContract {
    /// Initialize the contract with platform settings
    pub fn initialize(env: Env, admin: Address, platform_address: Address, fee_bps: Option<u32>) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Contract already initialized");
        }
        
        admin.require_auth();
        
        let platform_fee = fee_bps.unwrap_or(DEFAULT_PLATFORM_FEE_BPS);
        
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::PlatformAddress, &platform_address);
        env.storage().instance().set(&DataKey::PlatformFeeBps, &platform_fee);
        env.storage().persistent().set(&DataKey::TipCounter, &0u64);
        env.storage().persistent().set(&DataKey::TotalVolume, &0i128);
    }
    
    /// Send a tip for an article
    pub fn tip_article(
        env: Env,
        tipper: Address,
        article_id: Symbol,
        author: Address,
        amount: i128,
    ) -> TipReceipt {
        tipper.require_auth();
        
        // Validate minimum amount
        if amount < MINIMUM_TIP_STROOPS {
            panic!("Amount below minimum tip");
        }
        
        // Get platform settings
        let platform_address: Address = env.storage()
            .instance()
            .get(&DataKey::PlatformAddress)
            .expect("Platform address not set");
        
        let platform_fee_bps: u32 = env.storage()
            .instance()
            .get(&DataKey::PlatformFeeBps)
            .unwrap_or(DEFAULT_PLATFORM_FEE_BPS);
        
        // Calculate fees
        let platform_fee = (amount * platform_fee_bps as i128) / 10_000;
        let author_share = amount - platform_fee;
        
        // For POC, we'll use a simpler approach - direct transfers
        // In production, you'd use the actual XLM token contract
        // let _token_address = env.current_contract_address();
        
        // Update author balance (for POC, we track balances internally)
        let current_balance: i128 = env.storage()
            .persistent()
            .get(&DataKey::AuthorBalance(author.clone()))
            .unwrap_or(0);
        
        env.storage()
            .persistent()
            .set(&DataKey::AuthorBalance(author.clone()), &(current_balance + author_share));
        
        // Update platform balance
        let platform_balance: i128 = env.storage()
            .persistent()
            .get(&DataKey::AuthorBalance(platform_address.clone()))
            .unwrap_or(0);
        
        env.storage()
            .persistent()
            .set(&DataKey::AuthorBalance(platform_address.clone()), &(platform_balance + platform_fee));
        
        // Get and increment tip counter
        let tip_counter: u64 = env.storage()
            .persistent()
            .get(&DataKey::TipCounter)
            .unwrap_or(0);
        
        let new_tip_id = tip_counter + 1;
        env.storage().persistent().set(&DataKey::TipCounter, &new_tip_id);
        
        // Store tip data
        let tip = SimpleTip {
            tipper: tipper.clone(),
            amount,
            timestamp: env.ledger().timestamp(),
        };
        
        // Get existing tips for article
        let mut article_tips: Vec<SimpleTip> = env.storage()
            .persistent()
            .get(&DataKey::ArticleTips(article_id.clone()))
            .unwrap_or(vec![&env]);
        
        article_tips.push_back(tip);
        
        env.storage()
            .persistent()
            .set(&DataKey::ArticleTips(article_id.clone()), &article_tips);
        
        // Update article total tips (for NFT threshold checking)
        let current_article_total: i128 = env.storage()
            .persistent()
            .get(&DataKey::ArticleTotalTips(article_id.clone()))
            .unwrap_or(0);
        
        env.storage()
            .persistent()
            .set(&DataKey::ArticleTotalTips(article_id.clone()), &(current_article_total + amount));
        
        // Update total volume
        let total_volume: i128 = env.storage()
            .persistent()
            .get(&DataKey::TotalVolume)
            .unwrap_or(0);
        
        env.storage()
            .persistent()
            .set(&DataKey::TotalVolume, &(total_volume + amount));
        
        // Create receipt
        TipReceipt {
            tip_id: new_tip_id,
            amount_sent: amount,
            author_received: author_share,
            platform_fee,
            timestamp: env.ledger().timestamp(),
        }
    }
    
    /// Get all tips for an article
    pub fn get_article_tips(env: Env, article_id: Symbol) -> Vec<SimpleTip> {
        env.storage()
            .persistent()
            .get(&DataKey::ArticleTips(article_id))
            .unwrap_or(vec![&env])
    }
    
    /// Get author's balance
    pub fn get_balance(env: Env, author: Address) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::AuthorBalance(author))
            .unwrap_or(0)
    }
    
    /// Get total tips for an article (for NFT threshold checking)
    pub fn get_article_total_tips(env: Env, article_id: Symbol) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::ArticleTotalTips(article_id))
            .unwrap_or(0)
    }
    
    /// Check if article has reached NFT minting threshold
    pub fn is_nft_eligible(env: Env, article_id: Symbol, threshold: i128) -> bool {
        let total_tips = Self::get_article_total_tips(env, article_id);
        total_tips >= threshold
    }
    
    /// Withdraw earnings (simplified for POC)
    pub fn withdraw_earnings(env: Env, author: Address) -> i128 {
        author.require_auth();
        
        let balance: i128 = env.storage()
            .persistent()
            .get(&DataKey::AuthorBalance(author.clone()))
            .unwrap_or(0);
        
        if balance == 0 {
            panic!("No balance to withdraw");
        }
        
        // Reset balance
        env.storage()
            .persistent()
            .set(&DataKey::AuthorBalance(author.clone()), &0i128);
        
        // In production, this would trigger an actual XLM transfer
        // For POC, we just return the amount that would be withdrawn
        
        balance
    }
    
    /// Get total tips volume
    pub fn get_total_volume(env: Env) -> i128 {
        env.storage()
            .persistent()
            .get(&DataKey::TotalVolume)
            .unwrap_or(0)
    }
    
    /// Update platform fee (admin only)
    pub fn update_fee(env: Env, admin: Address, new_fee_bps: u32) {
        admin.require_auth();
        
        let stored_admin: Address = env.storage()
            .instance()
            .get(&DataKey::Admin)
            .expect("Admin not set");
        
        if admin != stored_admin {
            panic!("Unauthorized");
        }
        
        if new_fee_bps > 1000 { // Max 10%
            panic!("Fee too high");
        }
        
        env.storage()
            .instance()
            .set(&DataKey::PlatformFeeBps, &new_fee_bps);
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, symbol_short, Env};

    #[test]
    fn test_initialize() {
        let env = Env::default();
        env.mock_all_auths();
        
        let contract_id = env.register(TippingContract, ());
        let client = TippingContractClient::new(&env, &contract_id);
        
        let admin = Address::generate(&env);
        let platform = Address::generate(&env);
        
        client.initialize(&admin, &platform, &Some(250));
        
        // Verify initialization
        let volume = client.get_total_volume();
        assert_eq!(volume, 0);
    }
    
    #[test]
    fn test_tip_article() {
        let env = Env::default();
        env.mock_all_auths();
        
        let contract_id = env.register(TippingContract, ());
        let client = TippingContractClient::new(&env, &contract_id);
        
        let admin = Address::generate(&env);
        let platform = Address::generate(&env);
        let tipper = Address::generate(&env);
        let author = Address::generate(&env);
        
        // Initialize contract
        client.initialize(&admin, &platform, &Some(250));
        
        // Send a tip
        let receipt = client.tip_article(
            &tipper,
            &symbol_short!("article1"),
            &author,
            &1_000_000, // 0.1 XLM
        );
        
        // Verify receipt
        assert_eq!(receipt.amount_sent, 1_000_000);
        assert_eq!(receipt.platform_fee, 25_000); // 2.5%
        assert_eq!(receipt.author_received, 975_000); // 97.5%
        
        // Check author balance
        let balance = client.get_balance(&author);
        assert_eq!(balance, 975_000);
        
        // Check tips for article
        let tips = client.get_article_tips(&symbol_short!("article1"));
        assert_eq!(tips.len(), 1);
    }
    
    #[test]
    #[should_panic(expected = "Amount below minimum tip")]
    fn test_minimum_tip_enforcement() {
        let env = Env::default();
        env.mock_all_auths();
        
        let contract_id = env.register(TippingContract, ());
        let client = TippingContractClient::new(&env, &contract_id);
        
        let admin = Address::generate(&env);
        let platform = Address::generate(&env);
        let tipper = Address::generate(&env);
        let author = Address::generate(&env);
        
        client.initialize(&admin, &platform, &Some(250));
        
        // Try to send tip below minimum
        client.tip_article(
            &tipper,
            &symbol_short!("article1"),
            &author,
            &50_000, // Below minimum
        );
    }
    
    #[test]
    fn test_withdraw_earnings() {
        let env = Env::default();
        env.mock_all_auths();
        
        let contract_id = env.register(TippingContract, ());
        let client = TippingContractClient::new(&env, &contract_id);
        
        let admin = Address::generate(&env);
        let platform = Address::generate(&env);
        let tipper = Address::generate(&env);
        let author = Address::generate(&env);
        
        client.initialize(&admin, &platform, &Some(250));
        
        // Send tips
        client.tip_article(&tipper, &symbol_short!("art1"), &author, &1_000_000);
        client.tip_article(&tipper, &symbol_short!("art2"), &author, &2_000_000);
        
        // Check balance before withdrawal
        let balance = client.get_balance(&author);
        assert_eq!(balance, 975_000 + 1_950_000); // 97.5% of each tip
        
        // Withdraw
        let withdrawn = client.withdraw_earnings(&author);
        assert_eq!(withdrawn, 2_925_000);
        
        // Check balance after withdrawal
        let new_balance = client.get_balance(&author);
        assert_eq!(new_balance, 0);
    }
}