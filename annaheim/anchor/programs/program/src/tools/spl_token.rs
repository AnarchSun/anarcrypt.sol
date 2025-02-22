use solana_program::{
    account_info::AccountInfo,
    entrypoint::ProgramResult,
    program::{invoke, invoke_signed},
    program_pack::Pack,
    pubkey::Pubkey,
    rent::Rent,
    sysvar::Sysvar,
};
use spl_token::{
    instruction,
    state::{Account, Mint},
};

/// Fonction pour créer un compte token.
pub fn create_token_account<'a>(
    payer_info: &AccountInfo<'a>,
    token_account_info: &AccountInfo<'a>,
    token_account_owner_info: &Pubkey,
    token_mint_info: &AccountInfo<'a>,
    rent_info: &AccountInfo<'a>,
    system_program_info: &AccountInfo<'a>,
    token_program_info: &AccountInfo<'a>,
    program_id: &Pubkey,
    seeds: &[&[&[u8]]], // Ensemble de seeds pour signer si nécessaire
) -> ProgramResult {
    let rent = &Rent::from_account_info(rent_info)?;

    let lamports = rent.minimum_balance(Account::LEN);

    let create_ix = solana_program::system_instruction::create_account(
        payer_info.key,
        token_account_info.key,
        lamports,
        Account::LEN as u64,
        &token_program_info.key,
    );

    // Invoquer la transaction pour créer un compte token
    if seeds.is_empty() {
        invoke(
            &create_ix,
            &[
                payer_info.clone(),
                token_account_info.clone(),
                system_program_info.clone(),
            ],
        )?;
    } else {
        invoke_signed(
            &create_ix,
            &[
                payer_info.clone(),
                token_account_info.clone(),
                system_program_info.clone(),
            ],
            seeds,
        )?;
    }

    // Initialiser le compte de token
    let init_ix = instruction::initialize_account(
        &spl_token::id(),
        token_account_info.key,
        token_mint_info.key,
        token_account_owner_info,
    )?;

    invoke(
        &init_ix,
        &[
            token_account_info.clone(),
            token_mint_info.clone(),
            system_program_info.clone(),
            rent_info.clone(),
        ],
    )?;

    Ok(())
}

/// Vérifie si le compte est un compte SPL Token valide
pub fn assert_token_account(
    token_account_info: &AccountInfo,
    owner_pubkey: &Pubkey,
    mint_pubkey: &Pubkey,
) -> Result<Account, ProgramError> {
    if token_account_info.owner != &spl_token::id() {
        return Err(ProgramError::IncorrectProgramId);
    }

    let token_account = Account::unpack(&token_account_info.data.borrow())?;

    if &token_account.owner != owner_pubkey {
        return Err(ProgramError::IllegalOwner);
    }

    if &token_account.mint != mint_pubkey {
        return Err(ProgramError::InvalidAccountData);
    }

    Ok(token_account)
}

/// Transfert d'un montant entre deux comptes SPL Token
pub fn token_transfer(
    source: &AccountInfo,
    destination: &AccountInfo,
    authority: &AccountInfo,
    signer_seeds: &[&[&[u8]]],
    token_program: &AccountInfo,
    amount: u64,
) -> ProgramResult {
    let ix = instruction::transfer(
        &spl_token::id(),
        source.key,
        destination.key,
        authority.key,
        &[],
        amount,
    )?;

    if signer_seeds.is_empty() {
        invoke(&ix, &[source.clone(), destination.clone(), authority.clone(), token_program.clone()])
    } else {
        invoke_signed(
            &ix,
            &[source.clone(), destination.clone(), authority.clone(), token_program.clone()],
            signer_seeds,
        )
    }
}