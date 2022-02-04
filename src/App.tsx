import './styles/App.css'
import twitterLogo from './assets/twitter-logo.svg'
import React, { SyntheticEvent, useEffect, useState } from 'react'
import * as eth from './utils/ethereum'

// Constants
const TWITTER_HANDLE = 'littlemooon'
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`
const OPENSEA_LINK = `https://testnets.opensea.io/assets/${process.env.REACT_APP_CONTRACT_ADDRESS}/`
const RARIBLE_LINK = `https://rinkeby.rarible.com/token/${process.env.REACT_APP_CONTRACT_ADDRESS}/`

export default function App() {
  const [loading, setLoading] = useState<string | undefined>()
  const [currentAccount, setCurrentAccount] = useState<string | undefined>()
  const [hash, setHash] = useState<string | undefined>()

  /**
   * Update connected account from the blockchain
   */
  async function updateConnectedAccount() {
    const account = await eth.getConnectedAccount()
    setCurrentAccount(account)
  }

  /**
   * Get the current account on mount
   */
  useEffect(() => {
    updateConnectedAccount()
  }, [])

  /**
   * Handle login
   */
  async function onConnectWallet() {
    setLoading('Connecting wallet...')
    const account = await eth.connectWallet()
    setCurrentAccount(account)
    setLoading(undefined)
  }

  /**
   * Handle minting and loading state
   */
  async function onMint(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault()

    setLoading('Requesting mooon...')
    const response = await eth.mint()

    setLoading('Minting mooon...')
    await response?.txn.wait()

    const hash = response?.txn.hash
    if (hash) {
      setHash(hash)
      console.log(
        `Mined, see transaction: https://rinkeby.etherscan.io/tx/${hash}`
      )
    }

    setLoading(undefined)
  }

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Mooon Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your Mooon today.
          </p>
          {currentAccount ? (
            <form onSubmit={onMint}>
              <button
                type="submit"
                className="cta-button connect-wallet-button"
                disabled={!!loading}
              >
                {loading || 'Mint NFT'}
              </button>
            </form>
          ) : (
            <button
              className="cta-button connect-wallet-button"
              onClick={onConnectWallet}
              disabled={!!loading}
            >
              {loading || 'Connect Wallet'}
            </button>
          )}
          <a
            href={`https://rinkeby.etherscan.io/tx/${hash}`}
            target="_blank"
            rel="noreferrer"
          >
            {hash}
          </a>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built on 🌍 by ${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  )
}
