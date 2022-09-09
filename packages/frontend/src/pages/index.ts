import { BridgeDescription, Layer2 } from '@l2beat/config'
import { ApiMain } from '@l2beat/types'

import { getBridgesRiskPage } from './bridges-risk'
import { config } from './config'
import { getDonatePage } from './donate'
import { getFaqPage } from './faq'
import { getMetaImagePages } from './meta-images'
import { outputPages } from './output'
import { Page } from './Page'
import { getProjectPages } from './projects'
import { getRiskPage } from './risk'
import { getTvlPage } from './tvl'

export async function renderPages(
  projects: Layer2[],
  bridges: BridgeDescription[],
  apiMain: ApiMain,
) {
  const pages: Page[] = []

  pages.push(getRiskPage(projects, apiMain))
  pages.push(getTvlPage(projects, apiMain))
  pages.push(getFaqPage())
  pages.push(await getDonatePage())
  pages.push(...getProjectPages(projects, apiMain))
  pages.push(...getMetaImagePages(projects, apiMain))
  if (config.showBridgePages) {
    pages.push(getBridgesRiskPage(bridges))
  }

  outputPages(pages)
}