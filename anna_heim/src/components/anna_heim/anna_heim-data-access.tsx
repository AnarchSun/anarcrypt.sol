'use client'

import { getAnnaHeimProgram, getAnnaHeimProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'

export function useAnnaHeimProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getAnnaHeimProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getAnnaHeimProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['anna_heim', 'all', { cluster }],
    queryFn: () => program.account.anna_heim.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['anna_heim', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ anna_heim: keypair.publicKey }).signers([keypair]).rpc(),
    onSuccess: (signature) => {
      transactionToast(signature)
      return accounts.refetch()
    },
    onError: () => toast.error('Failed to initialize account'),
  })

  return {
    program,
    programId,
    accounts,
    getProgramAccount,
    initialize,
  }
}

export function useAnnaHeimProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useAnnaHeimProgram()

  const accountQuery = useQuery({
    queryKey: ['anna_heim', 'fetch', { cluster, account }],
    queryFn: () => program.account.anna_heim.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['anna_heim', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ anna_heim: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['anna_heim', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ anna_heim: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['anna_heim', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ anna_heim: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['anna_heim', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ anna_heim: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  return {
    accountQuery,
    closeMutation,
    decrementMutation,
    incrementMutation,
    setMutation,
  }
}
