'use client'

import { getAnaheimProgram, getAnaheimProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'

export function useAnaheimProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getAnaheimProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getAnaheimProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['anaheim', 'all', { cluster }],
    queryFn: () => program.account.anaheim.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['anaheim', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ anaheim: keypair.publicKey }).signers([keypair]).rpc(),
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

export function useAnaheimProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useAnaheimProgram()

  const accountQuery = useQuery({
    queryKey: ['anaheim', 'fetch', { cluster, account }],
    queryFn: () => program.account.anaheim.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['anaheim', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ anaheim: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['anaheim', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ anaheim: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['anaheim', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ anaheim: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['anaheim', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ anaheim: account }).rpc(),
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
