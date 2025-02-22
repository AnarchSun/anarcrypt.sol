'use client'

import { getAnnaheimProgram, getAnnaheimProgramId } from '@project/anchor'
import { useConnection } from '@solana/wallet-adapter-react'
import { Cluster, Keypair, PublicKey } from '@solana/web3.js'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import toast from 'react-hot-toast'
import { useCluster } from '../cluster/cluster-data-access'
import { useAnchorProvider } from '../solana/solana-provider'
import { useTransactionToast } from '../ui/ui-layout'

export function useAnnaheimProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getAnnaheimProgramId(cluster.network as Cluster), [cluster])
  const program = useMemo(() => getAnnaheimProgram(provider, programId), [provider, programId])

  const accounts = useQuery({
    queryKey: ['annaheim', 'all', { cluster }],
    queryFn: () => program.account.annaheim.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['annaheim', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ annaheim: keypair.publicKey }).signers([keypair]).rpc(),
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

export function useAnnaheimProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useAnnaheimProgram()

  const accountQuery = useQuery({
    queryKey: ['annaheim', 'fetch', { cluster, account }],
    queryFn: () => program.account.annaheim.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['annaheim', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ annaheim: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['annaheim', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ annaheim: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['annaheim', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ annaheim: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['annaheim', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ annaheim: account }).rpc(),
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
