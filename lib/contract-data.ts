import { Contract, JsonRpcProvider } from "ethers"
import savingCircleAbi from "@/lib/abi/savingcircle.sol.abi.json"
import { getSepoliaRpcUrl } from "@/lib/rpc"
import { withRpcThrottle } from "@/lib/rpc-throttle"
import { getSharedJsonRpcProvider } from "@/lib/shared-provider"

export type CircleContractData = {
  address: string
  name: string
  currRound: number
  numRounds: number
  installmentSize: number
  numUsers: number
  protocolTokenRewardPerInstallment: number
  maxProtocolTokenInAuction: number
  timePerRound: number
  startTime: number
  nextRoundToPay: number
  roundDeadline: number
}

export async function fetchCircleContractData(address: string, provider?: JsonRpcProvider): Promise<CircleContractData> {
  const rpc = getSepoliaRpcUrl()
  const resolvedProvider = provider ?? getSharedJsonRpcProvider(rpc)
  const contract = new Contract(address, savingCircleAbi, resolvedProvider)

  const [
    name,
    currRoundBn,
    numRoundsBn,
    installmentSizeBn,
    numUsersBn,
    protocolRewardBn,
    maxAuctionBn,
    timePerRoundBn,
    startTimeBn,
    nextRoundToPayBn,
  ] = await Promise.all([
    withRpcThrottle(() => contract.name()),
    withRpcThrottle(() => contract.currRound()),
    withRpcThrottle(() => contract.numRounds()),
    withRpcThrottle(() => contract.installmentSize()),
    withRpcThrottle(() => contract.numUsers()),
    withRpcThrottle(() => contract.protocolTokenRewardPerInstallment()),
    withRpcThrottle(() => contract.maxProtocolTokenInAuction()),
    withRpcThrottle(() => contract.timePerRound()),
    withRpcThrottle(() => contract.startTime()),
    withRpcThrottle(() => contract.nextRoundToPay()),
  ])

  let roundDeadlineBn: bigint
  try {
    roundDeadlineBn = await withRpcThrottle(() => contract.roundDeadline(currRoundBn))
  } catch {
    roundDeadlineBn = startTimeBn + timePerRoundBn * (currRoundBn + BigInt(1))
  }

  return {
    address,
    name,
    currRound: Number(currRoundBn),
    numRounds: Number(numRoundsBn),
    installmentSize: Number(installmentSizeBn),
    numUsers: Number(numUsersBn),
    protocolTokenRewardPerInstallment: Number(protocolRewardBn),
    maxProtocolTokenInAuction: Number(maxAuctionBn),
    timePerRound: Number(timePerRoundBn),
    startTime: Number(startTimeBn),
    nextRoundToPay: Number(nextRoundToPayBn),
    roundDeadline: Number(roundDeadlineBn),
  }
}


