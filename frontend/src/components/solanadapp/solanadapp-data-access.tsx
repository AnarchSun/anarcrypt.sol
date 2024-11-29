'use client'

import {getSolanadappProgram, getSolanadappProgramId} from '@project/anchor'
import {useConnection} from '@solana/wallet-adapter-react'
import {Cluster, Keypair, PublicKey} from '@solana/web3.js'
import {useMutation, useQuery} from '@tanstack/react-query'
import {useMemo} from 'react'
import toast from 'react-hot-toast'
import {useCluster} from '../cluster/cluster-data-access'
import {useAnchorProvider} from '../solana/solana-provider'
import {useTransactionToast} from '../ui/ui-layout'

export function useSolanadappProgram() {
  const { connection } = useConnection()
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const provider = useAnchorProvider()
  const programId = useMemo(() => getSolanadappProgramId(cluster.network as Cluster), [cluster])
  const program = getSolanadappProgram(provider)

  const accounts = useQuery({
    queryKey: ['solanadapp', 'all', { cluster }],
    queryFn: () => program.account.solanadapp.all(),
  })

  const getProgramAccount = useQuery({
    queryKey: ['get-program-account', { cluster }],
    queryFn: () => connection.getParsedAccountInfo(programId),
  })

  const initialize = useMutation({
    mutationKey: ['solanadapp', 'initialize', { cluster }],
    mutationFn: (keypair: Keypair) =>
      program.methods.initialize().accounts({ solanadapp: keypair.publicKey }).signers([keypair]).rpc(),
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

export function useSolanadappProgramAccount({ account }: { account: PublicKey }) {
  const { cluster } = useCluster()
  const transactionToast = useTransactionToast()
  const { program, accounts } = useSolanadappProgram()

  const accountQuery = useQuery({
    queryKey: ['solanadapp', 'fetch', { cluster, account }],
    queryFn: () => program.account.solanadapp.fetch(account),
  })

  const closeMutation = useMutation({
    mutationKey: ['solanadapp', 'close', { cluster, account }],
    mutationFn: () => program.methods.close().accounts({ solanadapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accounts.refetch()
    },
  })

  const decrementMutation = useMutation({
    mutationKey: ['solanadapp', 'decrement', { cluster, account }],
    mutationFn: () => program.methods.decrement().accounts({ solanadapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const incrementMutation = useMutation({
    mutationKey: ['solanadapp', 'increment', { cluster, account }],
    mutationFn: () => program.methods.increment().accounts({ solanadapp: account }).rpc(),
    onSuccess: (tx) => {
      transactionToast(tx)
      return accountQuery.refetch()
    },
  })

  const setMutation = useMutation({
    mutationKey: ['solanadapp', 'set', { cluster, account }],
    mutationFn: (value: number) => program.methods.set(value).accounts({ solanadapp: account }).rpc(),
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
