#![allow(clippy::result_large_err)]

use anchor_lang::prelude::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod annaheim {
    use super::*;

  pub fn close(_ctx: Context<CloseAnnaheim>) -> Result<()> {
    Ok(())
  }

  pub fn decrement(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.annaheim.count = ctx.accounts.annaheim.count.checked_sub(1).unwrap();
    Ok(())
  }

  pub fn increment(ctx: Context<Update>) -> Result<()> {
    ctx.accounts.annaheim.count = ctx.accounts.annaheim.count.checked_add(1).unwrap();
    Ok(())
  }

  pub fn initialize(_ctx: Context<InitializeAnnaheim>) -> Result<()> {
    Ok(())
  }

  pub fn set(ctx: Context<Update>, value: u8) -> Result<()> {
    ctx.accounts.annaheim.count = value.clone();
    Ok(())
  }
}

#[derive(Accounts)]
pub struct InitializeAnnaheim<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  init,
  space = 8 + Annaheim::INIT_SPACE,
  payer = payer
  )]
  pub annaheim: Account<'info, Annaheim>,
  pub system_program: Program<'info, System>,
}
#[derive(Accounts)]
pub struct CloseAnnaheim<'info> {
  #[account(mut)]
  pub payer: Signer<'info>,

  #[account(
  mut,
  close = payer, // close account and return lamports to payer
  )]
  pub annaheim: Account<'info, Annaheim>,
}

#[derive(Accounts)]
pub struct Update<'info> {
  #[account(mut)]
  pub annaheim: Account<'info, Annaheim>,
}

#[account]
#[derive(InitSpace)]
pub struct Annaheim {
  count: u8,
}
