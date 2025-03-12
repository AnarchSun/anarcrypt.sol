#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod anaheim {
    use super::*;

  pub fn close(_ctx: Context<CloseAnaheim>) -> Result<()> {
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.anaheim.count = ctx.accounts.anaheim.count.checked_sub(1).unwrap();
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.anaheim.count = ctx.accounts.anaheim.count.checked_add(1).unwrap();
    Ok(())
  }

  pub fn initialize(_ctx: Context<InitializeAnaheim>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
    ctx.accounts.anaheim.count = value.clone();
    Ok(())
  }
}

#[derive(Accounts)]
pub struct InitializeAnaheim<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 8 + Anaheim::INIT_SPACE,
  payer = payer
  )]
  pub anaheim: Account<'info, Anaheim>,
  pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseAnaheim<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
  pub anaheim: Account<'info, Anaheim>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub anaheim: Account<'info, Anaheim>,
}

#[account]
#[derive(InitSpace)]
pub struct Anaheim {
  count: u8,
}
