import { ProjectId, UnixTime } from '@l2beat/shared'

import { ProjectDiscovery } from '../discovery/ProjectDiscovery'
import { CONTRACTS } from '../layer2s/common'
import { Bridge } from './types'

const discovery = new ProjectDiscovery('amarok')

export const amarok: Bridge = {
  type: 'bridge',
  id: ProjectId('amarok'),
  display: {
    name: 'Connext Amarok',
    slug: 'amarok',
    description:
      'Connext Amarok is a multilayered system that aggregates various native AMBs in an Hub-and-Spoke architecture with Ethereum being the Hub receiving\
    messages from other domains. Amarok implements a liquidity network on top of its Hub-and-Spoke architecture.',
    links: {
      apps: ['https://bridge.connext.network/', 'https://connextscan.io/'],
      websites: ['https://blog.connext.network/'],
      documentation: ['https://docs.connext.network/'],
      repositories: [
        'https://github.com/connext',
        'https://github.com/CoinHippo-Labs/connext-bridge',
      ],
      socialMedia: [
        'https://twitter.com/ConnextNetwork',
        'https://discord.gg/connext',
      ],
    },
  },
  milestones: [
    {
      name: 'Connext Amarok mainnet deployment',
      link: 'https://blog.connext.network/connexts-amarok-upgrade-is-live-683099d61cbb',
      date: '2023-02-02T00:00:00Z',
      description: 'Connext Amarok mainnet deployment.',
    },
    {
      name: 'Connext Amarok announced',
      link: 'https://blog.connext.network/announcing-the-amarok-network-upgrade-5046317860a4',
      date: '2022-05-11T00:00:00Z',
      description:
        'The new, modular architecture for Connext Amarok has been announced.',
    },
  ],
  config: {
    escrows: [
      {
        address: discovery.getContract('ConnextBridge').address,
        sinceTimestamp: new UnixTime(1671625595),
        tokens: ['USDC', 'WETH'],
      },
    ],
  },
  technology: {
    canonical: false,
    category: 'Liquidity Network',
    destination: ['Gnosis', 'Optimism', 'Arbitrum', 'Polygon', 'BSC'],
    principleOfOperation: {
      name: 'Principle of operation',
      description:
        'Messages from various domains are aggregated into one message root and are periodically sent to Ethereum using native AMBs. Note that for Optimistic Rollups (Arbitrum, Optimism)\
      the AMB is only used as a transport layer, but 7-day delay is being ignored. Upon being delivered to Ethereum these message roots are\
      subsequently aggregated again into a root-of-root of messages before being delivered to their destination domains. Each message can be optimistically fast-forwarded by a network of Routers that will\
      front liquidity (if the message is a token transfer) or post a bond (if the message is a xChain call). Upon receiving the message root via native AMBs Connext Amarok bridge will\
      reconciles messages and return bond to the Routers. There is a configurable delay programmed into the RootManager contract and the SpokeConnectors\
      receiving messages. During the delay period a whitelisted set of Watchers can pause the bridge if the fraudulent message passed via AMB is detected.',
      references: [],
      risks: [],
    },
    validation: {
      name: 'Validation via Native AMBs',
      description:
        'Messages on the source chain are send perdiodically to the Ethereum chain via native AMB. Once they arrive on Etherum, they can be send from Ethereum, again\
        via native AMB, to the destination chain. Token transfers can be fronted by Routers providing liquidity. Similarly arbitrary messages can be sped up. Watchers provide\
        additional protection in case native AMB gets compromised and forges the message. For optimistic rollups (Optimism, Arbitrum) their native AMB is used but\
        7-day dispute window is ignored. For BSC (Binance Chain) MutltiChain AMB is used.',
      references: [],
      risks: [
        {
          category: 'Users can be censored if',
          text: 'watchers disconnect certain connectors or pause the whole bridge for no reason.',
          isCritical: false,
        },
        {
          category: 'Funds can be stolen if',
          text: 'native AMBs that Amarok uses allow for passing forged messages and this is not caught by Watchers.',
          isCritical: false,
        },
        {
          category: 'Funds can be stolen if',
          text: 'connectors to optimistic rollups (Optimism, Arbitrum) receive a fraudulent message within 7-day fraud-proof window.',
          isCritical: true,
        },
      ],
    },
  },
  contracts: {
    addresses: [
      {
        ...discovery.getMainContractDetails('ConnextBridge'),
        description:
          'The main Connext Amarok contract. Following Diamond design patter, it contains multiple Facets that implement\
        various parts of the bridge functionality.',
      },
      {
        ...discovery.getMainContractDetails('RootManager'),
        description:
          'Contract responsible for maintaining list of domains and building root-of-roots of messages. It keeps tracks of all hub connectors that connect to specific domain.',
      },
      {
        ...discovery.getMainContractDetails('WatcherManager'),
        description:
          'Contract maintaining a list of Watchers able to stop the bridge if fraud is detected.',
      },
      {
        ...discovery.getMainContractDetails('MainnetSpokeConnector'),
        description:
          'Contract that receives messages from other Domains on Ethereum.',
      },
      {
        ...discovery.getMainContractDetails('MultichainHubConnector'),
        description:
          'Contract for sending/receiving messages from mainnet to Binance Smart Chain via Multichain AMB.',
      },
      {
        ...discovery.getMainContractDetails('PolygonHubConnector'),
        description:
          'Contract for sending/receiving messages from mainnet to Polygon via Polygon FxChannel AMB.',
      },
      {
        ...discovery.getMainContractDetails('GnosisHubConnector'),
        description:
          'Contract for sending/receiving messages from mainnet to Gnosis via Gnosis AMB.',
      },
      {
        ...discovery.getMainContractDetails('OptimismHubConnector'),
        description:
          'Contract for sending/receiving messages from mainnet to Optimism via Optimism AMB transport layer. Note that it reads messages from Optimism\
        as soon as Optimism state root is recorded on Ethereum w/out waiting for the 7-day fraud proof delay window.',
      },
      {
        ...discovery.getMainContractDetails('ArbitrumHubConnector'),
        description:
          'Contract for sending/receiving messages from mainnet to Optimism via Arbitrum AMB transport layer. Note that it reads messages from Arbitrum\
        as soon as Arbitrum state root is recorded on Ethereum w/out waiting for the 7-day fraud proof delay window.',
      },
    ],
    risks: [CONTRACTS.UPGRADE_NO_DELAY_RISK],
  },
  permissions: [
    {
      name: 'Connext MultiSig',
      description:
        '3/3 MultiSig. Owner of the main Connext Amarok Bridge Diamond Proxy. Can upgrade the functionality of any system component with no delay. Maintains the list of Watchers.',
      accounts: [
        {
          address: discovery.getContract('ConnextBridgeOwner').address,
          type: 'MultiSig',
        },
      ],
    },
    {
      name: 'Watchers',
      description:
        'Permissioned set of actors who can pause certain bridge components. On Ethereum L1 Watchers can pause RootManager and MainnetSpokeConnector, i.e. modules \
        receiving messages. They can also remove connector from the RootManager. List of watchers is maintained by the Connext MultiSig.',
      accounts: discovery.getPermissionedAccountsList(
        'WatcherManager',
        'WATCHERS',
      ),
    },
    {
      name: 'Sequencers',
      description:
        'Permissioned set of actors that sequence routers request to forward liquidity.',
      accounts: discovery.getPermissionedAccountsList(
        'ConnextBridge',
        'SEQUENCERS',
      ),
    },
    {
      name: 'Relayers',
      description:
        'Permissioned set of actors who can perform certain bridge operations.',
      accounts: discovery.getPermissionedAccountsList(
        'ConnextBridge',
        'RELAYERS',
      ),
    },
    {
      name: 'Routers',
      description:
        'Permissioned set of actors who can forward liquidity and speed-up message delivery.',
      accounts: discovery.getPermissionedAccountsList(
        'ConnextBridge',
        'ROUTERS',
      ),
    },
  ],
  riskView: {
    validatedBy: {
      value: 'Various AMBs',
      description:
        'For BNB Multichain is used, for other chains their native AMBs are used.',
      sentiment: 'warning',
    },
    sourceUpgradeability: {
      value: 'YES',
      description: 'Connext Amarok can be upgraded by 3/3 MultiSig',
      sentiment: 'bad',
    },
  },
}