import { ethers } from 'ethers'
import abi from './MooonNFT.json'

type Contract = any
const contractAddress = process.env.REACT_APP_CONTRACT_ADDRESS

/**
 * Function to return ethereum global
 */
export function getEth() {
  if (window.ethereum) {
    return window.ethereum
  } else {
    throw new Error(
      "Ethereum object doesn't exist! Make sure you have metamask!"
    )
  }
}

/**
 * Request account connection with the users wallet
 */
export async function connectWallet() {
  try {
    const ethereum = getEth()

    const accounts = await ethereum.request({
      method: 'eth_requestAccounts',
    })

    // Setup listener! This is for the case where a user comes to our site
    // and connected their wallet for the first time.
    listenToMint()

    return accounts[0]
  } catch (error) {
    console.error(error)
  }
}

/**
 * Query the blockchain for the connected account
 */
export async function getConnectedAccount(): Promise<string | undefined> {
  try {
    const ethereum = getEth()

    const accounts = await ethereum.request({ method: 'eth_accounts' })

    if (accounts.length !== 0) {
      const account = accounts[0]
      console.log('Found an authorized account:', account)

      // Setup listener! This is for the case where a user comes to our site
      // and ALREADY had their wallet connected + authorized.
      listenToMint()

      return account
    }
  } catch (error) {
    console.error(error)
  }
}

/**
 * Create an instance of the contract
 */
function getContract(): Contract {
  const ethereum = getEth()
  const provider = new ethers.providers.Web3Provider(ethereum)
  const signer = provider.getSigner()

  if (contractAddress) {
    const contract = new ethers.Contract(contractAddress, abi.abi, signer)

    return contract
  } else {
    throw new Error('No contract address configured')
  }
}

/*
 * Create a method that gets all waves from your contract
 */
export async function mint(
  contract = getContract()
): Promise<
  { contract: Contract; txn: ReturnType<Contract['wave']> } | undefined
> {
  try {
    /*
     * Execute the actual wave from your smart contract
     */
    const txn = await contract.makeMooon()

    return {
      contract,
      txn,
    }
  } catch (error) {
    console.error(error)
  }
}

/*
 * Create a method that gets all waves from your contract
 */
export async function listenToMint(
  contract = getContract()
): Promise<{ contract: Contract } | undefined> {
  try {
    // This will essentially "capture" our event when our contract throws it.
    // If you're familiar with webhooks, it's very similar to that!
    contract.on('NewMooonMinted', (from: string, tokenId: any) => {
      console.log(from, tokenId.toNumber())
      alert(
        `Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${contractAddress}/${tokenId.toNumber()}`
      )
    })

    return {
      contract,
    }
  } catch (error) {
    console.error(error)
  }
}
